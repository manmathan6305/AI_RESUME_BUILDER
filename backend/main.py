import os
import re
import json
import html
import time
from io import BytesIO
from typing import List, Optional

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

import pdfplumber
import docx

from groq import Groq
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER

# --- Configuration ---

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL   = "llama-3.3-70b-versatile"   # fast + high quality

groq_client: Optional[Groq] = None
if GROQ_API_KEY:
    groq_client = Groq(api_key=GROQ_API_KEY)
    print(f"[OK] Groq client initialised -- model: {GROQ_MODEL}")
else:
    print("[WARN] GROQ_API_KEY not found in environment variables")

app = FastAPI(title="AI Resume Generator API")

# Configure CORS
FRONTEND_ORIGINS = os.getenv("FRONTEND_ORIGINS", "").split(",")
DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
]
ALLOWED_ORIGINS = list(dict.fromkeys(DEFAULT_ORIGINS + [o.strip() for o in FRONTEND_ORIGINS if o.strip()]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",  # Allow all Vercel preview/prod deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---

class PersonalInfo(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: str
    address: str
    summary: str
    linkedin: Optional[str] = None
    github: Optional[str] = None

class Education(BaseModel):
    id: str
    degree: str
    institution: str
    startYear: str
    endYear: str
    gpa: Optional[str] = None

class Experience(BaseModel):
    id: str
    jobTitle: str
    company: str
    startDate: str
    endDate: str
    responsibilities: List[str]
    current: bool

class TextEnhancementRequest(BaseModel):
    text: str
    # 'summary', 'experience', 'responsibility', 'general'
    type: str
    jobDescription: Optional[str] = None

class ResumeData(BaseModel):
    personalInfo: PersonalInfo
    education: List[Education]
    experience: List[Experience]
    skills: List[str]
    extra: List[str]

class ATSOptimizationRequest(BaseModel):
    resumeData: ResumeData
    jobDescription: str

class ATSScoreRequest(BaseModel):
    resume_text: str
    job_description: str

# --- Core Groq helper ---

def groq_chat(prompt: str, system: str = "You are a professional resume writing assistant.") -> str:
    """
    Call Groq chat completions and return the assistant message text.
    Raises an exception on failure — callers handle retries / fallbacks.
    """
    if groq_client is None:
        raise RuntimeError("Groq client is not initialised. Check GROQ_API_KEY.")
    completion = groq_client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": prompt},
        ],
        temperature=0.4,
        max_tokens=1024,
    )
    return completion.choices[0].message.content.strip()


# --- Helper Functions ---

def build_prompt(text: str, text_type: str = "general", job_description: str = "") -> str:
    """
    Build a strict ATS Resume Optimization Engine prompt.

    text_type options:
      - 'summary'                        → Rewrite as 2-3 impactful ATS-friendly lines
      - 'experience' or 'responsibility' → Convert to action-verb bullet points
      - 'general'                        → Fix grammar and clarity only
    """
    if text_type == "summary":
        type_rules = """TYPE-SPECIFIC RULES:
- Rewrite into 2-3 lines maximum
- Make it impactful and ATS-friendly
- Start with a strong professional opener (e.g. "Results-driven...", "Innovative...", "Detail-oriented...")
- Naturally weave in relevant keywords from the job description if provided"""
    elif text_type in ("experience", "responsibility"):
        type_rules = """TYPE-SPECIFIC RULES:
- Convert into bullet points (one per line)
- Each bullet MUST start with a strong action verb (e.g. Developed, Designed, Led, Optimized, Delivered, Implemented, Automated, Streamlined)
- Add measurable impact where possible (%, time saved, count, performance gain)
- Keep the same number of bullet points as the input
- Naturally weave in relevant keywords from the job description if provided"""
    else:  # general
        type_rules = """TYPE-SPECIFIC RULES:
- Fix ALL grammar, spelling, and punctuation mistakes
- Improve clarity and professional tone
- Do NOT add or remove information — only polish what is there"""

    jd_section = (
        f"JOB DESCRIPTION (for keyword matching):\n{job_description.strip()}"
        if job_description.strip()
        else "JOB DESCRIPTION: (none provided)"
    )

    return f"""You are an ATS Resume Optimization Engine.

Your job is to strictly correct and enhance resume content.

---

INPUT:
{text}

TYPE:
{text_type}

{jd_section}

---

TASKS (MANDATORY):

1. Fix ALL grammar and spelling mistakes (ZERO tolerance — not a single error allowed)
2. Improve clarity, professionalism, and impact
3. Use strong action verbs where applicable
4. Keep content concise and realistic
5. Preserve original meaning (DO NOT invent fake experience or fabricate details)
6. If a job description is provided:
   - Extract the most relevant keywords and skills
   - Naturally integrate them into the output without keyword stuffing

---

{type_rules}

---

STRICT OUTPUT RULES:

- Return ONLY the improved text
- NO explanations
- NO headings
- NO markdown symbols (no **, no ##, no ```)
- NO extra commentary or labels
- NO additional content beyond the enhanced text itself

---

SELF-CHECK (MANDATORY BEFORE OUTPUT):

- Ensure zero grammar mistakes
- Ensure zero spelling mistakes
- Ensure clean and readable format
- Ensure all rules above are followed strictly

If ANY rule is violated → FIX before output.

---

FINAL OUTPUT:
Return only the improved version of the input."""


def enhance_resume_with_groq(resume_data: ResumeData) -> dict:
    """
    Use Groq to enhance resume content for ATS compatibility.
    Returns a dict with enhanced summary and experience bullet lists.
    Falls back to originals on any error.
    """
    if not groq_client:
        return {
            "summary": resume_data.personalInfo.summary,
            "experiences": {exp.id: exp.responsibilities for exp in resume_data.experience},
        }

    # 1. Enhance professional summary
    enhanced_summary = resume_data.personalInfo.summary
    try:
        summary_prompt = build_prompt(
            text=resume_data.personalInfo.summary,
            text_type="summary",
        )
        enhanced_summary = groq_chat(summary_prompt)
    except Exception as e:
        print(f"[generate-resume] Error enhancing summary: {e}")

    # 2. Enhance experience descriptions
    enhanced_experiences: dict = {}
    for exp in resume_data.experience:
        raw = "\n".join(f"- {r}" for r in exp.responsibilities)
        exp_prompt = build_prompt(
            text=f"Job Title: {exp.jobTitle}\nCompany: {exp.company}\nResponsibilities:\n{raw}",
            text_type="experience",
        )
        try:
            result = groq_chat(exp_prompt)
            bullets = [
                line.lstrip("•-* ").strip()
                for line in result.split("\n")
                if line.strip()
            ]
            enhanced_experiences[exp.id] = bullets if bullets else exp.responsibilities
        except Exception as e:
            print(f"[generate-resume] Error enhancing exp {exp.id}: {e}")
            enhanced_experiences[exp.id] = exp.responsibilities

    return {"summary": enhanced_summary, "experiences": enhanced_experiences}


def format_resume_text(resume_data: ResumeData) -> str:
    """Format resume data into plain text (used by /optimize-ats)."""
    pi = resume_data.personalInfo
    contact_parts = [pi.email, pi.phone, pi.address]
    if pi.linkedin: contact_parts.append(pi.linkedin)
    if pi.github:   contact_parts.append(pi.github)
    contact_line = " | ".join(p for p in contact_parts if p)

    text = (
        f"{pi.firstName.upper()} {pi.lastName.upper()}\n"
        f"{contact_line}\n\n"
        f"PROFESSIONAL SUMMARY\n{pi.summary}\n\nEXPERIENCE\n"
    )
    for exp in resume_data.experience:
        text += f"\n{exp.jobTitle}\n{exp.company} | {exp.startDate} - {'Present' if exp.current else exp.endDate}\n"
        for resp in exp.responsibilities:
            text += f"• {resp}\n"

    text += "\nEDUCATION\n"
    for edu in resume_data.education:
        text += f"\n{edu.degree}\n{edu.institution} | {edu.startYear} - {edu.endYear}"
        if edu.gpa:
            text += f" | GPA: {edu.gpa}"
        text += "\n"

    text += "\nSKILLS\n" + ", ".join(resume_data.skills)

    if resume_data.extra:
        text += "\n\nADDITIONAL INFORMATION\n"
        for item in resume_data.extra:
            text += f"• {item}\n"

    return text


def create_ats_friendly_pdf(resume_data: ResumeData, enhanced_content: dict) -> BytesIO:
    """Create an ATS-friendly PDF resume using ReportLab."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=letter,
        rightMargin=72, leftMargin=72,
        topMargin=72, bottomMargin=18,
    )

    elements = []
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CustomTitle", parent=styles["Heading1"],
        fontSize=20, textColor=colors.HexColor("#1a1a1a"),
        spaceAfter=6, alignment=TA_CENTER, fontName="Helvetica-Bold",
    )
    heading_style = ParagraphStyle(
        "CustomHeading", parent=styles["Heading2"],
        fontSize=12, textColor=colors.HexColor("#2c3e50"),
        spaceAfter=6, spaceBefore=12, fontName="Helvetica-Bold",
    )
    normal_style = ParagraphStyle(
        "CustomNormal", parent=styles["Normal"],
        fontSize=10, textColor=colors.HexColor("#333333"),
        spaceAfter=6, alignment=TA_LEFT, fontName="Helvetica",
    )

    def esc(t: str) -> str:
        return html.escape(str(t)) if t else ""

    # Header
    elements.append(Paragraph(esc(f"{resume_data.personalInfo.firstName.upper()} {resume_data.personalInfo.lastName.upper()}"), title_style))
    elements.append(Spacer(1, 0.1 * inch))

    # Contact line
    contact_parts = [resume_data.personalInfo.email, resume_data.personalInfo.phone]
    if resume_data.personalInfo.address:
        contact_parts.append(resume_data.personalInfo.address)
    contact = " | ".join(p for p in contact_parts if p)
    elements.append(Paragraph(esc(contact), normal_style))

    # Professional links (LinkedIn / GitHub)
    links_parts = []
    if resume_data.personalInfo.linkedin:
        links_parts.append(resume_data.personalInfo.linkedin)
    if resume_data.personalInfo.github:
        links_parts.append(resume_data.personalInfo.github)
    if links_parts:
        elements.append(Paragraph(esc(" | ".join(links_parts)), normal_style))
    elements.append(Spacer(1, 0.2 * inch))

    # Summary
    summary_text = enhanced_content.get("summary", resume_data.personalInfo.summary)
    if summary_text:
        elements.append(Paragraph("PROFESSIONAL SUMMARY", heading_style))
        elements.append(Paragraph(esc(summary_text), normal_style))
        elements.append(Spacer(1, 0.1 * inch))

    # Experience
    if resume_data.experience:
        elements.append(Paragraph("PROFESSIONAL EXPERIENCE", heading_style))
        for exp in resume_data.experience:
            job_header = f"<b>{esc(exp.jobTitle)}</b>"
            if exp.company:
                job_header += f" | {esc(exp.company)}"
            elements.append(Paragraph(job_header, normal_style))
            elements.append(Paragraph(esc(f"{exp.startDate} - {'Present' if exp.current else exp.endDate}"), normal_style))
            elements.append(Spacer(1, 0.05 * inch))
            for resp in enhanced_content.get("experiences", {}).get(exp.id, exp.responsibilities):
                elements.append(Paragraph(f"• {esc(resp)}", normal_style))
            elements.append(Spacer(1, 0.1 * inch))

    # Education
    if resume_data.education:
        elements.append(Paragraph("EDUCATION", heading_style))
        for edu in resume_data.education:
            elements.append(Paragraph(f"<b>{esc(edu.degree)}</b>", normal_style))
            edu_line = f"{esc(edu.institution)} | {edu.startYear} - {edu.endYear}"
            if edu.gpa:
                edu_line += f" | GPA: {edu.gpa}"
            elements.append(Paragraph(edu_line, normal_style))
            elements.append(Spacer(1, 0.1 * inch))

    # Skills
    if resume_data.skills:
        elements.append(Paragraph("SKILLS", heading_style))
        elements.append(Paragraph(", ".join(esc(s) for s in resume_data.skills), normal_style))
        elements.append(Spacer(1, 0.1 * inch))

    # Additional Info
    if resume_data.extra:
        elements.append(Paragraph("ADDITIONAL INFORMATION", heading_style))
        for item in resume_data.extra:
            elements.append(Paragraph(f"• {esc(item)}", normal_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer


# --- API Endpoints ---

@app.get("/")
async def health_check():
    """Health check endpoint — used by Render to confirm the service is alive."""
    groq_status = "connected" if groq_client else "not connected (GROQ_API_KEY missing)"
    return {
        "status": "ok",
        "service": "AI Resume Generator API",
        "model": GROQ_MODEL,
        "groq": groq_status,
    }


@app.post("/enhance-text")
async def enhance_text(request: TextEnhancementRequest):
    """Enhance specific text segments using the strict ATS Optimization Engine prompt via Groq."""
    if not request.text.strip():
        return {"enhancedText": ""}

    if not groq_client:
        return {"enhancedText": request.text}

    # Map frontend type aliases to canonical types
    canonical_type = request.type
    if request.type == "description":
        canonical_type = "experience"

    prompt = build_prompt(
        text=request.text,
        text_type=canonical_type,
        job_description=request.jobDescription or "",
    )

    # Retry up to 2 times on transient errors
    max_retries = 2
    for attempt in range(max_retries + 1):
        try:
            enhanced = groq_chat(prompt)
            return {"enhancedText": enhanced or request.text}
        except Exception as e:
            err_str = str(e)
            print(f"[enhance-text] Attempt {attempt + 1} error: {err_str[:200]}")

            # Detect rate limit — tell the client to back off
            if "429" in err_str or "rate_limit" in err_str.lower() or "quota" in err_str.lower():
                raise HTTPException(
                    status_code=429,
                    detail="Groq API rate limit reached. Please wait a moment and try again.",
                )

            if attempt == max_retries:
                raise HTTPException(
                    status_code=500,
                    detail=f"AI enhancement failed: {err_str[:200]}",
                )

            time.sleep(1)



# --- ATS Score Endpoint ---

@app.post("/ats-score")
async def ats_score(request: ATSScoreRequest):
    """
    Analyse a resume against a job description and return a structured ATS score report.
    Returns: ats_score, matched_keywords, missing_keywords, suggestions.
    """
    if not groq_client:
        return {
            "ats_score": 0,
            "matched_keywords": [],
            "missing_keywords": [],
            "suggestions": [
                "Set the GROQ_API_KEY environment variable in Render to enable AI-powered ATS analysis.",
                "You can still use the UI with the fallback response until the key is configured."
            ],
            "raw": "GROQ_API_KEY not configured"
        }

    if not request.resume_text.strip() or not request.job_description.strip():
        raise HTTPException(status_code=400, detail="resume_text and job_description are required")

    prompt = f"""RESUME:
{request.resume_text}

JOB DESCRIPTION:
{request.job_description}

---

TASKS (MANDATORY):

1. Extract important keywords from the job description
2. Extract relevant keywords from the resume
3. Compare both and identify:
   - matched keywords
   - missing keywords
4. Evaluate resume quality based on:
   - skills
   - action verbs
   - clarity
   - measurable impact

---

OUTPUT FORMAT (STRICT — FOLLOW EXACTLY):

ATS Score: <number out of 100>

Matched Keywords:
- keyword1
- keyword2
- keyword3

Missing Keywords:
- keyword1
- keyword2
- keyword3

Suggestions:
- Add missing technical skills from job description
- Include measurable achievements (%, time saved, performance)
- Improve use of action verbs and clarity

---

RULES:

- Be realistic in scoring (no random 90+ scores)
- Focus on technical skills, tools, and action verbs
- Keep output clean and structured
- Do NOT include explanations
- Do NOT add extra sections
- Ensure Suggestions section ALWAYS contains at least 3 points

---

SELF-CHECK:

- Ensure all sections are present
- Ensure Suggestions is NOT empty
- Ensure strict format is followed

If anything is missing → FIX before output.

Return ONLY the final output."""

    try:
        raw = groq_chat(prompt, system="You are a strict ATS Resume Scoring Engine. Follow the output format exactly.")
    except Exception as e:
        err_str = str(e)
        if "429" in err_str or "rate_limit" in err_str.lower():
            raise HTTPException(status_code=429, detail="Groq API rate limit reached. Please wait a moment.")
        raise HTTPException(status_code=500, detail=f"AI scoring failed: {err_str[:200]}")

    # --- Parse structured plain-text output ---

    def extract_score(text: str) -> int:
        match = re.search(r"ATS Score:\s*(\d+)", text, re.IGNORECASE)
        return int(match.group(1)) if match else 0

    def extract_list_section(text: str, header: str) -> list[str]:
        """
        Extract bullet-list items under a given section header.
        Stops at the next section header (a line NOT starting with -).
        """
        pattern = rf"{re.escape(header)}\s*\n((?:\s*-[^\n]+\n?)+)"
        match = re.search(pattern, text, re.IGNORECASE)
        if not match:
            return []
        block = match.group(1)
        items = [line.lstrip("- ").strip() for line in block.splitlines() if line.strip().startswith("-")]
        return [i for i in items if i]

    ats_score_val = extract_score(raw)
    matched   = extract_list_section(raw, "Matched Keywords:")
    missing   = extract_list_section(raw, "Missing Keywords:")
    suggestions = extract_list_section(raw, "Suggestions:")

    # Fallback: ensure suggestions is non-empty
    if not suggestions:
        suggestions = [
            "Add missing technical skills from the job description.",
            "Include measurable achievements (%, time saved, performance boost).",
            "Strengthen use of action verbs and improve overall clarity.",
        ]

    return {
        "ats_score": ats_score_val,
        "matched_keywords": matched,
        "missing_keywords": missing,
        "suggestions": suggestions,
        "raw": raw,   # keep raw for debugging
    }


@app.post("/optimize-ats")
async def optimize_ats(request: ATSOptimizationRequest):
    """Analyse and improve a resume against a job description via Groq."""
    if not groq_client:
        return {
            "analysis": "GROQ_API_KEY not configured"
        }

    try:
        resume_text = format_resume_text(request.resumeData)

        base_prompt = """You are an expert ATS Resume Optimization Engine.

Your job is to analyze and improve a resume based on a job description.

---

INPUT:
Resume:
{resume_text}

Job Description:
{job_description}

---

TASKS (MANDATORY):

1. Fix ALL grammar and spelling mistakes (ZERO errors allowed)
2. Improve clarity, impact, and professionalism
3. Use strong action verbs (Developed, Designed, Implemented, Optimized, Led)
4. Add measurable impact wherever possible (%, time saved, performance)
5. Extract and match keywords from the job description
6. Identify missing keywords
7. Rewrite summary and experience for ATS optimization

---

OUTPUT FORMAT (STRICT — FOLLOW EXACTLY):

ATS Score: <number out of 100>

Matched Keywords:
- keyword1
- keyword2
- keyword3

Missing Keywords:
- keyword1
- keyword2
- keyword3

Improved Summary:
<2-3 lines, ATS-optimized, grammatically correct>

Improved Experience Points:
- bullet point 1 (strong verb + impact + corrected grammar)
- bullet point 2
- bullet point 3

Suggestions:
- Add missing technical skills from job description
- Include measurable achievements (%, time saved, performance)
- Improve use of action verbs and clarity

---

RULES:

- Fix ALL grammar and spelling mistakes strictly
- Do NOT include explanations
- Do NOT add extra sections
- Do NOT change output format
- Ensure output is clean, structured, and readable

Return ONLY the final output."""

        prompt = base_prompt.replace("{resume_text}", resume_text).replace("{job_description}", request.jobDescription)
        analysis = groq_chat(prompt)
        return {"analysis": analysis}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[optimize-ats] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate-resume")
async def generate_resume_endpoint(resume: ResumeData):
    """Generate the full ATS-optimised resume PDF."""
    try:
        enhanced_content = enhance_resume_with_groq(resume)
        pdf_buffer = create_ats_friendly_pdf(resume, enhanced_content)
        headers = {
            "Content-Disposition": f'attachment; filename="resume_{resume.personalInfo.lastName}.pdf"'
        }
        return Response(content=pdf_buffer.getvalue(), headers=headers, media_type="application/pdf")
    except Exception as e:
        print(f"[generate-resume] Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate resume")


# --- File Text Extraction Endpoint ---

@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    """
    Accept a PDF, DOCX, or TXT upload and return its plain text content.
    Used by the ATS Analyzer's 'Upload Resume' button.
    """
    filename = (file.filename or "").lower()
    content  = await file.read()

    try:
        if filename.endswith(".pdf"):
            text_blocks = []
            with pdfplumber.open(BytesIO(content)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_blocks.append(page_text)
            text = "\n".join(text_blocks)

        elif filename.endswith(".docx"):
            document = docx.Document(BytesIO(content))
            text = "\n".join([para.text for para in document.paragraphs])

        elif filename.endswith(".txt"):
            text = content.decode("utf-8", errors="replace")

        else:
            return JSONResponse(status_code=400, content={"error": "Unsupported file type"})

        text = text.strip()
        if len(text) < 20:
            return JSONResponse(
                status_code=400, 
                content={"error": "No text extracted (possibly scanned or image-based file)"}
            )

        return {"text": text, "filename": file.filename}

    except HTTPException:
        raise
    except Exception as e:
        print(f"[extract-text] Error: {e}")
        return JSONResponse(status_code=500, content={"error": f"Text extraction failed: {str(e)[:200]}"})


# --- /analyze alias (clean public API for the ATS Analyzer UI) ---

class AnalyzeRequest(BaseModel):
    resumeText: str
    jobDescription: str
    jobRole: Optional[str] = None

@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    """
    Public-facing ATS analyzer endpoint called by the frontend.
    Combines jobRole + jobDescription and delegates to /ats-score logic.
    """
    # Merge job role into description for richer keyword context
    combined_jd = request.jobDescription
    if request.jobRole:
        combined_jd = f"Job Role: {request.jobRole}\n\n{combined_jd}".strip()

    if not request.resumeText.strip() or not combined_jd.strip():
        raise HTTPException(status_code=400, detail="resumeText and jobDescription / jobRole are required.")

    # Reuse shared scoring logic via the ATSScoreRequest model
    sub = ATSScoreRequest(resume_text=request.resumeText, job_description=combined_jd)
    return await ats_score(sub)


# --- Entry Point ---

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)