from fastapi import FastAPI, File, UploadFile, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
import os
import json
import tempfile
import subprocess
import shutil
import re
from pypdf import PdfReader
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 

app = FastAPI()

# Add this block right here, before your other code/routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # This tells the backend to accept requests from anywhere
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GLOBAL STATE ---
LAST_EXTRACTED_RESUME = ""
LAST_JOB_DESCRIPTION = ""
LAST_COMPANY_NAME = ""
LAST_ANALYSIS_DATA = {}  # NEW: Stores the skill gaps to pass to the LaTeX generator

class AnswerRequest(BaseModel):
    question: str
    user_answer: str

class LatexRequest(BaseModel):
    latex_code: str

def extract_pdf_text(file) -> str:
    pdf_reader = PdfReader(file)
    text = ""
    for page in pdf_reader.pages:
        t = page.extract_text()
        if t:
            text += t
    return text

def cleanup_temp_dir(tmpdirname: str):
    shutil.rmtree(tmpdirname, ignore_errors=True)

@app.get("/")
def home():
    return {"status": "Online", "message": "HirePrep Backend Is Operational"}

@app.post("/process-workflow")
async def process_workflow(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    company_name: str = Form(...)
):
    global LAST_EXTRACTED_RESUME, LAST_JOB_DESCRIPTION, LAST_COMPANY_NAME, LAST_ANALYSIS_DATA
    try:
        LAST_EXTRACTED_RESUME = extract_pdf_text(file.file)
        LAST_JOB_DESCRIPTION = job_description
        LAST_COMPANY_NAME = company_name

        prompt = f"""
You are an expert hiring manager and AI career coach. Analyze this candidate resume against the job requirements for {company_name}.
Provide a highly detailed analysis, skill gap breakdown, and exactly 18 progressively difficult interview questions based on their profile and the job.

Original Resume:
{LAST_EXTRACTED_RESUME}

Target Job Description:
{LAST_JOB_DESCRIPTION}

Return ONLY a valid JSON object matching this exact structure:
{{
    "ats_score": 96,
    "match_analysis": "<Detailed summary of company fit>",
    "skill_gap_analysis": {{
        "missing_technical_skills": ["skill 1", "skill 2"],
        "missing_soft_skills": ["skill 1", "skill 2"],
        "missing_tools": ["tool 1", "tool 2"],
        "experience_gaps": ["gap 1", "gap 2"],
        "priority_skills": ["priority 1", "priority 2"],
        "recommended_learning_path": ["Step 1", "Step 2"]
    }},
    "roadmap": ["Step 1: ...", "Step 2: ..."],
    "interview_questions": [
        {{
            "id": "q1",
            "question": "<The question>",
            "category": "<Technical|Behavioral|Resume-based|Project-based|System Design|Company-specific|Problem Solving>",
            "difficulty": "<Beginner|Intermediate|Advanced|Expert>",
            "why_asked": "<Why the interviewer is asking this>",
            "ideal_answer_points": ["Point 1", "Point 2", "Point 3"]
        }}
    ]
}}
"""
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a JSON compliance utility. Always return valid JSON and exactly 18 interview questions."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        
        parsed_data = json.loads(completion.choices[0].message.content)
        LAST_ANALYSIS_DATA = parsed_data # Save the missing skills globally
        return parsed_data
        
    except Exception as e:
        return {"error": str(e)}

@app.post("/generate-full-latex")
async def generate_full_latex():
    global LAST_EXTRACTED_RESUME, LAST_JOB_DESCRIPTION, LAST_COMPANY_NAME, LAST_ANALYSIS_DATA
    try:
        # Pull the missing skills we found in the first step
        skill_gaps = LAST_ANALYSIS_DATA.get("skill_gap_analysis", {})
        missing_tech = skill_gaps.get("missing_technical_skills", [])
        missing_soft = skill_gaps.get("missing_soft_skills", [])
        
        system_instruction = (
            "You are an expert human resume translator and ATS optimizer. Your task is to rewrite the user's raw resume into a professional LaTeX document.\n\n"
            "CRITICAL OPERATIONAL RULES:\n"
            "1. NO Markdown blocks (```). Just raw LaTeX code.\n"
            "2. YOU MUST USE THE CANDIDATE'S ACTUAL DATA. Do not ever output 'Not Provided'. Read the raw resume text and extract their real job titles, companies, dates, education, and projects. If a section is truly empty, omit the section entirely instead of writing 'Not Provided'.\n"
            "3. INTEGRATE MISSING SKILLS: You will be given a list of Missing Technical and Soft Skills. You MUST inject these seamlessly into the 'Skills' section, the 'Professional Summary', and a 'Currently Learning' section to boost the ATS score.\n"
            "4. Escape ALL LaTeX special characters (e.g., \\%, \\&, \\$, \\#).\n"
            "5. Start directly with \\documentclass and terminate with \\end{document}.\n"
            "6. STRICT PACKAGE RESTRICTION: You are FORBIDDEN from using `fontspec`, `pdfescape`, `hyperref`, `fontenc` or any obscure packages. ONLY use standard built-in pdflatex packages: inputenc, geometry, xcolor, titlesec, enumitem, and helvet."
        )

        prompt = f"""
Please rewrite this candidate's resume into a high-end, ATS-optimized LaTeX template.

INTEGRATION TASK - ADD THESE MISSING SKILLS TO THE RESUME:
Missing Technical Skills to add: {', '.join(missing_tech) if missing_tech else 'None'}
Missing Soft Skills to add: {', '.join(missing_soft) if missing_soft else 'None'}

CANDIDATE REAL RESUME DATA (Extract all experience, education, and projects directly from this text):
{LAST_EXTRACTED_RESUME}

Target Job Requirements:
{LAST_JOB_DESCRIPTION}

Target Company: {LAST_COMPANY_NAME}
"""
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=5000
        )
        
        raw_content = completion.choices[0].message.content
        
        match = re.search(r'\\documentclass.*?\\end\{document\}', raw_content, re.DOTALL)
        if match:
            clean_code = match.group(0)
        else:
            clean_code = raw_content.strip()
            if clean_code.startswith("```"):
                clean_code = clean_code.replace("```latex", "").replace("```", "").strip()
            if clean_code.endswith("```"):
                clean_code = clean_code[:-3].strip()
                
        return {"latex_code": clean_code}
    except Exception as e:
        return {"error": str(e)}

@app.post("/compile-pdf")
async def compile_pdf(request: LatexRequest, background_tasks: BackgroundTasks):
    try:
        tmpdir = tempfile.mkdtemp()
        tex_file_path = os.path.join(tmpdir, "resume.tex")
        pdf_file_path = os.path.join(tmpdir, "resume.pdf")

        with open(tex_file_path, "w", encoding="utf-8") as f:
            f.write(request.latex_code)

        for _ in range(2):
            process = subprocess.run(
                ["pdflatex", "-interaction=nonstopmode", "-output-directory", tmpdir, tex_file_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                shell=True 
            )

        if not os.path.exists(pdf_file_path):
            background_tasks.add_task(cleanup_temp_dir, tmpdir)
            return {"error": "PDF compilation failed", "logs": process.stdout}

        background_tasks.add_task(cleanup_temp_dir, tmpdir)
        return FileResponse(pdf_file_path, media_type="application/pdf", filename="Optimized_Resume.pdf")
        
    except FileNotFoundError:
        return {"error": "LaTeX compiler (pdflatex) is not installed on the server."}
    except Exception as e:
        return {"error": str(e)}

@app.post("/evaluate-answer")
async def evaluate_answer(request: AnswerRequest):
    try:
        prompt = f"""
You are an expert technical interviewer. Evaluate the candidate's answer to the following question.

Question: {request.question}
Candidate's Answer: {request.user_answer}

Return ONLY a valid JSON object matching this structure:
{{
    "score": 85,
    "strengths": ["strength 1", "strength 2"],
    "missing_points": ["missing 1", "missing 2"],
    "improved_answer": "<A STAR-method aligned answer of professional, their version>",
    "follow_up_question": "<A deeper logical next question test to understanding>"
}}
"""
        completion = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {"role": "system", "content": "You are a JSON compliance utility."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        return {"error": str(e)}