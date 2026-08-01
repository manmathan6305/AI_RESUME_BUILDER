# 🤖 AI Resume Builder

An intelligent, full-stack resume building platform powered by **Groq LLaMA 3.3 70B AI**. Build professional, ATS-optimized resumes in minutes — with AI-enhanced content, real-time preview, and automated ATS scoring.

> **Live Demo:** Run locally by following the setup steps below.  
> **GitHub:** [https://github.com/yourusername/AI-Resume-builder](https://github.com/yourusername/AI-Resume-builder)

---

## 📋 Table of Contents

1. [What is this project?](#-what-is-this-project)
2. [Features](#-features)
3. [How It Works](#-how-it-works)
4. [Tech Stack](#-tech-stack)
5. [Project Structure](#-project-structure)
6. [API Reference](#-api-reference)
7. [Setup & Installation](#-setup--installation)
8. [Usage Guide](#-usage-guide)
9. [Environment Variables](#-environment-variables)
10. [Troubleshooting](#-troubleshooting)

---

## 💡 What is this project?

The **AI Resume Builder** is a web application that helps users:

- **Build professional resumes** step-by-step through an intuitive guided form
- **Enhance text with AI** — click "AI Enhance" on any field to make descriptions sharper and more professional
- **Analyze resumes with ATS Scorer** — upload or paste your resume, provide a job description, and get an ATS compatibility score with matched/missing keywords and improvement tips
- **Download PDFs** — generate a clean, ATS-friendly PDF resume ready to submit to employers

**Who is it for?** Students, freshers, and professionals who want to create job-ready resumes quickly without writing everything from scratch.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Sign in via Email/Password or Google OAuth |
| 📝 **Multi-step Form** | 9-step guided form covering all resume sections |
| 🤖 **AI Text Enhancement** | Rewrite any resume section to sound more professional |
| 👁️ **Live Preview** | Real-time resume preview as you type |
| 🎯 **ATS Score Analyzer** | Upload a PDF/DOCX/TXT resume and score it against a job description |
| 📊 **Keyword Analysis** | Identify matched and missing keywords vs. the job posting |
| 💡 **AI Suggestions** | Actionable tips to improve your resume score |
| 📄 **PDF Download** | Download an ATS-friendly PDF ready to apply with |
| 🌙 **Dark Mode** | Toggle between light and dark themes |
| 📱 **Responsive** | Works on mobile, tablet, and desktop |

---

## 🔄 How It Works

### Path 1 — Build a Resume from Scratch

```
Sign In → Fill Form (9 Steps) → Live Preview → Generate AI PDF → Download
```

**The 9 Form Steps:**
1. **Personal Info** — Name, email, phone, address, professional summary
2. **Education** — Degree, institution, years, GPA
3. **Experience** — Job title, company, dates, responsibilities
4. **Projects** — Project name, description, tech stack
5. **Skills** — Technical and soft skills (tag input)
6. **Certifications** — Certification name, issuer, year
7. **Achievements** — Awards, recognitions
8. **Extra Info** — Hobbies, languages, volunteer work
9. **Declaration** — Self-declaration statement

At any step, click **"AI Enhance"** on a text field to let the AI rewrite it professionally.

---

### Path 2 — ATS Resume Analyzer

```
Upload/Paste Resume → Enter Job Description → Analyze → View Score + Keywords + Tips
```

1. **Upload** a PDF, DOCX, or TXT resume (or paste the text directly)
2. **Enter the job role** and paste the **job description**
3. Click **Analyze Resume**
4. Get your **ATS Score (0–100)**, **matched keywords**, **missing keywords**, and **AI improvement suggestions**

---

## 🛠️ Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| React 18 | UI component framework |
| TypeScript | Type-safe JavaScript |
| Vite | Dev server and build tool |
| React Router v6 | Client-side navigation |
| Tailwind CSS | Styling and dark mode |
| Framer Motion | Animations and page transitions |
| Lucide React | Icons |
| Firebase Auth | User authentication (Google + Email) |

### Backend
| Tool | Purpose |
|---|---|
| FastAPI | REST API framework (Python) |
| Uvicorn | ASGI server |
| Groq SDK | LLaMA 3.3 70B AI API client |
| ReportLab | PDF generation |
| pdfplumber | Extract text from PDFs |
| python-docx | Extract text from DOCX files |
| Pydantic v2 | Request/response validation |
| python-dotenv | Environment variable management |

### AI & Cloud
| Tool | Purpose |
|---|---|
| Groq Cloud | Ultra-fast LLM inference (10x faster than OpenAI) |
| LLaMA 3.3 70B | The open-source AI model running all enhancements & scoring |
| Firebase | Authentication and analytics |

---

## 📁 Project Structure

```
AI-Resume-builder/
│
├── backend/                    # Python FastAPI server
│   ├── main.py                 # All API routes and AI logic
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # API keys (never commit this!)
│
└── web/                        # React frontend
    ├── public/
    └── src/
        ├── components/         # Reusable UI components
        │   ├── SmartTextArea.tsx    # Textarea with AI Enhance button
        │   ├── LivePreview.tsx      # Real-time resume preview
        │   ├── FormLayout.tsx       # Shared form wrapper
        │   ├── Navbar.tsx           # Navigation bar
        │   ├── ProgressBar.tsx      # Form step progress indicator
        │   ├── TagInput.tsx         # Chip-style tag input for skills
        │   └── ProtectedRoute.tsx   # Auth guard for private routes
        │
        ├── pages/              # Page-level components
        │   ├── Home.tsx             # Landing page
        │   ├── Auth.tsx             # Login/Register page
        │   ├── ATSAnalyzer.tsx      # ATS Score Analyzer page
        │   ├── Contact.tsx          # Contact page
        │   ├── formSteps/           # 9 form step pages
        │   └── preview/             # Resume preview + download
        │
        ├── context/            # Global state management
        │   ├── ResumeContext.tsx    # All form data state
        │   ├── AuthContext.tsx      # User authentication state
        │   └── ThemeContext.tsx     # Dark/light mode state
        │
        ├── App.tsx             # Root component + routing
        ├── firebase.ts         # Firebase config and exports
        └── main.tsx            # React entry point
```

---

## 📡 API Reference

All endpoints are hosted at `http://127.0.0.1:8000`

### `POST /enhance-text`
Enhance a resume text field using AI.

**Request:**
```json
{
  "text": "Worked on web development projects",
  "type": "experience",
  "jobDescription": "optional job description for context"
}
```
`type` options: `summary`, `experience`, `responsibility`, `general`

**Response:**
```json
{
  "enhancedText": "Developed and deployed 3 full-stack web applications using React and Node.js, improving page load performance by 35%."
}
```

---

### `POST /extract-text`
Extract raw text from an uploaded resume file.

**Request:** `multipart/form-data` with a file field named `file`  
**Supported formats:** `.pdf`, `.docx`, `.txt`

**Response (success):**
```json
{
  "text": "John Smith\njohn@email.com\n...",
  "filename": "resume.pdf"
}
```

**Response (failure):**
```json
{
  "error": "No text extracted (possibly scanned or image-based file)"
}
```

---

### `POST /analyze`
Analyze a resume against a job description and return ATS score.

**Request:**
```json
{
  "resumeText": "full resume text here...",
  "jobDescription": "job description here...",
  "jobRole": "Senior Software Engineer"
}
```

**Response:**
```json
{
  "ats_score": 74,
  "matched_keywords": ["React", "TypeScript", "Docker"],
  "missing_keywords": ["GraphQL", "AWS", "Kubernetes"],
  "suggestions": [
    "Add GraphQL experience section.",
    "Include measurable impact metrics.",
    "Strengthen action verbs in experience section."
  ]
}
```

---

### `POST /generate-resume`
Generate an ATS-friendly PDF from structured resume data. Returns binary PDF.

---

### `POST /optimize-ats`
Full ATS optimization — analyzes resume and returns improved content.

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** v18+ and **npm**
- **Python** 3.9+
- A **Groq API key** — get one free at [https://console.groq.com](https://console.groq.com)

---

### Step 1 — Clone the repository
```bash
git clone https://github.com/yourusername/AI-Resume-builder.git
cd AI-Resume-builder
```

---

### Step 2 — Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create your .env file
echo GROQ_API_KEY=your_groq_api_key_here > .env

# Start the backend server
python main.py
```
The backend will be running at: **http://127.0.0.1:8000**

---

### Step 3 — Frontend Setup
```bash
cd web

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```
The frontend will be running at: **http://localhost:5173**

---

### Step 4 — Open in Browser
Open **http://localhost:5173** in your browser. Sign up/log in and start building your resume!

---

## 🖥️ Usage Guide

### Building a Resume
1. Visit the app and click **"Start Building"** or **"Get Started Now"**
2. Sign in with Google or create an account
3. Fill in each form step — all fields marked with `*` are required
4. On any text area, click the **✨ AI Enhance** button to improve your writing instantly
5. After all steps, go to **Preview** to see your resume
6. Click **"Generate AI Resume"** to download the ATS-optimized PDF

### Using the ATS Analyzer
1. Navigate to **ATS Analyzer** from the navbar
2. **Step 1 — Resume:** Upload a `.pdf`, `.docx`, or `.txt` file, OR paste your resume text manually
3. **Step 2 — Job Details:** Enter the job role title and paste the job description
4. Click **"Analyze Resume"**
5. View your **ATS Score**, **Matched/Missing Keywords**, and **AI Suggestions**
6. Use the results to update your resume and re-analyze until the score improves

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | Your Groq API key from console.groq.com |

---

## 🔧 Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| "Cannot reach AI service" | Backend not running | Run `python main.py` in `/backend` |
| "Failed to fetch" | IPv6/IPv4 conflict on Windows | Already fixed — frontend uses `127.0.0.1` |
| "Could not extract text from file" | Scanned/image-based PDF | Use a digital PDF or paste text manually |
| Backend 500 error on file upload | `pdfplumber` not installed | Run `pip install -r requirements.txt` |
| Groq 429 error | Rate limit exceeded | Wait 10–30 seconds and try again |
| Google sign-in popup blocked | Browser popup blocker | Allow popups for localhost in browser settings |

---

## 🧠 How the AI Works

The AI features use **Groq's LLaMA 3.3 70B** model — a powerful open-source large language model.

### AI Text Enhancement
Every text field sends a carefully engineered **prompt** to the AI. The prompt includes:
- The original text to improve
- The context type (e.g., "experience" or "summary")
- A mandatory **self-check** instruction so the AI fixes its own mistakes before responding
- Strict output rules (no markdown, no explanations — just the improved text)

### ATS Scoring
The AI reads the resume text + job description and returns a structured analysis:
- **ATS Score** — how well the resume matches the job (out of 100)
- **Matched Keywords** — skills and terms in both resume and job description
- **Missing Keywords** — important terms from the job description absent from the resume
- **Suggestions** — specific improvements to raise the score

The output is plain text with a defined format, which the backend parses using **regex** into clean JSON for the frontend.

---

## 📄 License

This project is open source. Feel free to clone, modify, and build upon it.

---

## 👤 Author

**Your Name** — [GitHub](https://github.com/yourusername)
