'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { StudyGroup, StudentProfile } from '@/types';
import { sanitizeInput } from '@/lib/safety';

interface SafetyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: StudyGroup | null;
  currentUser: StudentProfile;
}

export const SafetyReportModal: React.FC<SafetyReportModalProps> = ({
  isOpen,
  onClose,
  group,
  currentUser,
}) => {
  const [reason, setReason] = useState('Academic Dishonesty / Exam Leaks');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !group) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedDetails = sanitizeInput(details);
    const reportData = {
      id: `report_${Date.now()}`,
      groupId: group.id,
      groupTitle: group.title,
      reporter: currentUser.email,
      reporterName: currentUser.fullName,
      reason,
      details: sanitizedDetails,
      timestamp: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('kantoprep_safety_reports') || '[]');
      localStorage.setItem('kantoprep_safety_reports', JSON.stringify([reportData, ...existing]));
    } catch {
      // Ignore
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  const reportReasons = [
    'Academic Dishonesty / Exam Leak Request',
    'Inappropriate Language or Harassment',
    'Commercial Solicitation / Paid Tutoring Spam',
    'Unsafe Off-Platform Meeting Request',
    'Other Safety Concern',
  ];

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
        className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-200 z-10"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <div className="flex items-center space-x-2 text-red-600">
            <ShieldAlert className="w-5 h-5" />
            <h2 className="text-base font-bold text-zinc-900">Student Safety Report</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-10 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-base font-semibold text-zinc-900">Report Submitted</h3>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              Thank you for protecting our Tokyo student network. The room log has been flagged for immediate student lead review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800">
              <p className="font-semibold">Reporting session: {group.title}</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">Host: {group.host.fullName} ({group.host.schoolName})</p>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1.5">
                Reason for Incident Report
              </label>
              <div className="space-y-1.5">
                {reportReasons.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center space-x-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                      reason === r
                        ? 'bg-red-50 border-red-300 text-red-900 font-medium'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reason === r}
                      onChange={(e) => setReason(e.target.value)}
                      className="text-red-600 focus:ring-0"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1.5">
                Additional Details (Optional)
              </label>
              <textarea
                rows={2}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide any specific context or message excerpt..."
                className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-all shadow-md shadow-red-600/15 active:scale-95 cursor-pointer"
              >
                Submit Incident Report
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
