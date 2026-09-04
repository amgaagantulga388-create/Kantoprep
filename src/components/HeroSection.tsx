'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, MapPin, Sparkles, Users } from 'lucide-react';
import { Curriculum } from '@/types';

interface HeroSectionProps {
  selectedCurriculum: Curriculum | 'ALL';
  onSelectCurriculum: (c: Curriculum | 'ALL') => void;
  groupCount: number;
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

  return (
    <section className="relative pt-10 pb-12 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Top Tag */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/90 border border-emerald-200/80 text-xs text-emerald-800 mb-6 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-medium">100% Free • Student-Run Across Tokyo International Schools</span>
        </motion.div>

        {/* Display Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 leading-tight sm:leading-[1.15]"
        >
          Never cram alone.{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500">
            Find your study orbit.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Connect with peers across Tokyo preparing for the same past papers, IA rubrics, and exams.
          Verified school emails only. Safe public study hubs.
        </motion.p>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-zinc-700"
        >
          <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-emerald-100 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">School Email Whitelisted</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-emerald-100 shadow-xs">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="font-medium">Public Library Hubs (Hiroo, Mita)</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-emerald-100 shadow-xs">
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
