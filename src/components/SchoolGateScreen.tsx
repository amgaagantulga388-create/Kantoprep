'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Mail,
  ArrowRight,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  MapPin,
  MessageSquarePlus,
} from 'lucide-react';
import { StudentProfile, Curriculum } from '@/types';
import { ALLOWED_SCHOOLS, CURRICULUM_OPTIONS, SUBJECTS_BY_CURRICULUM, PRESET_AVATARS } from '@/lib/constants';
import { validateSchoolEmail, sendSchoolOtp, verifySchoolOtp } from '@/lib/supabase';
import { InteractiveBackground } from './InteractiveBackground';

interface SchoolGateScreenProps {
  onAuthenticated: (user: StudentProfile) => void;
  onOpenFeedback?: () => void;
  onOpenWhyKantoPrep?: () => void;
}

export const SchoolGateScreen: React.FC<SchoolGateScreenProps> = ({
  onAuthenticated,
  onOpenFeedback,
  onOpenWhyKantoPrep,
}) => {
  const [step, setStep] = useState<'email' | 'code' | 'profile'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Profile setup for new students
  const [fullName, setFullName] = useState('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(PRESET_AVATARS[0].url);
  const [nameError, setNameError] = useState<string | null>(null);
  const [gradeLevel, setGradeLevel] = useState<number>(11);
  const [curriculum, setCurriculum] = useState<Curriculum>('IB');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'Math Analysis & Approaches HL',
    'Physics HL',
  ]);

  // Real-time school recognition
  const detectedSchool = useMemo(() => {
    if (!email.includes('@')) return null;
    const domain = email.split('@')[1]?.toLowerCase().trim();
    if (!domain) return null;
    return ALLOWED_SCHOOLS.find((s) => s.domain === domain) || null;
  }, [email]);

  // Step 1: Send 6-digit OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const check = validateSchoolEmail(email);
    if (!check.isValid) {
      setErrorMessage(check.error || 'Please enter a valid school email address.');
      return;
    }

    setLoading(true);
    const res = await sendSchoolOtp(email);
    setLoading(false);

    if (res.success) {
      setStep('code');
    } else {
      setErrorMessage(res.message);
    }
  };

  // Step 2: Verify 6-digit OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    const res = await verifySchoolOtp(email, code);
    setLoading(false);

    if (res.success) {
      if (!fullName) {
        const derived = email.split('@')[0].replace(/[._]/g, ' ');
        const formatted = derived
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        setFullName(formatted || '');
      }
      setStep('profile');
    } else {
      setErrorMessage(res.message);
    }
  };

  // Complete profile and enter dashboard
  const finishLogin = () => {
    const cleanName = fullName.trim();
    if (!cleanName) {
      setNameError('Nickname or real name is mandatory to join study pods.');
      return;
    }

    const school = detectedSchool || ALLOWED_SCHOOLS[0];
    const newUser: StudentProfile = {
      id: `usr_${Date.now()}`,
      fullName: cleanName,
      email: email.trim().toLowerCase(),
      schoolDomain: school.domain,
      schoolName: school.name,
      gradeLevel,
      curriculum,
      subjects: selectedSubjects,
      avatarUrl: selectedAvatarUrl,
      role: 'student',
    };

    onAuthenticated(newUser);
  };

  // Quick 1-click test bypass
  const handleQuickPilotLogin = (domain: string) => {
    const school = ALLOWED_SCHOOLS.find((s) => s.domain === domain) || ALLOWED_SCHOOLS[0];
    const pilotUser: StudentProfile = {
      id: `usr_${Date.now()}`,
      fullName: 'Aoba Pilot Student',
      email: `student@${school.domain}`,
      schoolDomain: school.domain,
      schoolName: school.name,
      gradeLevel: 11,
      curriculum: 'IB',
      subjects: ['Math Analysis & Approaches HL', 'Physics HL', 'Economics HL'],
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      role: 'student',
    };

    onAuthenticated(pilotUser);
  };

  const toggleSubject = (sub: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f7faf8] text-zinc-900 selection:bg-emerald-500/20 selection:text-emerald-900 relative overflow-hidden">
      {/* Interactive cursor spotlight */}
      <InteractiveBackground />

      {/* Top Header */}
      <header className="relative z-10 w-full px-4 sm:px-6 py-4 sm:py-5 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-md shadow-emerald-600/15 border border-emerald-200/80 shrink-0 bg-white">
            <img
              src="/logo.png"
              alt="KantoPrep Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-zinc-900">KantoPrep</span>
            <span className="ml-1.5 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              Pilot
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenWhyKantoPrep && (
            <button
              onClick={onOpenWhyKantoPrep}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50/80 border border-emerald-200 hover:border-emerald-300 text-xs text-emerald-800 font-semibold transition-all shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Why KantoPrep?</span>
            </button>
          )}
          {onOpenFeedback && (
            <button
              onClick={onOpenFeedback}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/80 border border-zinc-200 hover:border-emerald-300 text-xs text-zinc-600 hover:text-emerald-700 font-medium transition-all shadow-2xs cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Suggest a Venue</span>
            </button>
          )}
        </div>
      </header>

      {/* Center Gated Access Screen */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md mx-auto">
          {/* Tagline & Logo Emblem */}
          <div className="text-center mb-5 sm:mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3.5 rounded-full overflow-hidden shadow-lg shadow-emerald-600/15 border-2 border-emerald-500/20 bg-white p-0.5"
            >
              <img
                src="/logo.png"
                alt="KantoPrep Emblem"
                className="w-full h-full object-cover rounded-full"
              />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 leading-tight"
            >
              You don&apos;t have to study alone.{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500">
                Ever.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-zinc-600 max-w-xs sm:max-w-sm mx-auto"
            >
              Tokyo&apos;s verified student study network for IB & AP. Sign in with your school email to unlock study pods.
            </motion.p>
            {onOpenWhyKantoPrep && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-2.5"
              >
                <button
                  type="button"
                  onClick={onOpenWhyKantoPrep}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-200/90 text-xs font-semibold text-emerald-800 transition-all cursor-pointer shadow-2xs group active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span>Why KantoPrep? (Our Mission)</span>
                </button>
              </motion.div>
            )}
          </div>

          {/* Gated Access Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350, delay: 0.15 }}
            className="p-5 sm:p-7 rounded-3xl bg-white/95 border border-emerald-100 shadow-xl shadow-emerald-600/5 relative overflow-hidden"
          >
            {/* Step 1: Email Entry */}
            {step === 'email' && (
              <form onSubmit={handleSendOtp} className="space-y-3.5 sm:space-y-4">
                <div className="flex items-center space-x-2 pb-2.5 border-b border-zinc-100">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-xs sm:text-sm font-bold text-zinc-900">
                    School Email Verification
                  </h2>
                </div>

                {errorMessage && (
                  <div className="p-2.5 sm:p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Official School Email
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
                      placeholder="e.g. name@students.aobajapan.jp"
                      required
                      autoFocus
                      className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-base sm:text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Live Detected School Badge */}
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
                          Campus: {detectedSchool.campus}
                        </p>
                      </div>
                    </div>
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  </motion.div>
                ) : email.includes('@') && email.split('@')[1].length > 3 ? (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-tight">
                      Domain not recognized. Whitelisted: A-JIS (@students.aobajapan.jp), BST, ASIJ, KIST, St. Mary&apos;s, Seisen, ISSH, YIS, CAJ, and Saint Maur.
                    </p>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  {loading ? (
                    <span>Sending Code...</span>
                  ) : (
                    <>
                      <span>Receive 6-Digit Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Instant Pilot Testing Section */}
                <div className="pt-2.5 border-t border-zinc-100 text-center">
                  <span className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">
                    — Or 1-Click Pilot Testing Login —
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5 justify-center">
                    <button
                      type="button"
                      onClick={() => handleQuickPilotLogin('students.aobajapan.jp')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs text-emerald-800 font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      Login as A-JIS Student
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPilotLogin('bst.ac.jp')}
                      className="px-2.5 py-1.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs text-zinc-600 font-medium transition-all cursor-pointer"
                    >
                      BST
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPilotLogin('asij.ac.jp')}
                      className="px-2.5 py-1.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs text-zinc-600 font-medium transition-all cursor-pointer"
                    >
                      ASIJ
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Step 2: 6-Digit Code Entry */}
            {step === 'code' && (
              <form onSubmit={handleVerifyOtp} className="space-y-3.5 sm:space-y-4">
                <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 flex items-start space-x-2.5">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">6-Digit Code Sent</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Sent to <strong className="font-semibold">{email}</strong>. (In pilot mode, type any 6 digits to verify).
                    </p>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight">{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="123456"
                    autoFocus
                    className="w-full text-center tracking-[0.4em] font-mono text-xl py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setCode('');
                    }}
                    className="w-1/3 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || code.length < 6}
                    className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Unlock</span>
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Fast Profile Setup */}
            {step === 'profile' && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 pb-2 border-b border-zinc-100">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-xs sm:text-sm font-bold text-zinc-900">
                    Welcome! Set Up Your Profile
                  </h2>
                </div>

                {/* Avatar Selection (No real photo needed) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-zinc-700">
                      Choose Avatar <span className="text-zinc-400 font-normal">(No real photo needed)</span>
                    </label>
                    <div className="w-6 h-6 rounded-full overflow-hidden ring-2 ring-emerald-500 shadow-xs">
                      <img
                        src={selectedAvatarUrl}
                        alt="Selected Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 p-2 bg-zinc-50 rounded-2xl border border-zinc-200">
                    {PRESET_AVATARS.map((preset) => {
                      const isSelected = selectedAvatarUrl === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setSelectedAvatarUrl(preset.url)}
                          title={preset.name}
                          className={`p-1 rounded-xl transition-all cursor-pointer aspect-square flex items-center justify-center ${
                            isSelected
                              ? 'ring-2 ring-emerald-600 bg-white shadow-xs scale-105'
                              : 'hover:bg-white/80 hover:scale-105'
                          }`}
                        >
                          <img src={preset.url} alt={preset.name} className="w-7 h-7 rounded-full" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Nickname or Real Name <span className="text-emerald-600">* (Mandatory)</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (nameError) setNameError(null);
                    }}
                    placeholder="e.g. Kai, Maya T, or your real name"
                    required
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-base sm:text-xs text-zinc-900 focus:outline-none focus:border-emerald-500"
                  />
                  {nameError && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{nameError}</p>
                  )}
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
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Target Subjects
                  </label>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-zinc-50 rounded-xl border border-zinc-200">
                    {SUBJECTS_BY_CURRICULUM[curriculum].map((sub) => {
                      const isSelected = selectedSubjects.includes(sub);
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => toggleSubject(sub)}
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-medium transition-all cursor-pointer ${
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

                <button
                  type="button"
                  onClick={finishLogin}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Enter KantoPrep</span>
                </button>
              </div>
            )}
          </motion.div>

          {/* Safety & Trust Pillars */}
          <div className="mt-4 sm:mt-5 grid grid-cols-2 gap-2 text-center text-[11px] text-zinc-500">
            <div className="p-2 rounded-xl bg-white/70 border border-emerald-100 flex items-center justify-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Verified School Inboxes</span>
            </div>
            <div className="p-2 rounded-xl bg-white/70 border border-emerald-100 flex items-center justify-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Safe Public Hubs Only</span>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 w-full py-3 sm:py-4 text-center text-[11px] text-zinc-400 px-4 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
        <span>KantoPrep</span>
        <span>•</span>
        <span>Verified Tokyo Peer Study Network</span>
        <span>•</span>
        <a
          href="https://instagram.com/kantoprep"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          <svg className="w-3 h-3 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
          <span>@kantoprep</span>
        </a>
        <span>•</span>
        <span>Free Non-Profit</span>
      </footer>
    </div>
  );
};
