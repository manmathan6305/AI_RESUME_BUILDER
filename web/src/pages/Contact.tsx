import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import FormField from '../components/FormField';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    document.title = 'Contact Us - AI Resume Generator';
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // BACKEND HOOK HERE: Send contact form data to backend
    console.log('Sending contact form:', formData);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitted(true);
    setIsSubmitting(false);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  const canSubmit = formData.name.trim() && formData.email.trim() && formData.message.trim();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Have questions about our AI Resume Generator? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Contact Information
              </h2>

              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mr-4">
                    <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      [EMAIL_ADDRESS]
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mr-4">
                    <Phone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      +91
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mr-4">
                    <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      Your City, State, Country
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Send us a Message
              </h2>

              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We'll get back to you within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="Full Name"
                      value={formData.name}
                      onChange={(value) => handleInputChange('name', value)}
                      placeholder="Your full name"
                      required
                    />

                    <FormField
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(value) => handleInputChange('email', value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <FormField
                    label="Message"
                    value={formData.message}
                    onChange={(value) => handleInputChange('message', value)}
                    placeholder="Tell us how we can help you..."
                    multiline
                    rows={5}
                    required
                  />

                  <motion.button
                    whileHover={{ scale: canSubmit ? 1.02 : 1 }}
                    whileTap={{ scale: canSubmit ? 0.98 : 1 }}
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className={`w-full flex items-center justify-center px-6 py-4 rounded-lg font-medium transition-all duration-200 ${canSubmit && !isSubmitting
                      ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                    ) : (
                      <Send className="w-5 h-5 mr-2" />
                    )}
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>
        </div>


      </div>
    </motion.div>
  );
};

export default Contact;