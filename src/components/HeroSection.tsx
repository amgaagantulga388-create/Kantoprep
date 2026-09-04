'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, Sparkles, Users, Quote } from 'lucide-react';
import { Curriculum } from '@/types';

interface HeroSectionProps {
  selectedCurriculum: Curriculum | 'ALL';
  onSelectCurriculum: (c: Curriculum | 'ALL') => void;
  groupCount: number;
  onOpenWhyKantoPrep?: () => void;
}

// Daily rotating motivational quotes from famous scientists, athletes, and thinkers
const FAMOUS_QUOTES = [
  { quote: "It’s not that I’m so smart, it’s just that I stay with problems longer.", author: "Albert Einstein" },
  { quote: "Only the disciplined ones in life are free.", author: "Eliud Kipchoge" },
  { quote: "Nothing in life is to be feared, it is only to be understood.", author: "Marie Curie" },
  { quote: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
  { quote: "If you want to go fast, go alone. If you want to go far, go together.", author: "Proverb" },
  { quote: "Rest at the end, not in the middle.", author: "Kobe Bryant" },
  { quote: "Study hard what interests you the most in the most original manner.", author: "Richard Feynman" },
  { quote: "I’ve failed over and over again in my life. And that is why I succeed.", author: "Michael Jordan" },
  { quote: "Difficulties strengthen the mind, as labor does the body.", author: "Seneca" },
];

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

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    setQuoteIndex(dayOfYear % FAMOUS_QUOTES.length);
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

        {/* Display Headline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-3"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 leading-tight sm:leading-[1.15]">
            Welcome to{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500">
              KantoPrep
            </span>
          </h1>

          {/* Daily Motivational Quote */}
          <div className="flex items-center justify-center pt-1">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-2xl bg-white/90 border border-zinc-200/80 shadow-xs max-w-xl text-left">
              <Quote className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-xs sm:text-sm italic text-zinc-700 font-medium">
                &ldquo;{activeQuote.quote}&rdquo;
              </span>
              <span className="text-[11px] font-bold text-emerald-700 shrink-0 not-italic">
                — {activeQuote.author}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Subtitle (Simple, concise, no over-explaining) */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Connect with verified Tokyo peers preparing for the same past papers, IA rubrics, and exams.
        </motion.p>

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
