import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useResume, Certification } from '../../context/ResumeContext';
import ProgressBar from '../../components/ProgressBar';
import FormField from '../../components/FormField';


const Certifications: React.FC = () => {
    const { resumeData, updateCertifications } = useResume();
    const navigate = useNavigate();

    const [certList, setCertList] = useState<Certification[]>(
        resumeData.certifications.length > 0 ? resumeData.certifications : [{
            id: Date.now().toString(),
            name: '',
            issuer: '',
            date: ''
        }]
    );

    useEffect(() => {
        document.title = 'Certifications - AI Resume Generator';
    }, []);

    const handleInputChange = (id: string, field: keyof Certification, value: string) => {
        setCertList(prev => prev.map(cert => 
            cert.id === id ? { ...cert, [field]: value } : cert
        ));
    };

    const addCertification = () => {
        setCertList(prev => [...prev, {
            id: Date.now().toString(),
            name: '',
            issuer: '',
            date: ''
        }]);
    };

    const removeCertification = (id: string) => {
        if (certList.length > 1) {
            setCertList(prev => prev.filter(cert => cert.id !== id));
        } else {
             setCertList([{
                id: Date.now().toString(),
                name: '',
                issuer: '',
                date: ''
            }]);
        }
    };

    const handleNext = () => {
        const validCerts = certList.filter(cert => cert.name.trim() && cert.issuer.trim());
        updateCertifications(validCerts);
        navigate('/form/achievements');
    };

    const handleSkip = () => {
        updateCertifications([]);
        navigate('/form/achievements');
    };

    const handleBack = () => {
        navigate('/form/skills');
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
            <ProgressBar currentStep={6} totalSteps={9} steps={steps} />
            
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Certifications
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Add certificates to validate your expertise.
                </p>
            </div>

            <div className="space-y-8">
                {certList.map((cert, index) => (
                    <motion.div
                        key={cert.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 relative"
                    >
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Certification {index + 1}
                            </h3>
                            {certList.length > 1 && (
                                <button
                                onClick={() => removeCertification(cert.id)}
                                className="text-red-500 hover:text-red-700 transition-colors p-2"
                                title="Remove Certification"
                                >
                                <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Certification Name"
                                value={cert.name}
                                onChange={(value) => handleInputChange(cert.id, 'name', value)}
                                placeholder="Enter certification name"
                                required
                            />
                            <FormField
                                label="Issuing Organization"
                                value={cert.issuer}
                                onChange={(value) => handleInputChange(cert.id, 'issuer', value)}
                                placeholder="Enter issuing organization"
                                required
                            />
                            <FormField
                                label="Date"
                                value={cert.date}
                                onChange={(value) => handleInputChange(cert.id, 'date', value)}
                                placeholder="Enter date"
                            />
                        </div>
                    </motion.div>
                ))}

                <button
                    onClick={addCertification}
                    className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors flex items-center justify-center font-medium"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Another Certification
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
                            Next: Achievements
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Certifications;