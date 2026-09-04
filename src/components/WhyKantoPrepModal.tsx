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
  Heart,
  BookOpen,
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
  const [activeTab, setActiveTab] = useState<'letter' | 'science' | 'rules'>('letter');

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
                <span>Our Purpose & The Science</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                Why KantoPrep Exists
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                Built by a Tokyo international student, backed by real human psychology.
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
              onClick={() => setActiveTab('letter')}
              className={`py-3 px-3 border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'letter'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent hover:text-zinc-800'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>A Note From Amgaa</span>
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
              <span>The Science (Why It Works)</span>
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`py-3 px-3 border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'rules'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent hover:text-zinc-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Nervous? (Zero-Awkward Pledge)</span>
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-sm leading-relaxed text-zinc-700">
            {/* TAB 1: AMGA'S DIRECT SPEECH */}
            {activeTab === 'letter' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm text-sm">
                    AG
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 text-sm">Amgaa Gantulga</h4>
                    <p className="text-xs text-zinc-500">Founder of KantoPrep • Student at Aoba-Japan International School</p>
                  </div>
                </div>

                <div className="space-y-3.5 text-zinc-700 text-sm sm:text-[15px]">
                  <p className="font-medium text-zinc-900">
                    Hey. Let&apos;s be completely honest for a second.
                  </p>
                  <p>
                    If you&apos;re staring at an IB past paper, AP question booklet, or Digital SAT practice test right now and feeling completely overwhelmed—take a breath. I&apos;ve been sitting right where you are.
                  </p>
                  <p>
                    The hardest part of high school in Tokyo isn&apos;t the syllabus. It&apos;s sitting in your bedroom alone at 1 AM, convinced that everyone around you has their life completely together while you&apos;re secretly drowning in past papers.
                  </p>
                  <div className="p-3.5 rounded-xl bg-zinc-50 border-l-4 border-emerald-500 text-zinc-800 font-semibold text-sm">
                    Here&apos;s the truth: nobody has it figured out. We are all feeling the exact same panic behind closed bedroom doors.
                  </div>
                  <p>
                    I didn&apos;t build KantoPrep to make another generic app or pad a resume. I built it because I realized there are thousands of us in Tokyo doing the <em>exact same</em> past papers in isolation. We don&apos;t need expensive private tutors. We just need each other.
                  </p>
                  <p>
                    You don&apos;t have to carry the whole syllabus alone. Let&apos;s grab a table at the library and finish this together.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: THE PERSUASIVE SCIENCE */}
            {activeTab === 'science' && (
              <div className="space-y-5">
                <div className="text-xs sm:text-sm text-zinc-600">
                  You might think studying alone in your room is the most productive way. Psychological research proves the exact opposite:
                </div>

                {/* Point 1 */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:border-emerald-200 transition-all">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm mb-1.5">
                    <Flame className="w-4 h-4 text-emerald-600" />
                    <span>1. The Runner Effect: Why You Don&apos;t Quit</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    Ever tried running 5 kilometers alone vs. with a running buddy? Running alone, your brain begs you to stop at kilometer 2. But when someone is pacing right beside you, you finish all 5K almost effortlessly.
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-700 mt-2 font-medium">
                    Sports psychologists call this the <strong className="text-emerald-700">Köhler Effect</strong>. When you see someone next to you quietly persisting through hard questions, your stamina literally <em>doubles</em>.
                  </p>
                </div>

                {/* Point 2 */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:border-emerald-200 transition-all">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm mb-1.5">
                    <Headphones className="w-4 h-4 text-emerald-600" />
                    <span>2. &quot;Body Doubling&quot;: The Anti-Doomscroll Cheat Code</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    Ever notice how you can&apos;t open your textbook at your bedroom desk without grabbing your phone every 4 minutes? But the minute you sit across from someone who is locked in, your urge to doomscroll disappears.
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-700 mt-2 font-medium">
                    Neuroscience calls this <strong className="text-emerald-700">Body Doubling</strong>. The silent physical presence of another human working anchors your brain, without exchanging a single word.
                  </p>
                </div>

                {/* Point 3 */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:border-emerald-200 transition-all">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm mb-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>3. Peer Instruction Beats 100-Page Textbooks</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    A famous Harvard study by Prof. Eric Mazur proved that students learn <strong className="text-emerald-700">twice as fast</strong> from classmates than from lectures.
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-700 mt-2 font-medium">
                    Your teachers understood this material 20 years ago. A fellow student learned it yesterday—they know exactly why question 4 is confusing, and they can explain the markscheme in 30 seconds.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: SOCIAL ANXIETY & GROUND RULES */}
            {activeTab === 'rules' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs sm:text-sm">
                  <strong>We know you might be nervous as hell.</strong> Meeting people from other schools can feel intimidating. Here is our promise:
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-white border border-zinc-200">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0 text-xs">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 text-sm">Silent Co-Working is 100% the Default</h4>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        You don&apos;t have to be extroverted. Most pods are 25-minute Pomodoro sprints where everyone wears headphones and works quietly. No forced small talk.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-white border border-zinc-200">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0 text-xs">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 text-sm">Zero Judgment & Zero Flexing</h4>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        Whether you&apos;re aiming for a 45 in IB or just trying to survive Math HL with a passing grade, nobody is here to test you. We share markschemes and notes, not flexes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-white border border-zinc-200">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0 text-xs">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-900 text-sm">Safe, Bright Public Libraries Only</h4>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        Sessions only take place at Tokyo Metropolitan Central Library (Arisugawa Park, Hiroo) and Minato Central Library (Shibakoen). Large, open, sunny rooms with free Wi-Fi and zero awkwardness.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="p-4 sm:p-5 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-zinc-500">
              <Smile className="w-4 h-4 text-emerald-600" />
              <span>Free & verified for Tokyo high schoolers</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/15 cursor-pointer transition-all active:scale-95"
            >
              Got It, Let&apos;s Study
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
