import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Edit2,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import { useResume } from '../../context/ResumeContext';
import LivePreview from '../../components/LivePreview';
import { buildResumeText } from '../../lib/buildResumePDF';
// NOTE: ResumePDF and pdf are dynamically imported inside handleDownload
// to avoid a parse-time crash caused by @react-pdf/renderer's CJS deps
// (base64-js, buffer) under Vite 8's strict ESM mode.
import API_URL from '../../config';

type ToastType = 'success' | 'error' | null;

/* ─────────────────────────────────────────────
   Tiny completion badge
───────────────────────────────────────────── */
const CompletionBadge: React.FC<{ percent: number }> = ({ percent }) => {
  const colour =
    percent >= 80
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : percent >= 50
      ? 'bg-amber-100 text-amber-700 border-amber-200'
      : 'bg-violet-100 text-violet-700 border-violet-200';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${colour}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          percent >= 80
            ? 'bg-emerald-500'
            : percent >= 50
            ? 'bg-amber-500'
            : 'bg-violet-500'
        }`}
      />
      {percent}% complete
    </span>
  );
};

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const Preview: React.FC = () => {
  const { resumeData, completionPercent } = useResume();
  const navigate = useNavigate();
  const resumeRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<{ type: ToastType; msg: string }>({
    type: null,
    msg: '',
  });

  const showToast = (type: ToastType, msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast({ type: null, msg: '' }), 4000);
  };

  /* ── PDF Download: @react-pdf/renderer vector export (dynamically loaded) ──
   *
   * Uses dynamic import() to load @react-pdf/renderer ONLY when the user
   * clicks Download.  This avoids a parse-time crash in Vite 8 caused by
   * @react-pdf/renderer's CJS dependencies (base64-js, buffer) not having
   * ESM-compatible default exports when loaded as static top-level imports.
   *
   * Benefits:
   *   • Page loads instantly (PDF engine is NOT included in the initial bundle)
   *   • On click: pure vector PDF generated entirely in-memory — no canvas
   *   • 100% selectable text, ATS-readable, real clickable hyperlinks
   *   • Cross-browser consistent output (same on Chrome/Firefox/Safari/Edge)
   */
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const fname =
        `${resumeData.personalInfo.firstName || 'Resume'}_` +
        `${resumeData.personalInfo.lastName || ''}.pdf`;

      // Dynamically import both the PDF engine and the resume component
      const [{ pdf }, { ResumePDF }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('../../lib/ResumePDF'),
      ]);

      // Render the React component tree to a PDF Blob in-memory
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(
        React.createElement(ResumePDF, { data: resumeData }) as any
      ).toBlob();

      // Trigger browser file download
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = fname;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('success', 'PDF downloaded — ATS-ready ✔');
    } catch (err) {
      console.error('[PDF] Download error:', err);
      showToast('error', 'Download failed — please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  /* ── Analyze in ATS Analyzer ──
   * Converts the current resume data to plain text (same format that
   * pdfplumber would extract from the downloaded PDF) and passes it to
   * the ATS Analyzer page via sessionStorage, pre-populating Step 1.
   * This lets users analyse without needing to download and re-upload.
   */
  const handleAnalyzeATS = () => {
    const text = buildResumeText(resumeData);
    sessionStorage.setItem('ats_prefill_text', text);
    navigate('/ats-analyzer');
  };

  /* ── AI-Enhanced PDF: calls backend /generate-resume ── */
  const handleGenerateAIPDF = async () => {
    setIsGenerating(true);
    try {
      const {
        personalInfo,
        education,
        experience,
        projects,
        skills,
        certifications,
        achievements,
        extra,
        declaration,
      } = resumeData;

      const allSkills = [
        ...(skills.languages || []),
        ...(skills.frameworks || []),
        ...(skills.tools || []),
        ...(skills.concepts || []),
      ];

      const payload = {
        personalInfo,
        education,
        experience,
        projects,
        skills: allSkills,
        certifications,
        achievements: achievements.filter(a => a.trim()),
        extra: extra.filter(e => e.trim()),
        declaration: declaration || '',
      };

      const response = await fetch(`${API_URL}/generate-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || `Server error: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${personalInfo.firstName || 'Resume'}_AI_Enhanced.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('success', 'AI-enhanced PDF generated!');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'AI generation failed';
      showToast('error', msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const hasData =
    resumeData.personalInfo.firstName && resumeData.personalInfo.lastName;

  /* ── Empty state ── */
  if (!hasData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <FileText className="w-10 h-10 text-violet-600 dark:text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No resume data yet
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm leading-relaxed">
            Fill in your personal information to start building your
            professional resume.
          </p>
          <button
            onClick={() => navigate('/form/personal')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5"
          >
            Start Building
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    );
  }

  /* ── Main preview page ── */
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-100 dark:bg-gray-950"
    >
      {/* ── Top toolbar ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-800 shadow-sm sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            {/* Left: Title + breadcrumb */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-900 dark:bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white dark:text-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                  <span>Resume Builder</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Preview & Export</span>
                </div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                    {resumeData.personalInfo.firstName} {resumeData.personalInfo.lastName}
                  </h1>
                  <CompletionBadge percent={completionPercent} />
                </div>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Edit */}
              <button
                onClick={() => navigate('/form/personal')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 border border-slate-200 dark:border-gray-700 transition-all"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>

              {/* Download PDF */}
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isDownloading ? 'Downloading…' : 'Download PDF'}
              </button>

              {/* Analyze ATS */}
              <button
                id="analyze-ats-btn"
                onClick={handleAnalyzeATS}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700/40 transition-all"
              >
                <BarChart3 className="w-4 h-4" />
                Analyze ATS
              </button>

              {/* AI-Enhanced PDF */}
              <motion.button
                whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                whileTap={{ scale: isGenerating ? 1 : 0.97 }}
                onClick={handleGenerateAIPDF}
                disabled={isGenerating}
                className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition-all ${
                  isGenerating
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-violet-500/30 hover:shadow-violet-500/50 hover:shadow-lg'
                }`}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {isGenerating ? 'Generating…' : 'AI-Enhanced PDF'}
              </motion.button>
            </div>
          </div>

          {/* AI info strip */}
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Sparkles className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
            <span>
              <span className="font-semibold text-violet-600 dark:text-violet-400">AI-Enhanced PDF</span>
              {' '}uses Groq LLaMA 3.3 70B to rewrite bullet points with stronger action verbs, ATS keywords, and quantified impact — free &amp; instant.
            </span>
          </div>
        </div>
      </div>

      {/* ── Paper preview area ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Export quality notice */}
        <div className="flex items-center justify-center gap-2 mb-6 text-xs text-gray-400 dark:text-gray-500">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>ATS-optimised layout · Standard A4 · Single column · Print-ready</span>
        </div>

        {/* A4 paper card — LivePreview is self-sizing at 794px so we
             just provide the drop-shadow wrapper around it */}
        <div className="mx-auto" style={{ width: '794px' }}>
          <div
            className="relative bg-white"
            ref={resumeRef}
            style={{
              boxShadow:
                '0 2px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.04)',
              borderRadius: '2px',
            }}
          >
            <LivePreview />
          </div>
        </div>

        {/* Bottom spacer for comfort */}
        <div className="h-16" />
      </div>

      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {toast.type && (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-medium ${
              toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Preview;