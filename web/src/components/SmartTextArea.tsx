import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, RefreshCw, AlertCircle } from 'lucide-react';
import API_URL from '../config';

type SmartTextAreaProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  type?: 'summary' | 'responsibility' | 'experience' | 'general';
  jobDescription?: string;
};

const SmartTextArea: React.FC<SmartTextAreaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  required,
  type = 'general',
  jobDescription = ''
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [originalValue, setOriginalValue] = useState('');
  const [showUndo, setShowUndo] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEnhance = async () => {
    if (!value.trim()) return;

    setIsEnhancing(true);
    setOriginalValue(value);
    setErrorMsg('');

    try {
      const response = await fetch(`${API_URL}/enhance-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: value,
          type: type,
          jobDescription: jobDescription || ''
        })
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.enhancedText) {
          onChange(data.enhancedText);
          setShowUndo(true);
          setTimeout(() => setShowUndo(false), 6000);
        } else {
          throw new Error('No enhanced text returned by the server.');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        const detail = errorData.detail || errorData.error || 'Enhancement failed';
        if (response.status === 429) {
          setErrorMsg('Rate limit hit — wait a moment & retry');
        } else {
          setErrorMsg(detail);
        }
        setTimeout(() => setErrorMsg(''), 5000);
      }
    } catch (e) {
      console.error('AI service error', e);
      const message = e instanceof Error ? e.message : 'Cannot reach AI service';
      setErrorMsg(
        message.toLowerCase().includes('failed to fetch')
          ? 'Cannot reach AI service. Please try again in a few seconds.'
          : message
      );
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleUndo = () => {
    onChange(originalValue);
    setShowUndo(false);
  };


  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {value.length > 10 && (
          <div className="flex items-center space-x-2">
            {showUndo && (
              <button
                onClick={handleUndo}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 underline"
              >
                Undo
              </button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEnhance}
              disabled={isEnhancing}
              className={`flex items-center text-xs px-2 py-1 rounded-md transition-colors ${
                isEnhancing
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm hover:shadow-md'
              }`}
            >
              {isEnhancing ? (
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3 mr-1" />
              )}
              {isEnhancing ? 'Improving...' : 'AI Enhance'}
            </motion.button>
          </div>
        )}
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`w-full px-4 py-3 rounded-lg border transition-all duration-200
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-white
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-primary-500
            border-gray-300 dark:border-gray-600 focus:border-primary-500
          `}
        />
        {showUndo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-2 right-2 flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
          >
            <Check className="w-3 h-3 mr-1" />
            Enhanced!
          </motion.div>
        )}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-2 right-2 flex items-center bg-red-100 text-red-700 px-2 py-1 rounded text-xs max-w-[200px] text-center"
          >
            <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
            {errorMsg}
          </motion.div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
        Tip: Write drafted content and click 'AI Enhance' to get professional wording with grammar & spelling corrections.
      </p>
    </div>
  );
};

export default SmartTextArea;

