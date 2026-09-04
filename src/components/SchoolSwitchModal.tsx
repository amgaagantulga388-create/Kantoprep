'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, ShieldCheck, Mail, AlertCircle } from 'lucide-react';
import { StudentProfile } from '@/types';
import { ALLOWED_SCHOOLS } from '@/lib/constants';
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
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 z-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
              Pilot Testing Hub
            </span>
            <h2 className="text-base font-bold text-zinc-900">Switch School / Test Gate</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Whitelist Gate Tester */}
        <div className="mt-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
          <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-900 mb-1">
            <Mail className="w-4 h-4 text-emerald-600" />
            <span>Test Email Domain Gate</span>
          </div>
          <p className="text-[11px] text-zinc-600 mb-3">
            Try a personal email (e.g. <code>student@gmail.com</code>) vs a verified school domain (e.g. <code>alex@bst.ac.jp</code> or <code>sato@asij.ac.jp</code>):
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
              className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-500 shadow-2xs"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
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
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {emailValidationResult.valid ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              )}
              <span className="text-[11px] leading-relaxed">
                {emailValidationResult.message}
              </span>
            </motion.div>
          )}
        </div>

        {/* Switch Demo Student Profile */}
        <div className="mt-5">
          <h3 className="text-xs font-semibold text-zinc-700 mb-2">
            Select Active Pilot Student Profile
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
                      ? 'bg-emerald-50 border-emerald-400 text-zinc-900'
                      : 'bg-zinc-50/70 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                      alt={user.fullName}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-zinc-200"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-zinc-900">{user.fullName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-zinc-700 border border-zinc-200">
                          Gr. {user.gradeLevel} • {user.curriculum}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        {user.schoolName} ({user.email})
                      </p>
                    </div>
                  </div>

                  {isCurrent && <Check className="w-4 h-4 text-emerald-600" />}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
