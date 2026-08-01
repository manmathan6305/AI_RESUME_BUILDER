import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useResume } from '../../context/ResumeContext';
import ProgressBar from '../../components/ProgressBar';
import FormField from '../../components/FormField';

const ExtraInfo: React.FC = () => {
    const { resumeData, updateExtra } = useResume();
    const navigate = useNavigate();
    
    const [extraList, setExtraList] = useState<string[]>(
        (resumeData.extra && resumeData.extra.length > 0) ? resumeData.extra : ['']
    );

    useEffect(() => {
        document.title = 'Extra-Curricular - AI Resume Generator';
    }, []);

    const handleChange = (index: number, value: string) => {
        const newList = [...extraList];
        newList[index] = value;
        setExtraList(newList);
    };

    const addExtra = () => {
        setExtraList([...extraList, '']);
    };

    const removeExtra = (index: number) => {
        if (extraList.length > 1) {
            const newList = extraList.filter((_, i) => i !== index);
            setExtraList(newList);
        } else {
             setExtraList(['']);
        }
    };

    const handleNext = () => {
        const valid = extraList.filter(e => e.trim());
        updateExtra(valid);
        navigate('/form/declaration');
    };

    const handleSkip = () => {
        updateExtra([]);
        navigate('/form/declaration');
    };

    const handleBack = () => {
        navigate('/form/achievements');
    };

    const steps = ['Personal', 'Education', 'Experience', 'Projects', 'Skills', 'Certifications', 'Achievements', 'Extra', 'Declaration'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >
            <ProgressBar currentStep={8} totalSteps={9} steps={steps} />
            
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Extra-Curricular Activities
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Activities, leadership roles, or club participation.
                </p>
            </div>

            <div className="space-y-4">
                {extraList.map((extra, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3"
                    >
                        <div className="flex-1">
                            <FormField
                                label={`Activity ${index + 1}`}
                                value={extra}
                                onChange={(value) => handleChange(index, value)}
                                placeholder="Enter an activity"
                                multiline
                                rows={2}
                            />
                        </div>
                        {extraList.length > 1 && (
                            <button
                                onClick={() => removeExtra(index)}
                                className="mt-8 text-red-500 hover:text-red-700 transition-colors p-2"
                                title="Remove Activity"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </motion.div>
                ))}

                <button
                    onClick={addExtra}
                    className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center font-medium"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Another Activity
                </button>

                 <div className="flex justify-between items-center pt-8">
                    <button
                        onClick={handleBack}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium"
                    >
                        Back
                    </button>
                    <div className="flex space-x-4">
                        <button
                            onClick={handleSkip}
                            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            Skip
                        </button>
                        <button
                            onClick={handleNext}
                            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                        >
                            Next: Declaration
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ExtraInfo; 