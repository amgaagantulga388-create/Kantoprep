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
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-md bg-[#161513] rounded-3xl p-6 shadow-2xl border border-red-500/30 z-10 text-white"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#F5B942]/15">
          <div className="flex items-center space-x-2 text-red-400">
            <ShieldAlert className="w-5 h-5" />
            <h2 className="text-base font-bold text-white">Student Safety Report</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#A8A39D] hover:text-white hover:bg-[#1C1A17] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-10 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#F5B942] mx-auto animate-bounce" />
            <h3 className="text-base font-semibold text-white">Report Submitted</h3>
            <p className="text-xs text-[#A8A39D] max-w-xs mx-auto">
              Thank you for protecting our Tokyo student network. The room log has been flagged for immediate student lead review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200">
              <p className="font-semibold">Reporting session: {group.title}</p>
              <p className="text-[11px] text-[#A8A39D] mt-0.5">Host: {group.host.fullName} ({group.host.schoolName})</p>
            </div>

            <div>
              <label className="block font-semibold text-[#EDEDEB] mb-1.5">
                Reason for Incident Report
              </label>
              <div className="space-y-1.5">
                {reportReasons.map((r) => (
                  <label
                    key={r}
                    className={`flex items-center space-x-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                      reason === r
                        ? 'bg-red-950/50 border-red-500/60 text-red-200 font-medium'
                        : 'bg-[#1C1A17] border-[#F5B942]/15 text-[#A8A39D] hover:border-[#F5B942]/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reason === r}
                      onChange={(e) => setReason(e.target.value)}
                      className="text-red-500 focus:ring-0 accent-red-500"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#EDEDEB] mb-1.5">
                Additional Details (Optional)
              </label>
              <textarea
                rows={2}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Provide any specific context or message excerpt..."
                className="w-full p-2.5 bg-[#1C1A17] border border-[#F5B942]/20 rounded-xl text-xs text-white placeholder-[#7A756D] focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#1C1A17] border border-[#F5B942]/20 text-[#EDEDEB] hover:bg-[#25221E] font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-md shadow-red-600/20 active:scale-95 cursor-pointer"
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
