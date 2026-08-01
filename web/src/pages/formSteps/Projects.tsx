import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useResume, Project } from '../../context/ResumeContext';
import ProgressBar from '../../components/ProgressBar';
import FormField from '../../components/FormField';
import StepNavigation from '../../components/StepNavigation';
import SmartTextArea from '../../components/SmartTextArea';
import TagInput from '../../components/TagInput';

const Projects: React.FC = () => {
  const { resumeData, updateProjects } = useResume();
  const navigate = useNavigate();
  
  const [projectList, setProjectList] = useState<Project[]>(
    resumeData.projects.length > 0 ? resumeData.projects : [{
      id: Date.now().toString(),
      title: '',
      description: '',
      technologies: '',
      link: ''
    }]
  );

  useEffect(() => {
    document.title = 'Projects - AI Resume Generator';
  }, []);

  const handleInputChange = (id: string, field: keyof Project, value: string) => {
    setProjectList(prev => prev.map(proj => 
      proj.id === id ? { ...proj, [field]: value } : proj
    ));
  };

  const addProject = () => {
    setProjectList(prev => [...prev, {
      id: Date.now().toString(),
      title: '',
      description: '',
      technologies: '',
      link: ''
    }]);
  };


  const handleRemove = (id: string) => {
    if (projectList.length > 1) {
        setProjectList(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleNext = () => {
    const validProjects = projectList.filter(proj => 
      proj.title.trim() && proj.description.trim()
    );
    
    updateProjects(validProjects);
    navigate('/form/skills');
  };

  const handleSkip = () => {
    updateProjects([]);
    navigate('/form/skills');
  };

  const handleBack = () => {
      navigate('/form/experience');
  }

  const steps = ['Personal', 'Education', 'Experience', 'Projects', 'Skills', 'Certifications', 'Achievements', 'Extra', 'Declaration'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <ProgressBar currentStep={4} totalSteps={9} steps={steps} />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Projects
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Showcase relevant projects to demonstrate your skills.
        </p>
      </div>

      <div className="space-y-8">
        {projectList.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 relative"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Project {index + 1}
              </h3>
              {projectList.length > 1 && (
                <button
                  onClick={() => handleRemove(project.id)}
                  className="text-red-500 hover:text-red-700 transition-colors p-2"
                  title="Remove Project"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <FormField
                label="Project Title"
                value={project.title}
                onChange={(value) => handleInputChange(project.id, 'title', value)}
                placeholder="Enter project title"
                required
              />
              <FormField
                label="Link (Optional)"
                value={project.link || ''}
                onChange={(value) => handleInputChange(project.id, 'link', value)}
                placeholder="Enter project link"
              />
            </div>
            
            <SmartTextArea 
                label="Description"
                value={project.description}
                onChange={(value) => handleInputChange(project.id, 'description', value)}
                placeholder="Enter a project description"
                rows={4}
                required
            />
            
            <TagInput
                label="Technologies Used"
                placeholder="Enter technologies used"
                tags={project.technologies ? project.technologies.split(',').map(t => t.trim()).filter(Boolean) : []}
                setTags={(tags) => handleInputChange(project.id, 'technologies', tags.join(', '))}
            />

          </motion.div>
        ))}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addProject}
          className="flex items-center px-4 py-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900 rounded-lg transition-colors mt-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Another Project
        </motion.button>
        
        <StepNavigation
          onBack={handleBack}
          onNext={handleNext}
          canGoNext={true}
          nextLabel="Continue to Skills"
        />

        <div className="text-center mt-4">
            <button onClick={handleSkip} className="text-gray-500 hover:text-gray-700 text-sm underline">
                Skip this section
            </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Projects;