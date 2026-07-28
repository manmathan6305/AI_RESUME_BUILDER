import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../config';
import {
  Upload,
  FileText,
  Target,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Loader2,
  Sparkles,
  ChevronRight,
  BarChart3,
  RotateCcw,
  ArrowRight,
  ClipboardPaste,
  Briefcase,
  AlertCircle,
  TrendingUp,
  Award,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ATSResult {
  ats_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  suggestions: string[];
}

// ─── Sample Data ─────────────────────────────────────────────────────────────

const SAMPLE_RESUME = `John Smith
john.smith@email.com | +1 (555) 123-4567 | San Francisco, CA
linkedin.com/in/johnsmith | github.com/johnsmith

PROFESSIONAL SUMMARY
Results-driven Software Engineer with 4+ years of experience building scalable web applications using React, Node.js, and Python. Passionate about clean code, performance optimization, and delivering user-centric products in Agile environments.

EXPERIENCE
Senior Frontend Engineer | TechCorp Inc. | Jan 2022 – Present
• Led migration of legacy jQuery codebase to React 18, reducing page load time by 40%
• Built reusable component library used across 3 product teams, improving dev velocity by 30%
• Integrated REST APIs and GraphQL endpoints; collaborated closely with backend engineers

Software Engineer | StartupXYZ | Jun 2020 – Dec 2021
• Developed Python FastAPI microservices serving 100K+ daily requests
• Implemented CI/CD pipelines using GitHub Actions and Docker, cutting deploy time by 60%
• Mentored 2 junior engineers; conducted code reviews and pair programming sessions

EDUCATION
B.Sc. Computer Science | University of California, Berkeley | 2016 – 2020

SKILLS
React, TypeScript, JavaScript, Node.js, Python, FastAPI, REST APIs, GraphQL,
Docker, Kubernetes, AWS (EC2, S3, Lambda), PostgreSQL, MongoDB, Git, Agile/Scrum

CERTIFICATIONS
AWS Certified Developer – Associate | 2023`;

const SAMPLE_JD = `Senior Software Engineer – Frontend
Acme Technologies | San Francisco, CA (Hybrid)

About the Role:
We are looking for a Senior Software Engineer to join our growing product team. You will build
beautiful, performant React applications and collaborate with a cross-functional team of designers,
product managers, and backend engineers.

Responsibilities:
• Design and deliver high-quality React/TypeScript features end-to-end
• Optimize application performance (Core Web Vitals, bundle size, lazy loading)
• Write comprehensive unit and integration tests (Jest, React Testing Library)
• Participate in code reviews, architecture discussions, and sprint planning
• Mentor junior engineers and promote engineering best practices

Required Skills:
• 4+ years of frontend engineering experience
• Expert-level React and TypeScript
• Strong understanding of REST APIs and state management (Redux, Zustand)
• Experience with CI/CD workflows and Docker
• Excellent communication skills and Agile experience

Nice to Have:
• GraphQL experience
• AWS or GCP cloud experience
• Contributions to open-source projects`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 75) return { text: 'text-emerald-400', ring: '#10b981', label: 'Excellent', gradient: 'from-emerald-500 to-teal-400', bg: 'from-emerald-950/60 to-emerald-900/20', border: 'border-emerald-500/30' };
  if (score >= 55) return { text: 'text-amber-400',  ring: '#f59e0b', label: 'Good',      gradient: 'from-amber-500 to-yellow-400',  bg: 'from-amber-950/60 to-amber-900/20',   border: 'border-amber-500/30'  };
  if (score >= 35) return { text: 'text-orange-400', ring: '#f97316', label: 'Fair',      gradient: 'from-orange-500 to-red-400',     bg: 'from-orange-950/60 to-orange-900/20', border: 'border-orange-500/30' };
  return            { text: 'text-red-400',    ring: '#ef4444', label: 'Poor',      gradient: 'from-red-600 to-rose-400',       bg: 'from-red-950/60 to-red-900/20',       border: 'border-red-500/30'    };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

// Stepper indicator at the top
function StepIndicator({ current }: { current: number }) {
  const steps = [
    { n: 1, label: 'Resume'      },
    { n: 2, label: 'Job Details' },
    { n: 3, label: 'Results'     },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => (
        <React.Fragment key={s.n}>
          <motion.div
            initial={false}
            animate={{ scale: current === s.n ? 1.08 : 1 }}
            className="flex flex-col items-center gap-1.5"
          >
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
              current > s.n
                ? 'bg-violet-600 border-violet-600 text-white'
                : current === s.n
                  ? 'border-violet-500 text-violet-300 bg-violet-500/10'
                  : 'border-white/10 text-white/20 bg-white/3'
            }`}>
              {current > s.n ? <CheckCircle2 className="w-4 h-4" /> : s.n}
            </div>
            <span className={`text-xs font-medium transition-colors ${current >= s.n ? 'text-white/70' : 'text-white/20'}`}>
              {s.label}
            </span>
          </motion.div>
          {i < steps.length - 1 && (
            <div className={`h-px w-16 mx-2 mb-5 transition-colors duration-500 ${current > s.n ? 'bg-violet-500' : 'bg-white/10'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Animated SVG score ring
function ScoreMeter({ score }: { score: number }) {
  const R = 80, stroke = 12;
  const r = R - stroke / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const { text, ring, label, gradient } = scoreColor(score);

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1,   opacity: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.1 }}
        className="relative"
      >
        {/* Outer glow */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-xl scale-110`} />
        <svg width={R * 2 + stroke} height={R * 2 + stroke} className="-rotate-90 relative">
          <circle cx={R + stroke / 2} cy={R + stroke / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
          <motion.circle
            cx={R + stroke / 2} cy={R + stroke / 2} r={r}
            fill="none" stroke={ring} strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={circ}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <CountUp target={score} className={`text-5xl font-black ${text}`} />
          <span className="text-xs text-white/30 font-medium mt-0.5">/ 100</span>
        </div>
      </motion.div>
      <motion.span
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className={`text-sm font-bold px-4 py-1.5 rounded-full bg-gradient-to-r ${gradient} text-white shadow-lg`}
      >
        {label} Match
      </motion.span>
    </div>
  );
}

// Animated count-up number
function CountUp({ target, className }: { target: number; className: string }) {
  const [val, setVal] = useState(0);
  React.useEffect(() => {
    let start = 0;
    const duration = 1400;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const prog = Math.min((timestamp - start) / duration, 1);
      setVal(Math.round(prog * target));
      if (prog < 1) requestAnimationFrame(step);
    };
    const timer = setTimeout(() => requestAnimationFrame(step), 300);
    return () => clearTimeout(timer);
  }, [target]);
  return <span className={className}>{val}</span>;
}

// Keyword chip
function Chip({ label, variant, delay = 0 }: { label: string; variant: 'matched' | 'missing'; delay?: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.7, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.06 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-default select-none ${
        variant === 'matched'
          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
          : 'bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20'
      } transition-colors`}
    >
      {variant === 'matched' ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <XCircle className="w-3 h-3 shrink-0" />}
      {label}
    </motion.span>
  );
}

// Drop-zone upload area
function DropZone({ onText }: { onText: (t: string, name: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setUploading(true);
    setUploadErr('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_URL}/extract-text`, { method: 'POST', body: fd });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok || data.error) {
        let msg = data.error || data.detail || `Upload failed (${res.status})`;
        
        if (msg.includes("scanned") || msg.includes("No text extracted")) {
           msg = "This looks like a scanned resume. Please paste manually.";
        }
        throw new Error(msg);
      }
      
      if (!data.text) {
        throw new Error('The server returned no extracted text.');
      }
      
      onText(data.text, file.name);
    } catch (e: unknown) {
      setUploadErr(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [onText]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div>
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        animate={{ borderColor: dragging ? '#7c3aed' : 'rgba(255,255,255,0.1)', backgroundColor: dragging ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.02)' }}
        className="relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border border-dashed cursor-pointer transition-all group"
      >
        <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} />

        {uploading ? (
          <>
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            <p className="text-sm text-violet-300 font-medium">Extracting text…</p>
          </>
        ) : (
          <>
            <motion.div
              animate={{ scale: dragging ? 1.15 : 1 }}
              className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/15 transition-colors"
            >
              <Upload className="w-6 h-6 text-violet-400" />
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                Drop your file here
              </p>
              <p className="text-xs text-white/30 mt-1">Supports PDF, DOCX, TXT</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/20">
              <div className="h-px w-12 bg-white/10" />
              or click to browse
              <div className="h-px w-12 bg-white/10" />
            </div>
          </>
        )}
      </motion.div>
      {uploadErr && (
        <p className="flex items-center gap-1.5 mt-2 text-xs text-red-400"><AlertCircle className="w-3.5 h-3.5" />{uploadErr}</p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ATSAnalyzer: React.FC = () => {
  // State
  const [step, setStep]               = useState<1 | 2 | 3>(1);
  const [resumeText, setResumeText]   = useState('');
  const [uploadedName, setUploadedName] = useState('');
  const [jobRole, setJobRole]         = useState('');
  const [jobDesc, setJobDesc]         = useState('');
  const [result, setResult]           = useState<ATSResult | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  // Handlers
  const handleAnalyze = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescription: jobDesc,
          jobRole,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.error || `Server error (${res.status})`);
      }
      const data: ATSResult = await res.json().catch(() => ({} as ATSResult));
      if (!data || typeof data.ats_score !== 'number') {
        throw new Error('The server returned an invalid analysis response.');
      }
      setResult(data);
      setStep(3);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1); setResumeText(''); setUploadedName(''); setJobRole('');
    setJobDesc(''); setResult(null); setError('');
  };

  const canGoToStep2 = resumeText.trim().length > 50;
  const canAnalyze   = canGoToStep2 && (jobRole.trim() || jobDesc.trim());
  const { bg, border } = result ? scoreColor(result.ats_score) : { bg: '', border: '' };

  return (
    <div className="min-h-screen bg-[#080a14] text-white">

      {/* ── Ambient background orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full bg-violet-700/8 blur-[120px]" />
        <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full bg-indigo-600/6 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-cyan-700/5 blur-[120px]" />
      </div>

      {/* ── Hero header ── */}
      <div className="relative border-b border-white/5 bg-gradient-to-b from-violet-950/10 to-transparent">
        <div className="max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold tracking-wide mb-5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered · Groq LLaMA 3.3 70B · Real-time Analysis
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent"
          >
            ATS Resume Analyzer
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.14 }}
            className="text-white/40 max-w-lg mx-auto text-sm leading-relaxed"
          >
            Instantly score your resume against any job description. Get matched &amp; missing
            keywords, plus AI-powered suggestions to land more interviews.
          </motion.p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative max-w-4xl mx-auto px-4 py-10">

        {/* Stepper — only show on steps 1 & 2 */}
        {step < 3 && <StepIndicator current={step} />}

        <AnimatePresence mode="wait">

          {/* ═══════════════════════════════════════ STEP 1 — Resume ═══ */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="space-y-5"
            >
              {/* Card */}
              <div className="rounded-2xl bg-white/[0.03] border border-white/8 p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Your Resume</h2>
                    <p className="text-xs text-white/30">Upload a file or paste the text below</p>
                  </div>
                </div>

                {/* Drop zone */}
                <DropZone onText={(t, name) => { setResumeText(t); setUploadedName(name); }} />

                {/* Uploaded pill */}
                <AnimatePresence>
                  {uploadedName && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-medium">{uploadedName}</span> extracted successfully
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Divider */}
                <div className="flex items-center gap-3 text-xs text-white/20">
                  <div className="flex-1 h-px bg-white/6" />
                  or paste manually
                  <div className="flex-1 h-px bg-white/6" />
                </div>

                {/* Textarea */}
                <div className="relative">
                  <textarea
                    id="resume-textarea"
                    value={resumeText}
                    onChange={(e) => { setResumeText(e.target.value); setUploadedName(''); }}
                    placeholder={`Paste your resume content here…\n\nExample:\nJohn Smith | john@email.com | github.com/john\nSoftware Engineer · 4 years experience in React, Node.js, Python…`}
                    rows={12}
                    className="w-full rounded-xl text-sm text-white/80 placeholder-white/15 p-4 resize-none bg-white/[0.03] border border-white/8 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 hover:border-white/15 transition-all leading-relaxed"
                  />
                  <span className="absolute bottom-3 right-3 text-xs text-white/15 select-none">
                    {resumeText.length} chars
                  </span>
                </div>

                {/* Sample button */}
                <button
                  onClick={() => { setResumeText(SAMPLE_RESUME); setUploadedName(''); }}
                  className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  Use sample resume
                </button>
              </div>

              {/* Next button */}
              <div className="flex justify-end">
                <motion.button
                  id="step1-next-btn"
                  onClick={() => setStep(2)}
                  disabled={!canGoToStep2}
                  whileHover={{ scale: canGoToStep2 ? 1.02 : 1 }}
                  whileTap={{ scale: canGoToStep2 ? 0.97 : 1 }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-violet-900/30 transition-all"
                >
                  Next: Job Details
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════ STEP 2 — Job ═══════ */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="space-y-5"
            >
              <div className="rounded-2xl bg-white/[0.03] border border-white/8 p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Target Job</h2>
                    <p className="text-xs text-white/30">Tell us the role you're applying for</p>
                  </div>
                </div>

                {/* Job Role input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Job Role <span className="text-violet-400">*</span></label>
                  <input
                    id="job-role-input"
                    type="text"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    placeholder="e.g. Senior Software Engineer, Product Manager, Data Scientist…"
                    className="w-full rounded-xl text-sm text-white/80 placeholder-white/15 px-4 py-3 bg-white/[0.03] border border-white/8 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 hover:border-white/15 transition-all"
                  />
                </div>

                {/* Job Description textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Job Description <span className="text-white/20 font-normal normal-case">(optional but recommended)</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="job-description-textarea"
                      value={jobDesc}
                      onChange={(e) => setJobDesc(e.target.value)}
                      placeholder={`Paste the full job description…\n\nExample:\n• Design and deliver high-quality React/TypeScript features\n• Write tests using Jest and React Testing Library\n• Collaborate with cross-functional teams…`}
                      rows={12}
                      className="w-full rounded-xl text-sm text-white/80 placeholder-white/15 p-4 resize-none bg-white/[0.03] border border-white/8 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500/40 hover:border-white/15 transition-all leading-relaxed"
                    />
                    <span className="absolute bottom-3 right-3 text-xs text-white/15 select-none">
                      {jobDesc.length} chars
                    </span>
                  </div>
                  <button
                    onClick={() => setJobDesc(SAMPLE_JD)}
                    className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    Use sample job description
                  </button>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm"
                  >
                    <AlertCircle className="w-4.5 h-4.5 shrink-0" />{error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-white/5"
                >
                  ← Back
                </button>

                <motion.button
                  id="analyze-btn"
                  onClick={handleAnalyze}
                  disabled={!canAnalyze || loading}
                  whileHover={{ scale: canAnalyze && !loading ? 1.02 : 1 }}
                  whileTap={{ scale: canAnalyze && !loading ? 0.97 : 1 }}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-violet-900/30 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing resume…</span>
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4" />
                      <span>Analyze Resume</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════ STEP 3 — Results ══ */}
          {step === 3 && result && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* Results header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-white">Analysis Complete</h2>
                  <p className="text-xs text-white/30 mt-0.5">
                    {jobRole ? `Matched against "${jobRole}"` : 'Based on job description provided'}
                  </p>
                </div>
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/70 transition-colors px-3 py-2 rounded-lg hover:bg-white/5 font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Start Over
                </button>
              </div>

              {/* ── Score hero card ── */}
              <div className={`relative overflow-hidden rounded-2xl border ${border} bg-gradient-to-br ${bg} p-7`}>
                <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/3 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/2 blur-3xl" />

                <div className="relative flex flex-col sm:flex-row items-center gap-8">
                  <ScoreMeter score={result.ats_score} />

                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-white mb-1">ATS Compatibility Score</h3>
                      <p className="text-white/40 text-sm leading-relaxed">
                        Your resume matched <span className="text-emerald-400 font-semibold">{result.matched_keywords.length} keywords</span> and
                        is missing <span className="text-red-400 font-semibold">{result.missing_keywords.length} keywords</span>.
                        {result.ats_score < 60 && ' Address the suggestions below to significantly improve your chances.'}
                        {result.ats_score >= 60 && result.ats_score < 80 && ' A few targeted improvements can push your score higher.'}
                        {result.ats_score >= 80 && ' Great alignment — your resume is well-optimized for this role!'}
                      </p>
                    </div>

                    {/* Mini stat row */}
                    <div className="flex gap-5">
                      {[
                        { icon: <CheckCircle2 className="w-3.5 h-3.5" />, val: result.matched_keywords.length, label: 'Matched',     color: 'text-emerald-400' },
                        { icon: <XCircle      className="w-3.5 h-3.5" />, val: result.missing_keywords.length, label: 'Missing',     color: 'text-red-400'     },
                        { icon: <TrendingUp   className="w-3.5 h-3.5" />, val: result.suggestions.length,      label: 'Tips',        color: 'text-amber-400'   },
                      ].map((s, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <div className="w-px bg-white/10 self-stretch" />}
                          <div>
                            <div className={`flex items-center gap-1 ${s.color} font-extrabold text-2xl`}>
                              {s.val}
                            </div>
                            <div className={`flex items-center gap-1 text-xs ${s.color} opacity-70 mt-0.5`}>
                              {s.icon}{s.label}
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Keywords grid ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Matched */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <h4 className="font-bold text-emerald-300 text-sm">Matched Keywords</h4>
                    </div>
                    <span className="text-xs bg-emerald-500/15 text-emerald-300 px-2.5 py-0.5 rounded-full font-semibold">
                      {result.matched_keywords.length}
                    </span>
                  </div>
                  {result.matched_keywords.length === 0 ? (
                    <p className="text-white/20 text-xs italic">No matching keywords found. Consider adding more relevant skills.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {result.matched_keywords.map((kw, i) => (
                        <Chip key={i} label={kw} variant="matched" delay={0.05 * i} />
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* Missing */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28 }}
                  className="rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-5 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-red-400" />
                      <h4 className="font-bold text-red-300 text-sm">Missing Keywords</h4>
                    </div>
                    <span className="text-xs bg-red-500/15 text-red-300 px-2.5 py-0.5 rounded-full font-semibold">
                      {result.missing_keywords.length}
                    </span>
                  </div>
                  {result.missing_keywords.length === 0 ? (
                    <p className="text-white/20 text-xs italic">Excellent! No critical keywords are missing.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {result.missing_keywords.map((kw, i) => (
                        <Chip key={i} label={kw} variant="missing" delay={0.05 * i} />
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* ── Suggestions ── */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
                className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.04] p-5 space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-amber-300 text-sm">AI-Powered Suggestions</h4>
                  <span className="ml-auto text-xs bg-amber-500/15 text-amber-300 px-2.5 py-0.5 rounded-full font-semibold">
                    {result.suggestions.length} tips
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {result.suggestions.map((s, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.42 + 0.07 * i }}
                      className="flex items-start gap-3 text-sm text-white/60 leading-relaxed"
                    >
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-xs font-bold text-amber-400">
                        {i + 1}
                      </span>
                      {s}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* CTA footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
              >
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white/50 hover:text-white border border-white/8 hover:border-white/20 hover:bg-white/5 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Analyze Another Resume
                </button>
                <a
                  href="/form/personal"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-900/30 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                  Build Optimized Resume
                </a>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ATSAnalyzer;
