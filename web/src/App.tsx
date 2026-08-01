import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import PersonalInfo from './pages/formSteps/PersonalInfo';
import Education from './pages/formSteps/Education';
import Experience from './pages/formSteps/Experience';
import Projects from './pages/formSteps/Projects';
import Skills from './pages/formSteps/Skills';
import Certifications from './pages/formSteps/Certifications';
import Achievements from './pages/formSteps/Achievements';
import ExtraInfo from './pages/formSteps/ExtraInfo';
import Declaration from './pages/formSteps/Declaration';
import Preview from './pages/preview/Preview';
import ATSAnalyzer from './pages/ATSAnalyzer';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import FormLayout from './components/FormLayout';
import { ResumeProvider } from './context/ResumeContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/form/personal" element={<ProtectedRoute><FormLayout><PersonalInfo /></FormLayout></ProtectedRoute>} />
        <Route path="/form/education" element={<ProtectedRoute><FormLayout><Education /></FormLayout></ProtectedRoute>} />
        <Route path="/form/experience" element={<ProtectedRoute><FormLayout><Experience /></FormLayout></ProtectedRoute>} />
        <Route path="/form/projects" element={<ProtectedRoute><FormLayout><Projects /></FormLayout></ProtectedRoute>} />
        <Route path="/form/skills" element={<ProtectedRoute><FormLayout><Skills /></FormLayout></ProtectedRoute>} />
        <Route path="/form/certifications" element={<ProtectedRoute><FormLayout><Certifications /></FormLayout></ProtectedRoute>} />
        <Route path="/form/achievements" element={<ProtectedRoute><FormLayout><Achievements /></FormLayout></ProtectedRoute>} />
        <Route path="/form/extra" element={<ProtectedRoute><FormLayout><ExtraInfo /></FormLayout></ProtectedRoute>} />
        <Route path="/form/declaration" element={<ProtectedRoute><FormLayout><Declaration /></FormLayout></ProtectedRoute>} />
        <Route path="/preview" element={<ProtectedRoute><Preview /></ProtectedRoute>} />
        <Route path="/ats-analyzer" element={<ProtectedRoute><ATSAnalyzer /></ProtectedRoute>} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ResumeProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              <Navbar />
              <main className="pt-16">
                <AnimatedRoutes />
              </main>
              <Footer />
            </div>
          </Router>
        </ResumeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;