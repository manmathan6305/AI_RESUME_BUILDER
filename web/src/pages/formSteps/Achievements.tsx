import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useResume } from '../../context/ResumeContext';
import ProgressBar from '../../components/ProgressBar';
import FormField from '../../components/FormField';


const Achievements: React.FC = () => {
  const { resumeData, updateAchievements } = useResume();
  const navigate = useNavigate();
  
  const [achievementsList, setAchievementsList] = useState<string[]>(
    resumeData.achievements.length > 0 ? resumeData.achievements : ['']
  );

  useEffect(() => {
    document.title = 'Achievements - AI Resume Generator';
  }, []);

  const handleChange = (index: number, value: string) => {
    const newList = [...achievementsList];
    newList[index] = value;
    setAchievementsList(newList);
  };

  const addAchievement = () => {
    setAchievementsList([...achievementsList, '']);
  };

  const removeAchievement = (index: number) => {
    if (achievementsList.length > 1) {
      const newList = achievementsList.filter((_, i) => i !== index);
      setAchievementsList(newList);
    } else {
        setAchievementsList(['']);
    }
  };

  const handleNext = () => {
    const valid = achievementsList.filter(a => a.trim());
    updateAchievements(valid);
    navigate('/form/extra');
  };

  const handleSkip = () => {
    updateAchievements([]);
    navigate('/form/extra');
  };

  const handleBack = () => {
    navigate('/form/certifications');
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
      <ProgressBar currentStep={7} totalSteps={9} steps={steps} />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Achievements
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Highlight your key accomplishments and awards.
        </p>
      </div>

      <div className="space-y-4">
        {achievementsList.map((achievement, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
            <div className="flex-1">
                <FormField
                    label={`Achievement ${index + 1}`}
                    value={achievement}
                    onChange={(value) => handleChange(index, value)}
                  placeholder="Enter an achievement"
                    multiline
                    rows={2}
                />
            </div>
            {achievementsList.length > 1 && (
                <button
                onClick={() => removeAchievement(index)}
                className="mt-8 text-red-500 hover:text-red-700 transition-colors p-2"
                title="Remove Achievement"
                >
                <Trash2 className="w-5 h-5" />
                </button>
            )}
          </motion.div>
        ))}

        <button
          onClick={addAchievement}
          className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Another Achievement
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
                   Next: Extra-Curricular
                </button>
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Achievements;