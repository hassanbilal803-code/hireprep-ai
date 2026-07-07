# HirePrep AI Coach

HirePrep AI Coach is an intelligent career preparation dashboard designed to bridge the gap between your resume and your dream job. By leveraging Groq-powered AI, the platform analyzes uploaded CVs against specific job descriptions to instantly tailor application assets and generate highly relevant, sequential mock interview questions, giving candidates a realistic, edge-of-your-seat interview practice experience.

---

## The Three Stages of the Engine

### 1. Asset Upload & Analysis
In this initial stage, the user uploads their current CV (PDF/Docx format) and pastes the target job description. The system parses the text, extracts key skills, and maps out critical gaps between the user's background and the job requirements.

### 2. Tailoring & Calibration
The platform runs a calibration engine powered by Groq LLMs. It aligns the user's experience with the target role, highlighting transferable skills (such as translating Systems Engineering principles into AI/ML frameworks) and prepares the custom context for the interview phase.

### 3. Sequential Mock Interview
Users enter a dynamic, step-by-step interview room consisting of 15 to 20 highly relevant technical, behavioral, and scenario-based questions. The engine serves questions sequentially, evaluating user responses in real-time to simulate a live hiring loop.

---

## Tech Stack

* **Frontend:** React.js, Vite, Tailwind CSS (for modern UI styling)
* **Backend:** FastAPI / Python, Uvicorn (ASGI server)
* **AI Engine:** Groq API (LLM inference), Python Dotenv (environment management)

---

## Local Setup Instructions

Follow these steps to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites
* Ensure you have [Node.js](https://nodejs.org/) installed.
* Ensure you have [Python 3.10+](https://www.python.org/) installed.

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/hireprep-ai-coach.git](https://github.com/yourusername/hireprep-ai-coach.git)
cd hireprep-ai-coach