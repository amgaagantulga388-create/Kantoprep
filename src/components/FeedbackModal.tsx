'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquarePlus, CheckCircle2, Sparkles, MapPin, Bug, Lightbulb, MessageCircle } from 'lucide-react';
import { StudentProfile, FeedbackReport } from '@/types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StudentProfile | null;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [category, setCategory] = useState<FeedbackReport['category']>('venue_suggestion');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const categories: { id: FeedbackReport['category']; label: string; icon: React.ElementType }[] = [
    { id: 'venue_suggestion', label: 'Suggest a Safe Library / Venue', icon: MapPin },
    { id: 'feature_request', label: 'Feature Request', icon: Lightbulb },
    { id: 'bug_report', label: 'Bug Report', icon: Bug },
    { id: 'general', label: 'General Feedback', icon: MessageCircle },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const report: FeedbackReport = {
      id: `fb_${Date.now()}`,
      category,
      message: message.trim(),
      studentEmail: currentUser?.email,
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('kantoprep_feedback') || '[]');
      localStorage.setItem('kantoprep_feedback', JSON.stringify([report, ...existing]));
    } catch {
      // Ignore
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setMessage('');
      onClose();
    }, 2200);
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

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-md bg-[#161513] rounded-3xl p-6 shadow-2xl border border-[#F5B942]/20 z-10 overflow-hidden text-white"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#F5B942]/15">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#F5B942]/10 border border-[#F5B942]/30 text-[#F5B942] flex items-center justify-center">
              <MessageSquarePlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Share Feedback or Suggestion</h2>
              <p className="text-[11px] text-[#A8A39D]">Help shape KantoPrep for Tokyo students</p>
            </div>
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
            <h3 className="text-base font-bold text-white">Thank You!</h3>
            <p className="text-xs text-[#A8A39D] max-w-xs mx-auto">
              Your feedback helps make KantoPrep safer, smoother, and more useful for international students across Tokyo.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-[#EDEDEB] mb-1.5">
                Category
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#F5B942]/15 border-[#F5B942] text-white font-bold shadow-2xs'
                          : 'bg-[#1C1A17] border-[#F5B942]/15 text-[#A8A39D] hover:bg-[#25221E]'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#F5B942]' : 'text-[#7A756D]'}`} />
                      <span className="text-[11px] truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#EDEDEB] mb-1.5">
                {category === 'venue_suggestion'
                  ? 'Which library or public study hub should we add?'
                  : 'Your Notes & Ideas'}
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  category === 'venue_suggestion'
                    ? 'e.g. Suginami Central Library near Ogikubo, or Meguro City Library...'
                    : 'Tell us what you would like to see or what we can improve...'
                }
                required
                className="w-full p-2.5 bg-[#1C1A17] border border-[#F5B942]/20 rounded-xl text-xs text-white placeholder-[#7A756D] focus:outline-none focus:border-[#F5B942]"
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
                disabled={!message.trim()}
                className="px-4 py-2 rounded-xl bg-[#F5B942] hover:bg-[#E5A832] disabled:opacity-50 text-[#0E0D0B] font-bold transition-all shadow-md shadow-[#F5B942]/20 active:scale-95 cursor-pointer flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
