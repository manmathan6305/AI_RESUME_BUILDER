import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../../context/ResumeContext';
import ProgressBar from '../../components/ProgressBar';
import FormField from '../../components/FormField';
import StepNavigation from '../../components/StepNavigation';
import SmartTextArea from '../../components/SmartTextArea';
import { Sparkles, Linkedin, Github } from 'lucide-react';

const EXAMPLE_DATA = {
  firstName: 'Alex',
  lastName: 'Johnson',
  email: 'alex.johnson@example.com',
  phone: '+1 (555) 987-6543',
  address: 'San Francisco, CA, USA',
  summary: 'Results-driven Software Engineer with 3+ years of experience building scalable web applications using React, Node.js, and Python. Passionate about clean code, user experience, and delivering impactful solutions in fast-paced environments.',
  linkedin: 'linkedin.com/in/alexjohnson',
  github: 'github.com/alexjohnson',
};

const PersonalInfo: React.FC = () => {
  const { resumeData, updatePersonalInfo } = useResume();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState(resumeData.personalInfo);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showExampleHint, setShowExampleHint] = useState(
    !resumeData.personalInfo.firstName && !resumeData.personalInfo.summary
  );

  useEffect(() => {
    document.title = 'Personal Information - AI Resume Generator';
  }, []);

  // Keep form in sync if context is externally reset
  useEffect(() => {
    setFormData(resumeData.personalInfo);
  }, [resumeData.personalInfo.firstName]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setShowExampleHint(false);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const fillWithExample = () => {
    setFormData(EXAMPLE_DATA);
    setShowExampleHint(false);
    updatePersonalInfo(EXAMPLE_DATA);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim())  newErrors.lastName  = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      updatePersonalInfo(formData);
      navigate('/form/education');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <ProgressBar 
        currentStep={1} 
        totalSteps={9} 
        steps={['Personal', 'Education', 'Experience', 'Projects', 'Skills', 'Certifications', 'Achievements', 'Extra', 'Declaration']}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
      >
        {/* Header with Try Example hint */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Personal Information
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Let's start with your basic details. Fields marked <span className="text-red-500">*</span> are required.
            </p>
          </div>

          {showExampleHint && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={fillWithExample}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg hover:from-violet-600 hover:to-purple-700 transition-all duration-200"
              title="Fill the form with sample data to see how a completed resume looks"
            >
              <Sparkles className="w-4 h-4" />
              Try Example
            </motion.button>
          )}
        </div>

        {/* Name Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <FormField
            label="First Name"
            value={formData.firstName}
            onChange={(value) => handleInputChange('firstName', value)}
            placeholder="e.g. Alex"
            required
            error={errors.firstName}
          />
          <FormField
            label="Last Name"
            value={formData.lastName}
            onChange={(value) => handleInputChange('lastName', value)}
            placeholder="e.g. Johnson"
            required
            error={errors.lastName}
          />
        </div>

        {/* Contact Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <FormField
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            placeholder="alex@example.com"
            required
            error={errors.email}
          />
          <FormField
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(value) => handleInputChange('phone', value)}
            placeholder="+1 (555) 123-4567"
            required
            error={errors.phone}
          />
        </div>

        {/* Address */}
        <div className="mb-6">
          <FormField
            label="Location"
            value={formData.address}
            onChange={(value) => handleInputChange('address', value)}
            placeholder="City, State, Country  (e.g. New York, NY, USA)"
          />
        </div>

        {/* Professional Links Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Linkedin className="w-4 h-4 text-blue-600" />
                LinkedIn Profile
                <span className="text-xs text-gray-400 font-normal ml-1">(optional)</span>
              </span>
            </label>
            <input
              type="url"
              value={formData.linkedin || ''}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
              placeholder="linkedin.com/in/yourname"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <span className="flex items-center gap-1.5">
                <Github className="w-4 h-4 text-gray-800 dark:text-gray-200" />
                GitHub Profile
                <span className="text-xs text-gray-400 font-normal ml-1">(optional)</span>
              </span>
            </label>
            <input
              type="url"
              value={formData.github || ''}
              onChange={(e) => handleInputChange('github', e.target.value)}
              placeholder="github.com/yourusername"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            />
          </div>
        </div>

        {/* Professional Summary */}
        <SmartTextArea
          label="Professional Summary"
          value={formData.summary}
          onChange={(value) => handleInputChange('summary', value)}
          placeholder="Brief 2–3 sentence overview of your professional background, key skills, and career goals. Use the ✨ AI Enhance button to improve it automatically."
          rows={4}
          type="summary"
        />

        <StepNavigation
          onNext={handleNext}
          canGoNext={true}
          nextLabel="Continue to Education →"
        />
      </motion.div>
    </motion.div>
  );
};

export default PersonalInfo;