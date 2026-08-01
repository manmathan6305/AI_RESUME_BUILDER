import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, FileText, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LivePreview from './LivePreview';
import { useResume } from '../context/ResumeContext';

interface FormLayoutProps {
  children: React.ReactNode;
}

// Completion meter displayed on top of the form panel
const CompletionMeter: React.FC<{ percent: number }> = ({ percent }) => {
  const color =
    percent >= 80 ? 'from-emerald-500 to-green-400' :
    percent >= 50 ? 'from-amber-500 to-yellow-400' :
                   'from-primary-500 to-violet-500';

  return (
    <div className="mb-4 px-1">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Resume Strength
        </span>
        <span className={`text-xs font-bold ${percent >= 80 ? 'text-emerald-600' : percent >= 50 ? 'text-amber-600' : 'text-primary-600'}`}>
          {percent}%
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-2 rounded-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      {percent === 100 && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Your resume is complete!
        </p>
      )}
    </div>
  );
};

// Auto-save toast — shows briefly after any save
const AutoSaveToast: React.FC<{ visible: boolean }> = ({ visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium"
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        Auto-saved
      </motion.div>
    )}
  </AnimatePresence>
);

const FormLayout: React.FC<FormLayoutProps> = ({ children }) => {
  const { resumeData, completionPercent } = useResume();
  const [showPreview, setShowPreview] = useState(true);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const prevDataRef = useRef(resumeData);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show "Auto-saved" toast whenever resumeData changes
  useEffect(() => {
    if (prevDataRef.current !== resumeData) {
      prevDataRef.current = resumeData;
      setAutoSaved(true);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setAutoSaved(false), 2000);
    }
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [resumeData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          
          {/* Left Side: Form */}
          <div className={`${showPreview ? 'lg:col-span-6' : 'lg:col-span-12'} transition-all duration-300`}>
            {/* Top bar: completion meter + auto-save */}
            <div className="mb-2">
              <CompletionMeter percent={completionPercent} />
              <div className="flex justify-between items-center">
                <AutoSaveToast visible={autoSaved} />
                {/* Desktop toggle */}
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="hidden lg:flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors ml-auto"
                >
                  {showPreview ? (
                    <><EyeOff className="w-4 h-4 mr-1.5" />Expand Form</>
                  ) : (
                    <><Eye className="w-4 h-4 mr-1.5" />Show Preview</>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-6 pb-24 lg:pb-0">
              {children}
            </div>
          </div>

          {/* Right Side: Live Preview (Desktop) */}
          {showPreview && (
            <div className="hidden lg:block lg:col-span-6 sticky top-[80px]">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                    Live Preview
                  </h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                </div>
                <div className="bg-gray-500/10 dark:bg-gray-900/50 p-4 h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar flex justify-center items-start">
                  <div className="origin-top transform transition-transform duration-300 scale-[0.55] xl:scale-[0.65] 2xl:scale-[0.75] shadow-2xl">
                    <div className="w-[800px] min-h-[1100px] bg-white">
                      <LivePreview />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Preview FAB */}
      <button
        onClick={() => setShowMobilePreview(true)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center shadow-primary-500/30 transition-all hover:scale-110 active:scale-90"
        aria-label="Preview Resume"
      >
        <FileText className="w-6 h-6" />
      </button>

      {/* Mobile Preview Modal */}
      <AnimatePresence>
        {showMobilePreview && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-gray-100 dark:bg-gray-900 flex flex-col h-full w-full"
          >
            <div className="bg-white dark:bg-gray-800 p-4 shadow-md flex justify-between items-center z-10 sticky top-0 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Resume Preview</h2>
                <p className="text-xs text-gray-400">Tap close to continue editing</p>
              </div>
              <button
                onClick={() => setShowMobilePreview(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-200 dark:bg-gray-900 flex justify-center">
              <div className="w-full max-w-[800px] bg-white shadow-xl min-h-[1000px] scale-[0.5] origin-top sm:scale-[0.7] md:scale-[0.85] mb-12">
                <LivePreview />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormLayout;