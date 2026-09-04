'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, FileSpreadsheet, PenTool, Clock, Brain, Layers, UserCheck } from 'lucide-react';
import { SessionFormat } from '@/types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedFormat: SessionFormat | 'ALL';
  onFormatChange: (f: SessionFormat | 'ALL') => void;
  totalResults: number;
  isMyPodsOnly: boolean;
  onToggleMyPods: (val: boolean) => void;
  myPodsCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedFormat,
  onFormatChange,
  totalResults,
  isMyPodsOnly,
  onToggleMyPods,
  myPodsCount,
}) => {
  const formats: { id: SessionFormat | 'ALL'; label: string; icon: React.ElementType }[] = [
    { id: 'ALL', label: 'All Formats', icon: Layers },
    { id: 'past_paper_sprint', label: 'Past Paper Sprints', icon: FileSpreadsheet },
    { id: 'ia_workshop', label: 'IA / Rubric Labs', icon: PenTool },
    { id: 'silent_pomodoro', label: 'Silent Pomodoro', icon: Clock },
    { id: 'exam_cram', label: 'Concept Cram & Q&A', icon: Brain },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Format Segmented Tabs */}
        <div className="flex items-center space-x-1 p-1 rounded-2xl glass-panel w-full md:w-auto overflow-x-auto no-scrollbar">
          {formats.map((f) => {
            const isActive = selectedFormat === f.id;
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                onClick={() => onFormatChange(f.id)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 flex items-center space-x-1.5 cursor-pointer ${
                  isActive
                    ? 'text-zinc-900 font-semibold'
                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-emerald-50/40'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeFormatPill"
                    className="absolute inset-0 bg-white border border-emerald-200/80 rounded-xl shadow-xs"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center space-x-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-zinc-400'}`} />
                  <span>{f.label}</span>
                </span>
              </button>
            );
          })}

          {myPodsCount > 0 && (
            <button
              type="button"
              onClick={() => onToggleMyPods(!isMyPodsOnly)}
              className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center space-x-1.5 cursor-pointer ml-1 ${
                isMyPodsOnly
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-800 bg-emerald-50/80 border border-emerald-200 hover:bg-emerald-100/80'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>My Pods</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                isMyPodsOnly ? 'bg-emerald-700 text-white' : 'bg-emerald-200/80 text-emerald-900'
              }`}>
                {myPodsCount}
              </span>
            </button>
          )}
        </div>

        {/* Search & Counter */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search subject, past paper, or topic..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-emerald-100 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-xs"
            />
          </div>
          <span className="text-xs text-zinc-500 whitespace-nowrap hidden sm:inline">
            {totalResults} {totalResults === 1 ? 'pod' : 'pods'} found
          </span>
        </div>
      </div>
    </div>
  );
};
