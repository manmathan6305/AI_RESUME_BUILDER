import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../../context/ResumeContext';
import ProgressBar from '../../components/ProgressBar';
import StepNavigation from '../../components/StepNavigation';
import TagInput from '../../components/TagInput';
import { Zap } from 'lucide-react';

type SkillsType = {
  languages: string[];
  frameworks: string[];
  tools: string[];
  concepts: string[];
};

const Skills: React.FC = () => {
  const { resumeData, updateSkills } = useResume();
  const navigate = useNavigate();

  const initialSkills: SkillsType = Array.isArray(resumeData.skills)
    ? { languages: [], frameworks: [], tools: [], concepts: [] }
    : (resumeData.skills || { languages: [], frameworks: [], tools: [], concepts: [] });

  const [skills, setSkills] = useState<SkillsType>(initialSkills);

  const handleNext = () => {
    updateSkills(skills);
    navigate('/form/certifications');
  };

  const handleBack = () => {
    navigate('/form/projects');
  };

  // Quick Finish: save skills and jump straight to preview (skipping steps 6–9)
  const handleQuickFinish = () => {
    updateSkills(skills);
    navigate('/preview');
  };

  const steps = ['Personal', 'Education', 'Experience', 'Projects', 'Skills', 'Certifications', 'Achievements', 'Extra', 'Declaration'];

  const suggestions = {
    languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin', 'PHP', 'Ruby', 'SQL', 'HTML5', 'CSS3'],
    frameworks: ['React', 'Vue.js', 'Angular', 'Next.js', 'Express', 'Django', 'Flask', 'Spring Boot', '.NET Core', 'Laravel', 'Tailwind CSS', 'Bootstrap', 'Material UI'],
    tools: ['Git', 'GitHub', 'GitLab', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'Jenkins', 'Jira', 'Figma', 'Postman', 'VS Code', 'Webpack', 'Vite', 'Linux'],
    concepts: ['REST APIs', 'GraphQL', 'Microservices', 'CI/CD', 'Agile', 'Scrum', 'TDD', 'OOP', 'Functional Programming', 'Data Structures', 'Algorithms', 'System Design'],
  };

  const hasSkills = skills.languages.length > 0 || skills.frameworks.length > 0 || skills.tools.length > 0 || skills.concepts.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <ProgressBar currentStep={5} totalSteps={9} steps={steps} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Technical Skills
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Categorize your skills. Click suggestions or type and press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Enter</kbd> to add custom ones.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 space-y-6">

        <TagInput
          label="Programming Languages"
          placeholder="e.g. JavaScript, Python..."
          tags={skills.languages}
          setTags={(tags) => setSkills(prev => ({ ...prev, languages: tags }))}
          suggestions={suggestions.languages}
        />

        <TagInput
          label="Frameworks & Libraries"
          placeholder="e.g. React, Django..."
          tags={skills.frameworks}
          setTags={(tags) => setSkills(prev => ({ ...prev, frameworks: tags }))}
          suggestions={suggestions.frameworks}
        />

        <TagInput
          label="Tools & Platforms"
          placeholder="e.g. Git, AWS..."
          tags={skills.tools}
          setTags={(tags) => setSkills(prev => ({ ...prev, tools: tags }))}
          suggestions={suggestions.tools}
        />

        <TagInput
          label="Key Concepts"
          placeholder="e.g. REST API, Agile..."
          tags={skills.concepts}
          setTags={(tags) => setSkills(prev => ({ ...prev, concepts: tags }))}
          suggestions={suggestions.concepts}
        />

        <StepNavigation
          onBack={handleBack}
          onNext={handleNext}
          backLabel="Back"
          nextLabel="Next: Certifications"
        />

        {/* Quick Finish shortcut — saves steps 6-9 */}
        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 rounded-xl p-4 border border-violet-100 dark:border-violet-900/40">
            <div>
              <p className="text-sm font-semibold text-violet-800 dark:text-violet-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                Want to skip ahead?
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Jump straight to your resume preview — you can always come back to add certifications, achievements, and more.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleQuickFinish}
              disabled={!hasSkills}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                hasSkills
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:from-violet-700 hover:to-indigo-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
              title={hasSkills ? 'Skip remaining optional steps and preview your resume' : 'Add at least one skill first'}
            >
              <Zap className="w-4 h-4" />
              Quick Finish → Preview
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Skills;