'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { X, Check, ShieldCheck, Mail, AlertCircle } from 'lucide-react';
import { StudentProfile } from '@/types';
import { INITIAL_STUDENTS, CURRENT_USER } from '@/lib/mockData';
import { validateSchoolEmail } from '@/lib/supabase';

interface SchoolSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StudentProfile;
  onSelectUser: (user: StudentProfile) => void;
}

export const SchoolSwitchModal: React.FC<SchoolSwitchModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const [testEmail, setTestEmail] = useState('');
  const [emailValidationResult, setEmailValidationResult] = useState<{
    tested: boolean;
    valid: boolean;
    message: string;
  } | null>(null);

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

  if (!isOpen) return null;

  const demoAccounts = [
    CURRENT_USER,
    INITIAL_STUDENTS.usr_1,
    INITIAL_STUDENTS.usr_2,
    INITIAL_STUDENTS.usr_3,
    INITIAL_STUDENTS.usr_4,
    INITIAL_STUDENTS.usr_5,
  ];

  const handleTestEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail.trim()) return;

    const res = validateSchoolEmail(testEmail);
    if (res.isValid) {
      setEmailValidationResult({
        tested: true,
        valid: true,
        message: `Verified! Matched to ${res.schoolName}. Authorized for KantoPrep.`,
      });
    } else {
      setEmailValidationResult({
        tested: true,
        valid: false,
        message: res.error || 'Access denied: Only verified Tokyo international school domains are whitelisted.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="school-switch-title"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-lg bg-[#161513] rounded-3xl p-6 shadow-2xl border border-[#F5B942]/20 z-10 max-h-[90vh] overflow-y-auto text-white"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#F5B942]/15">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F5B942]">
              School & Account Hub
            </span>
            <h2 id="school-switch-title" className="text-base font-bold text-white">Switch School / Test Gate</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-xl text-[#A8A39D] hover:text-white hover:bg-[#1C1A17] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Whitelist Gate Tester */}
        <div className="mt-4 p-4 rounded-2xl bg-[#1C1A17] border border-[#F5B942]/15">
          <div className="flex items-center space-x-2 text-xs font-semibold text-white mb-1">
            <Mail className="w-4 h-4 text-[#F5B942]" />
            <span>Test Email Domain Gate</span>
          </div>
          <p className="text-[11px] text-[#A8A39D] mb-3">
            Try an Aoba email (e.g. <code>student@students.aobajapan.jp</code>), a personal email (e.g. <code>student@gmail.com</code>), or another school domain (e.g. <code>alex@bst.ac.jp</code>):
          </p>

          <form onSubmit={handleTestEmailSubmit} className="flex gap-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => {
                setTestEmail(e.target.value);
                setEmailValidationResult(null);
              }}
              placeholder="e.g. test@students.aobajapan.jp"
              className="flex-1 px-3 py-2 bg-[#141310] border border-[#F5B942]/20 rounded-xl text-xs text-white placeholder-[#7A756D] focus:outline-none focus:border-[#F5B942] shadow-2xs"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-[#F5B942] hover:bg-[#E5A832] text-[#0E0D0B] text-xs font-bold rounded-xl transition-all shadow-md shadow-[#F5B942]/20 cursor-pointer"
            >
              Verify
            </button>
          </form>

          {emailValidationResult && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-2.5 p-2.5 rounded-xl text-xs flex items-start space-x-2 ${
                emailValidationResult.valid
                  ? 'bg-[#F5B942]/10 border border-[#F5B942]/30 text-[#F5B942]'
                  : 'bg-red-950/40 border border-red-500/30 text-red-200'
              }`}
            >
              {emailValidationResult.valid ? (
                <ShieldCheck className="w-4 h-4 text-[#F5B942] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <span className="text-[11px] leading-relaxed">
                {emailValidationResult.message}
              </span>
            </motion.div>
          )}
        </div>

        {/* Switch Demo Student Profile */}
        <div className="mt-5">
          <h3 className="text-xs font-semibold text-[#EDEDEB] mb-2">
            Select Active Student Profile
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {demoAccounts.map((user) => {
              const isCurrent = user.id === currentUser.id;

              return (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    onClose();
                  }}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[#F5B942]/15 border-[#F5B942] text-white shadow-2xs'
                      : 'bg-[#1C1A17] border-[#F5B942]/15 text-[#A8A39D] hover:bg-[#25221E]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Image
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                      alt={user.fullName}
                      width={36}
                      height={36}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-[#F5B942]/30"
                      unoptimized={user.avatarUrl?.startsWith('data:')}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{user.fullName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#141310] text-[#EDEDEB] border border-[#F5B942]/20">
                          Gr. {user.gradeLevel} • {user.curriculum}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7A756D]">
                        {user.schoolName} ({user.email})
                      </p>
                    </div>
                  </div>

                  {isCurrent && <Check className="w-4 h-4 text-[#F5B942]" />}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
