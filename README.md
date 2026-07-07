# 🚀 HirePrep AI — Resume Analyzer & Interview Coach

> An intelligent, full-stack AI application that bridges the gap between candidate resumes and job descriptions. HirePrep AI analyzes your profile, identifies skill gaps, generates ATS-optimized LaTeX resumes, and coaches you through a progressive interview simulator using the STAR method.

<br/>

## 📸 Preview

> Upload your CV → Get your ATS score → Download your tailored resume → Practice 18 interview questions with live AI scoring.

<br/>

---

## ✨ Features

### 📊 ATS Match Analysis
Upload a PDF resume and a target job description to instantly receive:
- ATS compatibility score
- Job match percentage
- Executive fit summary tailored to the target company

### 🔍 Skill Gap Identification
- Detects missing technical skills, soft skills, and tools required by the job description
- Ranks gaps by importance (Critical / Important / Nice-to-have)
- Generates a personalized step-by-step learning roadmap

### 📄 Dynamic LaTeX Resume Engine
- **Smart Injection** — Seamlessly integrates missing keywords into existing bullet points without fabricating experience
- **Professional Template** — Outputs a clean, ATS-optimized LaTeX document with proper formatting and section structure
- **Direct PDF Download** — Compiles LaTeX into a downloadable PDF via local MiKTeX/pdflatex engine
- **Overleaf Export** — Exposes raw LaTeX code for users who prefer to compile or edit in Overleaf

### 🎙️ Interactive Interview Simulator (Separate Page)
- Generates exactly **18 progressively difficult questions** across categories:
  - Behavioral · Technical · Situational · Company-Fit
- Questions are mapped strictly to the candidate's CV and the target job description
- Filter questions by category

### 🧠 AI Answer Evaluation (STAR Method)
- Practice answering any question directly in the app
- Receive instant AI feedback including:
  - Score out of 10
  - Confidence level
  - Strengths & missing points
  - STAR method breakdown (Situation / Task / Action / Result)
  - A fully polished model answer
  - Likely follow-up question from the interviewer

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router DOM, Axios |
| Backend | FastAPI, Python 3.9+, Uvicorn |
| AI Models | Groq API — LLaMA-3.3-70B (analysis) · LLaMA-3-8B (evaluation) |
| PDF Parsing | PyPDF |
| Resume Compilation | MiKTeX / TeX Live (`pdflatex`) |

---

## ⚙️ Prerequisites

Make sure the following are installed before you begin:

| Requirement | Notes |
|---|---|
| Node.js v18+ | [Download](https://nodejs.org/) |
| Python 3.9+ | [Download](https://python.org/) |
| MiKTeX (Windows) / MacTeX (macOS) / TeX Live (Linux) | Ensure `pdflatex` is added to your system PATH |
| Groq API Key | Get a free key at [console.groq.com](https://console.groq.com/) |

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/hassanbilal803-code/hireprep-ai.git
cd hireprep-ai
```

### 2. Backend Setup

```bash
cd "week 2/backend"
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` folder:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

Start the backend server:

```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd "week 2/frontend"
npm install
npm run dev
```

### 4. Open the App

Visit **http://localhost:5173** in your browser.

---

## 📋 How to Use

1. **Enter** the target company name
2. **Upload** your resume as a PDF
3. **Paste** the job description
4. Click **"Tailor Profile & Rewrite Code"**
5. Review your **ATS score**, **skill gaps**, and **tailored LaTeX resume**
6. **Download** the compiled PDF or copy the LaTeX for Overleaf
7. Click **"Open Interview Prep"** to access your 18 custom questions
8. Practice answers and get **instant AI feedback**

---

## 📁 Project Structure

```
Ai interview coach/
└── week 2/
    ├── backend/
    │   ├── main.py          # FastAPI app — all endpoints
    │   ├── requirements.txt
    │   └── .env             # Your API keys (never committed)
    └── frontend/
        ├── src/
        │   ├── pages/
        │   │   ├── Dashboard.jsx      # Upload + results page
        │   │   └── InterviewPrep.jsx  # 18 questions + practice
        │   ├── components/
        │   │   └── SkillsGap.jsx
        │   ├── context/
        │   │   └── WorkflowContext.jsx
        │   └── App.jsx
        ├── package.json
        └── vite.config.js
```

---

## 🔒 Security Notes

- API keys are stored in a `.env` file and are **never committed to GitHub**
- `.env` is listed in `.gitignore`
- The backend never exposes keys to the browser

---

## 👨‍💻 Author

**Hassan Bilal**
- GitHub: [@hassanbilal803-code](https://github.com/hassanbilal803-code)

---

## 📄 License

This project is for educational and portfolio purposes.
