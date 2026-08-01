import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useResume, Education as EducationType } from '../../context/ResumeContext';
import ProgressBar from '../../components/ProgressBar';
import FormField from '../../components/FormField';
import StepNavigation from '../../components/StepNavigation';

const Education: React.FC = () => {
  const { resumeData, updateEducation } = useResume();
  const navigate = useNavigate();
  
  const [educationList, setEducationList] = useState<EducationType[]>(
    resumeData.education.length > 0 ? resumeData.education : [{
      id: Date.now().toString(),
      degree: '',
      institution: '',
      startYear: '',
      endYear: '',
      gpa: '',
    }]
  );

  useEffect(() => {
    document.title = 'Education - AI Resume Generator';
  }, []);

  const handleInputChange = (id: string, field: string, value: string) => {
    setEducationList(prev => prev.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  const addEducation = () => {
    setEducationList(prev => [...prev, {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      startYear: '',
      endYear: '',
      gpa: '',
    }]);
  };

  const removeEducation = (id: string) => {
    if (educationList.length > 1) {
      setEducationList(prev => prev.filter(edu => edu.id !== id));
    }
  };

  const handleNext = () => {
    const validEducation = educationList.filter(edu => 
      edu.degree.trim() && edu.institution.trim() && edu.startYear.trim() && edu.endYear.trim()
    );
    
    updateEducation(validEducation);
    // BACKEND HOOK HERE: Save education data to JSON or temporary storage
    console.log('Saving education:', validEducation);
    navigate('/form/experience');
  };

  const handleSkipToSkills = () => {
    const validEducation = educationList.filter(edu => 
      edu.degree.trim() && edu.institution.trim() && edu.startYear.trim() && edu.endYear.trim()
    );
    
    updateEducation(validEducation);
    // BACKEND HOOK HERE: Save education data to JSON or temporary storage
    console.log('Saving education:', validEducation);
    navigate('/form/skills');
  };
  const handleBack = () => {
    navigate('/form/personal');
  };

  const canProceed = educationList.some(edu => 
    edu.degree.trim() && edu.institution.trim() && edu.startYear.trim() && edu.endYear.trim()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <ProgressBar 
        currentStep={2} 
        totalSteps={9} 
        steps={['Personal', 'Education', 'Experience', 'Projects', 'Skills', 'Certifications', 'Achievements', 'Extra', 'Declaration']}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Education
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Add your educational background to showcase your qualifications.
        </p>

        <div className="space-y-8">
          {educationList.map((education, index) => (
            <motion.div
              key={education.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Education {index + 1}
                </h3>
                {educationList.length > 1 && (
                  <button
                    onClick={() => removeEducation(education.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Degree"
                  value={education.degree}
                  onChange={(value) => handleInputChange(education.id, 'degree', value)}
                  placeholder="Enter your degree"
                  required
                />
                
                <FormField
                  label="Institution"
                  value={education.institution}
                  onChange={(value) => handleInputChange(education.id, 'institution', value)}
                  placeholder="Enter institution name"
                  required
                />
                
                <FormField
                  label="Start Year"
                  value={education.startYear}
                  onChange={(value) => handleInputChange(education.id, 'startYear', value)}
                  placeholder="Enter start year"
                  required
                />
                
                <FormField
                  label="End Year"
                  value={education.endYear}
                  onChange={(value) => handleInputChange(education.id, 'endYear', value)}
                  placeholder="Enter end year"
                  required
                />
                
                <FormField
                  label="GPA (Optional)"
                  value={education.gpa || ''}
                  onChange={(value) => handleInputChange(education.id, 'gpa', value)}
                  placeholder="Enter GPA"
                />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addEducation}
          className="flex items-center px-4 py-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 rounded-lg transition-colors mt-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Another Education
        </motion.button>

        <StepNavigation
          onBack={handleBack}
          onNext={handleNext}
          canGoNext={canProceed}
          nextLabel="Continue to Experience"
        />
        
        <div className="text-center mt-4">
          <button
            onClick={handleSkipToSkills}
            className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm underline transition-colors"
          >
            Skip work experience and go to skills
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Education;