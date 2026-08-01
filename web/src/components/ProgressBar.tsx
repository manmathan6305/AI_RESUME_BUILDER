import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ProgressBarProps = {
  currentStep: number;
  totalSteps: number;
  steps: string[];
};

const stepRoutes = [
  '/form/personal',
  '/form/education',
  '/form/experience',
  '/form/projects',
  '/form/skills',
  '/form/certifications',
  '/form/achievements',
  '/form/extra',
  '/form/declaration',
];

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps, steps }) => {
  const navigate = useNavigate();

  const handleStepClick = (index: number) => {
    // Basic validation: user can go back to any previous step.
    // User cannot skip ahead unless we implement complex global validation state.
    // For now, restrict to visited steps (index < currentStep).
    // Note: index is 0-based, currentStep is 1-based.
    // Step 1 (index 0) is always clickable.
    
    // Allow clicking strict previous steps
    if (index + 1 < currentStep) {
        navigate(stepRoutes[index]);
    }
  };

  return (
    <div className="w-full mb-8">
      {/* Desktop View - Stepper */}
      <div className="hidden md:block relative px-4">
        <div className="overflow-x-auto pb-4 hide-scrollbar">
            <div className="min-w-[700px] relative px-4 py-2"> {/* Ensure minimum width to prevent crushing */}
                
                {/* Background Grey Line */}
                <div className="absolute top-7 left-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10" 
                    style={{ 
                        left: '2.25rem', 
                        width: 'calc(100% - 4.5rem)' 
                    }} 
                />
                
                {/* Active Colored Line */}
                <motion.div 
                    className="absolute top-7 left-0 h-0.5 bg-primary-600 -z-10 origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: (currentStep - 1) / (totalSteps - 1) }}
                    transition={{ duration: 0.5 }}
                    style={{ 
                        left: '2.25rem', 
                        width: 'calc(100% - 4.5rem)' 
                    }}
                />

                <div className="flex justify-between items-center w-full">
                {steps.map((step, index) => {
                    const isCompleted = index + 1 < currentStep;
                    const isActive = index + 1 === currentStep;
                    const isClickable = isCompleted; // Only allow previous steps for now
                    
                    return (
                        <div 
                            key={step} 
                            className={`flex flex-col items-center group relative ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                            onClick={() => isClickable && handleStepClick(index)}
                        >
                            <div 
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2 z-10 bg-white dark:bg-gray-800
                                    ${isCompleted ? 'bg-primary-600 border-primary-600 text-white' : ''}
                                    ${isActive ? 'border-primary-600 text-primary-600 scale-110 shadow-lg ring-4 ring-primary-100 dark:ring-primary-900/30' : ''}
                                    ${!isCompleted && !isActive ? 'border-gray-300 dark:border-gray-600 text-gray-400' : ''}
                                `}
                            >
                                {isCompleted ? <Check className="w-5 h-5 text-primary-600" /> : index + 1}
                            </div>
                            
                            {/* Step Label - Improved spacing and visibility */}
                            <span 
                                className={`
                                    absolute top-12 text-xs font-semibold whitespace-nowrap transition-colors duration-300 px-2 py-1 rounded-md
                                    ${isActive ? 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-500 dark:text-gray-400'}
                                `}
                            >
                                {step}
                            </span>
                        </div>
                    );
                })}
                </div>
            </div>
        </div>
      </div>

      {/* Mobile View - Simplified */}
      <div className="md:hidden mt-4 px-1">
         <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-primary-600">
                {steps[currentStep - 1]}
            </span>
         </div>
         <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-primary-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep) / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
         </div>
      </div>
    </div>
  );
};

export default ProgressBar;