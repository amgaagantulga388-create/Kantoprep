'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, MapPin, Sparkles, Users, ArrowRight, HelpCircle } from 'lucide-react';
import { Curriculum } from '@/types';

interface HeroSectionProps {
  selectedCurriculum: Curriculum | 'ALL';
  onSelectCurriculum: (c: Curriculum | 'ALL') => void;
  groupCount: number;
  onOpenWhyKantoPrep?: () => void;
}

// Weekly & exam-season relatable phrases tailored to high schoolers
const ROTATING_EXAM_PHRASES = [
  { text: "Nervous about the SAT? Don't worry, seriously.", context: "Digital SAT Season" },
  { text: "Staring down IB deadlines? Take a breath. You're not alone.", context: "IB Diploma" },
  { text: "AP crunch time? Let's tackle the past questions together.", context: "Advanced Placement" },
  { text: "Same past papers. Same panic. Much better together.", context: "Peer Pacing" },
  { text: "Quiet company for loud exams. No awkward small talk.", context: "Focus Sprints" },
  { text: "Good luck on your mocks and past papers this week!", context: "Weekly Motivation" },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  selectedCurriculum,
  onSelectCurriculum,
  groupCount,
  onOpenWhyKantoPrep,
}) => {
  const curriculums: { id: Curriculum | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'All Syllabi' },
    { id: 'IB', label: 'IB Diploma' },
    { id: 'AP', label: 'Advanced Placement' },
    { id: 'IGCSE', label: 'IGCSE' },
    { id: 'SAT_ACT', label: 'Digital SAT' },
  ];

  // Rotate based on weekly index or auto-timer
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    // Set initial index based on current week of the year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const weekNumber = Math.floor(diff / oneWeek);
    setCurrentPhraseIndex(weekNumber % ROTATING_EXAM_PHRASES.length);

    // Subtle auto-cycle every 7 seconds
    const interval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % ROTATING_EXAM_PHRASES.length);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const currentPhrase = ROTATING_EXAM_PHRASES[currentPhraseIndex];

  return (
    <section className="relative pt-8 pb-12 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Top Tag & Why KantoPrep Quick Trigger */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-white/90 border border-emerald-200/80 text-xs text-emerald-800 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium">100% Free • Student-Run Across Tokyo International Schools</span>
          </motion.div>

          {onOpenWhyKantoPrep && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onClick={onOpenWhyKantoPrep}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-xs font-semibold text-emerald-800 transition-all cursor-pointer active:scale-95 shadow-2xs group"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>Why KantoPrep? (Our Mission &amp; Research)</span>
            </motion.button>
          )}
        </div>

        {/* Display Headline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-2"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 leading-tight sm:leading-[1.15]">
            Welcome to{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500">
              KantoPrep
            </span>
          </h1>

          {/* Dynamic Rotating Exam & Empathy Phrase */}
          <div className="h-16 sm:h-14 flex items-center justify-center pt-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhrase.text}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-2xl bg-white/90 border border-zinc-200/80 shadow-xs max-w-xl"
              >
                <span className="text-xs sm:text-sm font-semibold text-zinc-800">
                  &ldquo;{currentPhrase.text}&rdquo;
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                  {currentPhrase.context}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-2 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Connect with verified Tokyo peers preparing for the same past papers, IA rubrics, and exams.
          Quiet library tables, zero judgment, and no awkward small talk.
        </motion.p>

        {/* Why KantoPrep Featured Pill Button */}
        {onOpenWhyKantoPrep && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-4"
          >
            <button
              onClick={onOpenWhyKantoPrep}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-white hover:bg-emerald-50/50 border border-emerald-200 text-xs sm:text-sm font-semibold text-emerald-800 shadow-xs hover:shadow-md transition-all cursor-pointer group active:scale-95"
            >
              <span>🌿 Read Amgaa&apos;s Letter &amp; The Peer Science</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 text-xs text-zinc-700"
        >
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">School Email Whitelisted</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">Public Library Hubs (Hiroo, Mita)</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">{groupCount} Active Study Pods</span>
          </div>
        </motion.div>

        {/* Curriculum Selector Pills */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl glass-panel max-w-xl mx-auto"
        >
          {curriculums.map((c) => {
            const isActive = selectedCurriculum === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectCurriculum(c.id)}
                className={`relative px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-emerald-50/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCurriculumPill"
                    className="absolute inset-0 bg-emerald-600 rounded-xl"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{c.label}</span>
              </button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
