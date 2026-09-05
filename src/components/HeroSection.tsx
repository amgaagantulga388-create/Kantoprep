'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, Sparkles, Users, Quote, CalendarClock } from 'lucide-react';
import { Curriculum } from '@/types';

interface HeroSectionProps {
  selectedCurriculum: Curriculum | 'ALL';
  onSelectCurriculum: (c: Curriculum | 'ALL') => void;
  groupCount: number;
  onOpenWhyKantoPrep?: () => void;
}

// Daily rotating motivational quotes from famous scientists, athletes, and thinkers
const FAMOUS_QUOTES = [
  { quote: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
  { quote: "Only the disciplined ones in life are free.", author: "Eliud Kipchoge" },
  { quote: "Nothing in life is to be feared, it is only to be understood.", author: "Marie Curie" },
  { quote: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { quote: "If you want to go fast, go alone. If you want to go far, go together.", author: "Proverb" },
  { quote: "Rest at the end, not in the middle.", author: "Kobe Bryant" },
  { quote: "Study hard what interests you the most in the most original manner.", author: "Richard Feynman" },
  { quote: "I've failed over and over again in my life. And that is why I succeed.", author: "Michael Jordan" },
  { quote: "Difficulties strengthen the mind, as labor does the body.", author: "Seneca" },
];

// Key exam dates for countdown (month is 0-indexed)
const EXAM_DATES = [
  { label: 'IB May Exams', month: 4, day: 1 },
  { label: 'AP Exams', month: 4, day: 5 },
  { label: 'Digital SAT', month: 2, day: 8 },
  { label: 'Digital SAT', month: 4, day: 3 },
  { label: 'Digital SAT', month: 9, day: 4 },
];

function getNextExamCountdown(): { label: string; daysLeft: number } | null {
  const now = new Date();
  let closest: { label: string; daysLeft: number } | null = null;

  for (const exam of EXAM_DATES) {
    for (const yearOffset of [0, 1]) {
      const examDate = new Date(now.getFullYear() + yearOffset, exam.month, exam.day);
      const diff = examDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (daysLeft > 0 && daysLeft <= 120) {
        if (!closest || daysLeft < closest.daysLeft) {
          closest = { label: exam.label, daysLeft };
        }
      }
    }
  }
  return closest;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  selectedCurriculum,
  onSelectCurriculum,
  groupCount,
}) => {
  const curriculums: { id: Curriculum | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'All Syllabi' },
    { id: 'IB', label: 'IB Diploma' },
    { id: 'AP', label: 'Advanced Placement' },
    { id: 'IGCSE', label: 'IGCSE' },
    { id: 'SAT_ACT', label: 'Digital SAT' },
  ];

  // Rotate daily based on day of the year
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [examCountdown, setExamCountdown] = useState<{ label: string; daysLeft: number } | null>(null);

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    setQuoteIndex(dayOfYear % FAMOUS_QUOTES.length);
    setExamCountdown(getNextExamCountdown());
  }, []);

  const activeQuote = FAMOUS_QUOTES[quoteIndex];

  return (
    <section className="relative pt-8 pb-12 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Top Tag */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-white/90 border border-emerald-200/80 text-xs text-emerald-800 shadow-2xs mb-5"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-medium">100% Free • Student-Run Across Tokyo International Schools</span>
        </motion.div>

        {/* Display Headline with Shimmer Gradient */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-3"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 leading-tight sm:leading-[1.15]">
            Welcome to{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 shimmer-text">
              KantoPrep
            </span>
          </h1>

          {/* Live Activity Counter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex items-center justify-center pt-0.5"
          >
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200/80 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-emerald-800">
                {groupCount} active {groupCount === 1 ? 'pod' : 'pods'} right now
              </span>
            </div>
          </motion.div>

          {/* Daily Motivational Quote */}
          <div className="flex items-center justify-center pt-1">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-white/90 border border-zinc-200/80 shadow-sm max-w-xl text-left"
            >
              <Quote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-xs sm:text-sm italic text-zinc-700 font-medium">
                &ldquo;{activeQuote.quote}&rdquo;
              </span>
              <span className="text-[11px] font-bold text-emerald-700 shrink-0 not-italic">
                — {activeQuote.author}
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-4 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Connect with verified Tokyo peers preparing for the same past papers, IA rubrics, and exams.
        </motion.p>

        {/* Trust Badges + Exam Countdown */}
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
          {examCountdown && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 shadow-2xs">
              <CalendarClock className="w-4 h-4 text-amber-600" />
              <span className="font-semibold text-amber-800">
                D-{examCountdown.daysLeft} {examCountdown.label}
              </span>
            </div>
          )}
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
