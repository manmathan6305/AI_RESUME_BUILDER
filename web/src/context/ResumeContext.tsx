import React, { createContext, useContext, useState, useEffect } from 'react';

// --- Types ---

export type PersonalInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  linkedin?: string;
  github?: string;
};

export type Education = {
  id: string;
  degree: string;
  institution: string;
  startYear: string;
  endYear: string;
  gpa?: string;
};

export type Experience = {
  id: string;
  jobTitle: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
  current: boolean;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  technologies: string;
  link?: string;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  date: string;
};

export type Skills = {
  languages: string[];
  frameworks: string[];
  tools: string[];
  concepts: string[];
};

export type ResumeData = {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skills;
  certifications: Certification[];
  achievements: string[];
  extra: string[]; // Extra-curricular activities
  declaration?: string;
};

// --- Completion Calculator ---

export const calculateCompletion = (data: ResumeData): number => {
  let score = 0;
  const total = 100;

  const pi = data.personalInfo;
  if (pi.firstName?.trim()) score += 6;
  if (pi.lastName?.trim())  score += 6;
  if (pi.email?.trim())     score += 6;
  if (pi.phone?.trim())     score += 6;
  if (pi.address?.trim())   score += 3;
  if (pi.summary?.trim())   score += 10;
  if (pi.linkedin?.trim())  score += 4;
  if (pi.github?.trim())    score += 4;

  if (data.education.length > 0 && data.education.some(e => e.degree?.trim() && e.institution?.trim())) score += 15;
  if (data.experience.length > 0 && data.experience.some(e => e.jobTitle?.trim())) score += 15;
  if (data.projects.length > 0 && data.projects.some(p => p.title?.trim())) score += 8;

  const s = data.skills;
  const hasSkills = s.languages?.length > 0 || s.frameworks?.length > 0 || s.tools?.length > 0 || s.concepts?.length > 0;
  if (hasSkills) score += 12;

  if (data.certifications.length > 0 && data.certifications.some(c => c.name?.trim())) score += 3;
  if (data.achievements.length > 0 && data.achievements.some(a => a?.trim())) score += 2;

  return Math.min(100, Math.round((score / total) * 100));
};

// --- Context Type ---

type ResumeContextType = {
  resumeData: ResumeData;
  updatePersonalInfo: (info: PersonalInfo) => void;
  updateEducation: (education: Education[]) => void;
  updateExperience: (experience: Experience[]) => void;
  updateProjects: (projects: Project[]) => void;
  updateSkills: (skills: Skills) => void;
  updateCertifications: (certifications: Certification[]) => void;
  updateAchievements: (achievements: string[]) => void;
  updateExtra: (extra: string[]) => void;
  updateDeclaration: (declaration: string) => void;
  resetForm: () => void;
  completionPercent: number;
};

// --- Defaults ---

const defaultResumeData: ResumeData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    summary: '',
    linkedin: '',
    github: '',
  },
  education: [],
  experience: [],
  projects: [],
  skills: {
    languages: [],
    frameworks: [],
    tools: [],
    concepts: [],
  },
  certifications: [],
  achievements: [],
  extra: [],
  declaration: '',
};

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

// --- Hook ---

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};

// --- Provider ---

export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lazy initialization from localStorage to avoid race conditions
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    try {
      const savedData = localStorage.getItem('resumeData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // Migrate old skills array format
        if (Array.isArray(parsed.skills)) {
          parsed.skills = {
            languages: parsed.skills,
            frameworks: [],
            tools: [],
            concepts: []
          };
        }
        // Ensure personalInfo has new fields
        parsed.personalInfo = {
          linkedin: '',
          github: '',
          ...parsed.personalInfo,
        };
        return { ...defaultResumeData, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load resume data', error);
    }
    return defaultResumeData;
  });

  const [completionPercent, setCompletionPercent] = useState(0);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
    setCompletionPercent(calculateCompletion(resumeData));
  }, [resumeData]);

  // --- Actions ---

  const updatePersonalInfo = (info: PersonalInfo) => {
    setResumeData(prev => ({ ...prev, personalInfo: info }));
  };

  const updateEducation = (education: Education[]) => {
    setResumeData(prev => ({ ...prev, education }));
  };

  const updateExperience = (experience: Experience[]) => {
    setResumeData(prev => ({ ...prev, experience }));
  };

  const updateProjects = (projects: Project[]) => {
    setResumeData(prev => ({ ...prev, projects }));
  };

  const updateSkills = (skills: Skills) => {
    setResumeData(prev => ({ ...prev, skills }));
  };

  const updateCertifications = (certifications: Certification[]) => {
    setResumeData(prev => ({ ...prev, certifications }));
  };

  const updateAchievements = (achievements: string[]) => {
    setResumeData(prev => ({ ...prev, achievements }));
  };

  const updateExtra = (extra: string[]) => {
    setResumeData(prev => ({ ...prev, extra }));
  };

  const updateDeclaration = (declaration: string) => {
    setResumeData(prev => ({ ...prev, declaration }));
  };

  const resetForm = () => {
    setResumeData(defaultResumeData);
    localStorage.removeItem('resumeData');
  };

  return (
    <ResumeContext.Provider value={{
      resumeData,
      updatePersonalInfo,
      updateEducation,
      updateExperience,
      updateProjects,
      updateSkills,
      updateCertifications,
      updateAchievements,
      updateExtra,
      updateDeclaration,
      resetForm,
      completionPercent,
    }}>
      {children}
    </ResumeContext.Provider>
  );
};
