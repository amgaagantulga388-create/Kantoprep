'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Flame,
  Brain,
  ShieldCheck,
  Headphones,
  BookOpen,
  MapPin,
  Smile,
} from 'lucide-react';

interface WhyKantoPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhyKantoPrepModal: React.FC<WhyKantoPrepModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'mission' | 'science' | 'how'>('mission');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-5 sm:px-7 pt-6 pb-4 border-b border-zinc-100 flex items-start justify-between bg-gradient-to-r from-emerald-50/70 via-white to-teal-50/50">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold mb-2">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Our Purpose &amp; The Science</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                Why KantoPrep Exists
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                Built by a student, backed by real human psychology.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-zinc-100 px-5 sm:px-7 bg-zinc-50/50 text-xs font-semibold text-zinc-500">
            <button
              onClick={() => setActiveTab('mission')}
              className={`py-3 px-3 border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'mission'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent hover:text-zinc-800'
              }`}
            >
              <span>Our Mission</span>
            </button>
            <button
              onClick={() => setActiveTab('science')}
              className={`py-3 px-3 border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'science'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent hover:text-zinc-800'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>The Science</span>
            </button>
            <button
              onClick={() => setActiveTab('how')}
              className={`py-3 px-3 border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'how'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent hover:text-zinc-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>How Pods Work</span>
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-sm leading-relaxed text-zinc-700">
            {/* TAB 1: CONCISE, TOUCHING MISSION */}
            {activeTab === 'mission' && (
              <div className="space-y-4 pt-1">
                <div className="space-y-3.5 text-zinc-700 text-sm sm:text-[15px]">
                  <p className="font-semibold text-zinc-900">
                    Hey. Let&apos;s be honest for a second.
                  </p>
                  <p>
                    If you&apos;re staring at an IB, AP, or SAT practice test right now and feeling overwhelmed—take a breath.
                  </p>
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border-l-4 border-emerald-500 text-zinc-800 font-medium text-sm">
                    Here&apos;s the truth: nobody has it figured out. We are all feeling the exact same panic.
                  </div>
                  <p>
                    I built KantoPrep because I realized there are thousands of us in Tokyo doing the exact same past papers in isolation. We don&apos;t need expensive private tutors. We just need each other.
                  </p>
                  <p className="pt-2 text-zinc-500 text-xs font-semibold">
                    — Amgaa
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: THE PERSUASIVE SCIENCE */}
            {activeTab === 'science' && (
              <div className="space-y-4">
                <p className="text-xs sm:text-sm text-zinc-600">
                  Studying alone feels natural, but behavioral psychology proves working alongside peers unlocks far greater stamina:
                </p>

                {/* Point 1 */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm mb-1">
                    <Flame className="w-4 h-4 text-emerald-600" />
                    <span>The Runner Effect (Köhler Effect)</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    Running 5km alone, your brain urges you to quit early. Running alongside a partner, your stamina more than doubles. When you see someone quietly persisting through tough questions, your focus instinctively stays locked in.
                  </p>
                </div>

                {/* Point 2 */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm mb-1">
                    <Headphones className="w-4 h-4 text-emerald-600" />
                    <span>Body Doubling</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    Sitting in a room next to another focused person anchors your attention and stops task procrastination. You don&apos;t even need to talk—their presence alone keeps you working.
                  </p>
                </div>

                {/* Point 3 */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm mb-1">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Peer Instruction</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    Research from Harvard shows students learn twice as fast from peers than from textbooks alone. A fellow student who solved the problem ten minutes ago understands the exact friction you&apos;re feeling.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: HOW PODS WORK */}
            {activeTab === 'how' && (
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-white border border-zinc-200">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 text-sm">Quiet Focus Sprints</h4>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      25-minute Pomodoro focus rounds. Everyone wears headphones and works quietly at their own pace.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-white border border-zinc-200">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 text-sm">Resource &amp; Markscheme Sharing</h4>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      Share Drive notes, question banks, and past paper markschemes with peers taking the exact same exams.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-white border border-zinc-200">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 text-sm">Safe Public Libraries</h4>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      Sessions take place exclusively in public hubs like Tokyo Metropolitan Central Library (Hiroo) and Minato Central Library (Mita).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="p-4 sm:p-5 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-zinc-500">
              <Smile className="w-4 h-4 text-emerald-600" />
              <span>Verified Tokyo International School Network</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/15 cursor-pointer transition-all active:scale-95"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
