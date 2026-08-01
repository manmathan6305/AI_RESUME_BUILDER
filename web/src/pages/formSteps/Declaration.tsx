import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../../context/ResumeContext';
import ProgressBar from '../../components/ProgressBar';
import { FileText, SkipForward, Info } from 'lucide-react';

const DEFAULT_DECLARATION = "I hereby declare that the information provided above is true and accurate to the best of my knowledge and belief.";

const Declaration: React.FC = () => {
  const { resumeData, updateDeclaration } = useResume();
  const navigate = useNavigate();

  const [declaration, setDeclaration] = useState<string>(
    resumeData.declaration || DEFAULT_DECLARATION
  );

  useEffect(() => {
    document.title = 'Declaration - AI Resume Generator';
  }, []);

  const handleFinish = () => {
    updateDeclaration(declaration);
    navigate('/preview');
  };

  const handleSkip = () => {
    updateDeclaration('');
    navigate('/preview');
  };

  const handleBack = () => navigate('/form/extra');

  const steps = ['Personal', 'Education', 'Experience', 'Projects', 'Skills', 'Certifications', 'Achievements', 'Extra', 'Declaration'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <ProgressBar currentStep={9} totalSteps={9} steps={steps} />

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Declaration</h1>
          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">Optional</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" />
          A declaration is a statement certifying the authenticity of your resume. It's commonly used in South Asian job applications but optional elsewhere. <strong>You can skip this if you don't need it.</strong>
        </p>
      </div>

      {/* Primary CTA — Skip */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleSkip}
        className="w-full mb-6 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-primary-600 to-violet-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-primary-700 hover:to-violet-700 transition-all"
      >
        <FileText className="w-5 h-5" />
        Skip & Preview My Resume →
      </motion.button>

      {/* Divider */}
      <div className="relative flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap font-medium">or add a declaration below</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Declaration text editor */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Declaration Statement
        </label>
        <textarea
          value={declaration}
          onChange={(e) => setDeclaration(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
        />
        <button
          onClick={() => setDeclaration(DEFAULT_DECLARATION)}
          className="mt-2 text-xs text-primary-600 dark:text-primary-400 hover:underline"
        >
          Reset to default text
        </button>

        <div className="flex justify-between items-center pt-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium transition-colors"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSkip}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
              Skip
            </button>
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <FileText className="w-4 h-4" />
              Finish & Preview
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Declaration;