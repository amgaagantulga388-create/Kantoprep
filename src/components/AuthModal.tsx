'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  School,
  Lock,
  UserCheck,
} from 'lucide-react';
import { StudentProfile, Curriculum } from '@/types';
import { ALLOWED_SCHOOLS, CURRICULUM_OPTIONS, SUBJECTS_BY_CURRICULUM } from '@/lib/constants';
import { validateSchoolEmail } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (user: StudentProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [step, setStep] = useState<'email' | 'code' | 'profile'>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New profile state (if onboarding)
  const [fullName, setFullName] = useState('');
  const [gradeLevel, setGradeLevel] = useState<number>(11);
  const [curriculum, setCurriculum] = useState<Curriculum>('IB');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'Math Analysis & Approaches HL',
    'Physics HL',
  ]);

  // Live matching of school based on email input
  const detectedSchool = useMemo(() => {
    if (!email.includes('@')) return null;
    const domain = email.split('@')[1]?.toLowerCase().trim();
    if (!domain) return null;
    return ALLOWED_SCHOOLS.find((s) => s.domain === domain) || null;
  }, [email]);

  if (!isOpen) return null;

  // Handle email submit
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const check = validateSchoolEmail(email);
    if (!check.isValid) {
      setErrorMessage(check.error || 'Please enter a valid school email address.');
      return;
    }

    // Move to verification code or quick confirm
    setStep('code');
  };

  // Quick Pilot Bypass (1-click testing for school pilot)
  const handleQuickPilotLogin = (schoolDomain: string) => {
    const school = ALLOWED_SCHOOLS.find((s) => s.domain === schoolDomain) || ALLOWED_SCHOOLS[0];
    const demoUser: StudentProfile = {
      id: `usr_${Date.now()}`,
      fullName: 'Maya Tanaka',
      email: `maya.tanaka@${school.domain}`,
      schoolDomain: school.domain,
      schoolName: school.name,
      gradeLevel: 11,
      curriculum: 'IB',
      subjects: ['Math Analysis & Approaches HL', 'Physics HL', 'Economics HL'],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      role: 'student',
    };

    onAuthenticated(demoUser);
    onClose();
  };

  // Handle OTP verification
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    // In pilot mode, any 6-digit code or default enters onboarding / login
    if (!fullName) {
      // Prompt quick profile setup if name is not set
      const derivedName = email.split('@')[0].replace(/[._]/g, ' ');
      const formattedName = derivedName
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      setFullName(formattedName || 'Tokyo Student');
      setStep('profile');
    } else {
      completeLogin();
    }
  };

  // Complete profile setup
  const completeLogin = () => {
    const school = detectedSchool || ALLOWED_SCHOOLS[0];
    const newUser: StudentProfile = {
      id: `usr_${Date.now()}`,
      fullName: fullName.trim() || 'Tokyo Student',
      email: email.trim().toLowerCase(),
      schoolDomain: school.domain,
      schoolName: school.name,
      gradeLevel,
      curriculum,
      subjects: selectedSubjects,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120`,
      role: 'student',
    };

    onAuthenticated(newUser);
    onClose();
  };

  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-zinc-200 z-10 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              KP
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">
                {step === 'email' && 'Student Sign In & Whitelist'}
                {step === 'code' && 'Verify School Email'}
                {step === 'profile' && 'Complete Student Profile'}
              </h2>
              <p className="text-[11px] text-zinc-500">
                Tokyo International School Study Network
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="text-[11px] leading-tight">{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Enter School Email */}
        {step === 'email' && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-5 space-y-4"
          >
            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Official School Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="e.g. yourname@students.aobajapan.jp"
                    required
                    autoFocus
                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Real-time Detected School Badge */}
              {detectedSchool ? (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-3 h-3 rounded-full bg-gradient-to-r ${detectedSchool.badgeColor}`}
                    />
                    <div>
                      <p className="text-xs font-bold text-emerald-950">
                        {detectedSchool.name}
                      </p>
                      <p className="text-[10px] text-emerald-700">
                        Authorized Campus: {detectedSchool.campus}
                      </p>
                    </div>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                </motion.div>
              ) : email.includes('@') && email.split('@')[1].length > 3 ? (
                <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-tight">
                    Domain not recognized yet. KantoPrep currently whitelists A-JIS (@students.aobajapan.jp), BST, ASIJ, KIST, St. Mary&apos;s, Seisen, ISSH, YIS, CAJ, and Saint Maur.
                  </p>
                </div>
              ) : null}

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>Continue with School Email</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Pilot Testing Bypass */}
            <div className="pt-3 border-t border-zinc-100 text-center">
              <span className="text-[11px] text-zinc-400 font-medium">
                — OR INSTANT DEMO LOGIN FOR TESTING —
              </span>
              <div className="mt-2.5 flex flex-wrap gap-1.5 justify-center">
                {['students.aobajapan.jp', 'bst.ac.jp', 'asij.ac.jp'].map((dom) => {
                  const s = ALLOWED_SCHOOLS.find((sch) => sch.domain === dom);
                  return (
                    <button
                      key={dom}
                      type="button"
                      onClick={() => handleQuickPilotLogin(dom)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-zinc-200 text-[11px] text-zinc-600 font-medium transition-colors cursor-pointer"
                    >
                      Login as {s?.shortName}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Verify Code */}
        {step === 'code' && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-5 space-y-4"
          >
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-start space-x-2.5">
              <Mail className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Security Code Sent</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  We sent a 6-digit access code to <strong className="font-bold">{email}</strong>. (In pilot mode, you can enter any 6 digits).
                </p>
              </div>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="e.g. 123456"
                  autoFocus
                  className="w-full text-center tracking-[0.4em] font-mono text-base py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-1/3 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Enter</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* STEP 3: Quick Student Profile Setup */}
        {step === 'profile' && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-4 space-y-3.5 max-h-[70vh] overflow-y-auto pr-1"
          >
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Your Preferred Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Maya Tanaka"
                required
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Grade Level
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value={9}>Grade 9 (Year 10)</option>
                  <option value={10}>Grade 10 (Year 11)</option>
                  <option value={11}>Grade 11 (IB1 / Junior)</option>
                  <option value={12}>Grade 12 (IB2 / Senior)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Curriculum
                </label>
                <select
                  value={curriculum}
                  onChange={(e) => setCurriculum(e.target.value as Curriculum)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-emerald-500"
                >
                  {CURRICULUM_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Target Study Subjects (Tap to select)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-zinc-50 rounded-xl border border-zinc-200">
                {SUBJECTS_BY_CURRICULUM[curriculum].map((sub) => {
                  const isSelected = selectedSubjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => toggleSubject(sub)}
                      className={`text-[10px] px-2 py-1 rounded-md border font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={completeLogin}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Complete Profile & Start Studying</span>
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
