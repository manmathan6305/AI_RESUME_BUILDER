import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, FileText, Zap, Shield, Star, ArrowRight,
  CheckCircle, Brain, Download, BarChart3, Clock, Users,
} from 'lucide-react';

// -------------------------------------------------------------------
// Animated counter hook
// -------------------------------------------------------------------
function useCounter(target: number, duration = 2000, startOnView = false) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(!startOnView);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return { count, start: () => setStarted(true) };
}

// -------------------------------------------------------------------
// Stat card with animated counter
// -------------------------------------------------------------------
const StatCard: React.FC<{ value: number; suffix: string; label: string; icon: React.ReactNode }> = ({ value, suffix, label, icon }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const { count, start } = useCounter(value, 1800, true);

  useEffect(() => { if (inView) start(); }, [inView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
    >
      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3 text-white">
        {icon}
      </div>
      <div className="text-3xl font-black text-white">
        {inView ? count.toLocaleString() : 0}{suffix}
      </div>
      <div className="text-sm text-white/70 mt-1 font-medium">{label}</div>
    </motion.div>
  );
};

// -------------------------------------------------------------------
// Feature card
// -------------------------------------------------------------------
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}> = ({ icon, title, description, gradient, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      {/* Gradient background on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 text-white shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
};

// -------------------------------------------------------------------
// Testimonial card
// -------------------------------------------------------------------
const TestimonialCard: React.FC<{
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
  delay?: number;
}> = ({ name, role, content, rating, avatar, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center mb-1">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
        ))}
      </div>
      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 italic">"{content}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {avatar}
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white text-sm">{name}</div>
          <div className="text-xs text-gray-400">{role}</div>
        </div>
      </div>
    </motion.div>
  );
};

// -------------------------------------------------------------------
// Step Item (extracted to satisfy Rules of Hooks — no hooks in .map())
// -------------------------------------------------------------------
const StepItem: React.FC<{
  step: { num: string; label: string; desc: string };
  index: number;
  total: number;
}> = ({ step, index, total }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative text-center"
    >
      {index < total - 1 && (
        <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary-300 to-violet-300 dark:from-primary-800 dark:to-violet-800" />
      )}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white text-xl font-black mx-auto mb-4 shadow-lg">
        {step.num}
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.label}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
    </motion.div>
  );
};

// -------------------------------------------------------------------
// Main Home Component
// -------------------------------------------------------------------
const Home: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'AI Resume Builder — Create ATS-Optimized Resumes in Minutes';
  }, []);

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'Groq LLaMA AI',
      description: 'Powered by LLaMA 3.3 70B — one of the fastest and most intelligent AI models available. Enhances every bullet point for maximum impact.',
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'ATS Optimized',
      description: 'Our AI rewrites your resume to pass Applicant Tracking Systems used by 98% of Fortune 500 companies. More interviews, guaranteed.',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Ready in 5 Minutes',
      description: 'Fill in your details, click AI Enhance, download. No design skills needed. No templates to fiddle with. Just a professional resume.',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'ATS Score Checker',
      description: 'Paste any job description and instantly get your resume\'s ATS score with matched keywords and specific improvement suggestions.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Live Preview',
      description: 'Watch your resume build in real time as you type. See exactly how it will look before you download — no surprises.',
      gradient: 'from-rose-500 to-pink-600',
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: 'Clean PDF Export',
      description: 'Download a crisp, professional PDF ready to send to recruiters. Perfectly formatted for A4 and Letter paper sizes.',
      gradient: 'from-indigo-500 to-blue-600',
    },
  ];

  const testimonials = [
    {
      name: 'Alex M.',
      role: 'Software Engineer at Google',
      content: 'I used this before my Google interview loop. The AI made my bullet points so much stronger — quantified everything. I got the offer!',
      rating: 5,
      avatar: 'AM',
    },
    {
      name: 'Sarah K.',
      role: 'Product Manager',
      content: 'Created my entire resume in under 10 minutes. The ATS score feature showed me exactly what was missing for the role I was targeting.',
      rating: 5,
      avatar: 'SK',
    },
    {
      name: 'James R.',
      role: 'Data Scientist',
      content: 'The AI enhancement is genuinely impressive. It turned my vague job descriptions into powerful achievement statements. 3 callbacks in a week.',
      rating: 5,
      avatar: 'JR',
    },
  ];

  const steps = [
    { num: '01', label: 'Fill Your Details', desc: 'Personal info, education, experience — takes 3 minutes' },
    { num: '02', label: 'AI Enhancement', desc: 'Click Enhance on any field for instant professional rewrites' },
    { num: '03', label: 'ATS Check', desc: 'Paste the job description and see your compatibility score' },
    { num: '04', label: 'Download PDF', desc: 'One click gets you a recruiter-ready PDF' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">

      {/* ================================================================
          HERO SECTION
      ================================================================ */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary-950 to-violet-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,80,255,0.3),transparent)]" />

        {/* Floating orbs */}
        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-[10%] w-72 h-72 bg-primary-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-10 right-[10%] w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 lg:pt-32 lg:pb-28">
          <div className="text-center max-w-4xl mx-auto">

            {/* Feature badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-8"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Powered by Groq LLaMA 3.3 70B AI
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6"
            >
              Build a{' '}
              <span className="bg-gradient-to-r from-primary-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                Job-Winning
              </span>
              <br />Resume in Minutes
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-lg sm:text-xl text-white/70 mb-4 leading-relaxed max-w-2xl mx-auto"
            >
              AI rewrites your bullet points, optimizes for ATS systems, and generates a polished PDF — 
              so recruiters notice <em>you</em>, not your formatting.
            </motion.p>

            {/* Feature pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-2 mb-10"
            >
              {['ATS-Optimized', 'AI-Powered', 'Free Forever', 'No Sign-up Required*'].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-xs font-medium border border-white/20">
                  {tag}
                </span>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(120,80,255,0.5)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/login')}
                className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-violet-600 text-white text-lg font-bold rounded-2xl shadow-2xl shadow-violet-500/40 transition-all duration-200"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
                Build My Resume — It's Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <button
                onClick={() => navigate('/ats')}
                className="flex items-center gap-2 px-6 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-2xl hover:bg-white/20 transition-all text-base font-semibold"
              >
                <BarChart3 className="w-5 h-5" />
                Check ATS Score
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-white/40 text-xs mt-4"
            >
              *Basic resume creation is free. Sign in to save and manage multiple resumes.
            </motion.p>
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto"
          >
            <StatCard value={12000} suffix="+" label="Resumes Created" icon={<FileText className="w-6 h-6" />} />
            <StatCard value={94}    suffix="%" label="Interview Rate"  icon={<CheckCircle className="w-6 h-6" />} />
            <StatCard value={5}     suffix=" min" label="Avg Build Time" icon={<Clock className="w-6 h-6" />} />
            <StatCard value={4800}  suffix="+"  label="Happy Users"    icon={<Users className="w-6 h-6" />} />
          </motion.div>
        </div>
      </section>

      {/* ================================================================
          HOW IT WORKS
      ================================================================ */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-3">
              Resume ready in 4 steps
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
              No design experience needed. Our AI does the heavy lifting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <StepItem key={step.num} step={step} index={i} total={steps.length} />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          FEATURES GRID
      ================================================================ */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-3">
              Everything you need to land the job
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
              Professional tools. Zero friction. Completely free.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          TESTIMONIALS
      ================================================================ */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-3">
              Loved by job seekers
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Real stories from people who got hired</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <TestimonialCard key={t.name} {...t} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          FINAL CTA
      ================================================================ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-violet-600 to-indigo-700" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(255,255,255,0.1),transparent)]" />
        <div className="relative max-w-3xl mx-auto text-center px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
              Your next job starts<br />with a great resume.
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Join thousands of professionals who built their resume with AI.
            </p>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-3 px-10 py-4 bg-white text-primary-700 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-white/20 transition-all"
            >
              <Sparkles className="w-5 h-5 text-amber-500" />
              Start for Free — Takes 5 Minutes
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <p className="text-white/40 text-xs mt-4">No credit card needed. No spam. Ever.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;