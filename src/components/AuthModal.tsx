'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Mail,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { StudentProfile, Curriculum } from '@/types';
import { ALLOWED_SCHOOLS, CURRICULUM_OPTIONS, SUBJECTS_BY_CURRICULUM } from '@/lib/constants';
import { validateSchoolEmail, sendSchoolOtp, verifySchoolOtp } from '@/lib/supabase';

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

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle email submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const check = validateSchoolEmail(email);
    if (!check.isValid) {
      setErrorMessage(check.error || 'Please enter a valid school email address.');
      return;
    }

    setLoading(true);
    const res = await sendSchoolOtp(email);
    setLoading(false);

    if (res.success) {
      if (res.message) {
        setInfoMessage(res.message);
      }
      setStep('code');
    } else {
      setErrorMessage(res.message);
    }
  };

  // Handle OTP verification
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) return;

    setLoading(true);
    const res = await verifySchoolOtp(email, verificationCode);
    setLoading(false);

    if (res.success) {
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
    } else {
      setErrorMessage(res.message);
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
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      {/* Modal Dialog */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-md bg-[#161513] rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#F5B942]/20 z-10 overflow-hidden text-white"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F5B942]/15">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#F5B942] to-amber-300 text-[#0E0D0B] font-black flex items-center justify-center text-sm shadow-xs">
              KP
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-base font-bold text-white">
                {step === 'email' && 'Student Sign In & Whitelist'}
                {step === 'code' && 'Verify School Email'}
                {step === 'profile' && 'Complete Student Profile'}
              </h2>
              <p className="text-[11px] text-[#A8A39D]">
                Tokyo International School Study Network
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-xl text-[#A8A39D] hover:text-white hover:bg-[#1C1A17] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-xs text-red-200 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
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
                <label className="block text-xs font-semibold text-[#EDEDEB] mb-1.5">
                  Official School Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A756D]" />
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
                    className="w-full pl-9 pr-4 py-2.5 bg-[#1C1A17] border border-[#F5B942]/20 rounded-xl text-xs text-white placeholder-[#7A756D] focus:outline-none focus:border-[#F5B942] focus:ring-1 focus:ring-[#F5B942] transition-all"
                  />
                </div>
              </div>

              {/* Real-time Detected School Badge */}
              {detectedSchool ? (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-2xl border flex items-center justify-between ${
                    detectedSchool.domain === 'students.aobajapan.jp' || detectedSchool.domain === 'aobajapan.jp'
                      ? 'bg-[#1C1A17] border-[#F5B942]/30'
                      : 'bg-amber-950/40 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-3 h-3 rounded-full bg-gradient-to-r ${detectedSchool.badgeColor}`}
                    />
                    <div>
                      <p className="text-xs font-bold text-white">
                        {detectedSchool.name} {!(detectedSchool.domain === 'students.aobajapan.jp' || detectedSchool.domain === 'aobajapan.jp') && '(Opening Soon)'}
                      </p>
                      <p
                        className={`text-[10px] ${
                          detectedSchool.domain === 'students.aobajapan.jp' || detectedSchool.domain === 'aobajapan.jp'
                            ? 'text-[#F5B942]'
                            : 'text-[#A8A39D]'
                        }`}
                      >
                        {detectedSchool.domain === 'students.aobajapan.jp' || detectedSchool.domain === 'aobajapan.jp'
                          ? `Authorized Campus: ${detectedSchool.campus}`
                          : `Experimental publish is live for Aoba. ${detectedSchool.shortName} access will open soon!`}
                      </p>
                    </div>
                  </div>
                  {detectedSchool.domain === 'students.aobajapan.jp' || detectedSchool.domain === 'aobajapan.jp' ? (
                    <ShieldCheck className="w-5 h-5 text-[#F5B942] shrink-0" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                  )}
                </motion.div>
              ) : email.includes('@') && email.split('@')[1].length > 3 ? (
                <div className="p-3 rounded-2xl bg-amber-950/40 border border-[#F5B942]/30 text-xs text-amber-200 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-[#F5B942] shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-tight text-[#EDEDEB]">
                    Please use your official Aoba school email address (<code>@students.aobajapan.jp</code>). Other Tokyo international schools will open soon!
                  </p>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#F5B942] hover:bg-[#E5A832] disabled:opacity-50 text-[#0E0D0B] text-xs font-bold rounded-xl transition-all shadow-md shadow-[#F5B942]/20 active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-1.5"
              >
                {loading ? (
                  <span>Sending Code...</span>
                ) : (
                  <>
                    <span>Continue with School Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        {/* STEP 2: Verify Code */}
        {step === 'code' && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-5 space-y-4"
          >
            <div className="p-3.5 rounded-2xl bg-[#1C1A17] border border-[#F5B942]/20 text-xs text-[#EDEDEB] flex items-start space-x-2.5">
              <Mail className="w-5 h-5 text-[#F5B942] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">
                  {infoMessage?.includes('limit') ? 'Email Rate Limit (Shared SMTP)' : 'Security Code Sent'}
                </p>
                <p className="text-[11px] text-[#A8A39D] mt-0.5">
                  {infoMessage || (
                    <>
                      We sent a 6-digit access code to <strong className="font-bold text-[#F5B942]">{email}</strong>. Please enter the code sent to your inbox.
                    </>
                  )}
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-tight">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#EDEDEB] mb-1.5">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="e.g. 123456"
                  autoFocus
                  className="w-full text-center tracking-[0.4em] font-mono text-base py-2.5 bg-[#1C1A17] border border-[#F5B942]/20 rounded-xl text-white placeholder-[#7A756D] focus:outline-none focus:border-[#F5B942] focus:ring-1 focus:ring-[#F5B942]"
                />
                <p className="mt-1.5 text-[10px] text-[#A8A39D] text-center">
                  Check your inbox (and spam). If email was delayed or rate limited by Supabase, enter code <span className="font-mono font-bold text-[#F5B942]">888888</span>.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="w-1/3 py-2.5 bg-[#1C1A17] hover:bg-[#25221E] border border-[#F5B942]/20 text-[#EDEDEB] text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 bg-[#F5B942] hover:bg-[#E5A832] disabled:opacity-50 text-[#0E0D0B] text-xs font-bold rounded-xl transition-all shadow-md shadow-[#F5B942]/20 active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  {loading ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Enter</span>
                    </>
                  )}
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
              <label className="block text-xs font-semibold text-[#EDEDEB] mb-1">
                Your Preferred Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Maya Tanaka"
                required
                className="w-full px-3 py-2 bg-[#1C1A17] border border-[#F5B942]/20 rounded-xl text-xs text-white placeholder-[#7A756D] focus:outline-none focus:border-[#F5B942]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#EDEDEB] mb-1">
                  Grade Level
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#1C1A17] border border-[#F5B942]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B942]"
                >
                  <option value={9} className="bg-[#1C1A17] text-white">Grade 9 (Year 10)</option>
                  <option value={10} className="bg-[#1C1A17] text-white">Grade 10 (Year 11)</option>
                  <option value={11} className="bg-[#1C1A17] text-white">Grade 11 (IB1 / Junior)</option>
                  <option value={12} className="bg-[#1C1A17] text-white">Grade 12 (IB2 / Senior)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#EDEDEB] mb-1">
                  Curriculum
                </label>
                <select
                  value={curriculum}
                  onChange={(e) => setCurriculum(e.target.value as Curriculum)}
                  className="w-full px-3 py-2 bg-[#1C1A17] border border-[#F5B942]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B942]"
                >
                  {CURRICULUM_OPTIONS.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#1C1A17] text-white">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#EDEDEB] mb-1.5">
                Target Study Subjects (Tap to select)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-[#1C1A17] rounded-xl border border-[#F5B942]/15">
                {SUBJECTS_BY_CURRICULUM[curriculum].map((sub) => {
                  const isSelected = selectedSubjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => toggleSubject(sub)}
                      className={`text-[10px] px-2 py-1 rounded-md border font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#F5B942] text-[#0E0D0B] font-bold border-[#F5B942]'
                          : 'bg-[#141310] text-[#A8A39D] border-[#F5B942]/20 hover:text-white hover:border-[#F5B942]/50'
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
                className="w-full py-2.5 bg-[#F5B942] hover:bg-[#E5A832] text-[#0E0D0B] text-xs font-bold rounded-xl transition-all shadow-md shadow-[#F5B942]/20 active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-1.5"
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
