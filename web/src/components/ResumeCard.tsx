import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Calendar, Building, GraduationCap } from 'lucide-react';
import { ResumeData } from '../context/ResumeContext';

type ResumeCardProps = {
  data: ResumeData;
};

const ResumeCard: React.FC<ResumeCardProps> = ({ data }) => {
  const { personalInfo, education, experience, skills, extra } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {personalInfo.firstName} {personalInfo.lastName}
        </h1>
        {personalInfo.summary && (
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {personalInfo.summary}
          </p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
          {personalInfo.email && (
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              {personalInfo.email}
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              {personalInfo.phone}
            </div>
          )}
          {personalInfo.address && (
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {personalInfo.address}
            </div>
          )}
        </div>
      </motion.div>

      {/* Experience */}
      {experience.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="border-l-2 border-primary-200 pl-4">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {exp.jobTitle}
                </h3>
                <p className="text-primary-600 dark:text-primary-400 font-medium">
                  {exp.company}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mb-2">
                  <Calendar className="w-4 h-4 mr-1" />
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  {exp.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2" />
            Education
          </h2>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="border-l-2 border-secondary-200 pl-4">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {edu.degree}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-400 font-medium">
                  {edu.institution}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {edu.startYear} - {edu.endYear}
                </p>
                {edu.gpa && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    GPA: {edu.gpa}
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Skills */}
      {(() => {
        const allSkills = [
          ...(skills.languages  || []),
          ...(skills.frameworks || []),
          ...(skills.tools      || []),
          ...(skills.concepts   || []),
        ];
        return allSkills.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {allSkills.map((skill, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="px-3 py-1 bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 rounded-full text-sm font-medium"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        ) : null;
      })()}

      {/* Extra Information */}
      {extra && extra.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Extra Information
          </h2>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            {extra.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ResumeCard;