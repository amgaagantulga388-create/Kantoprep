'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radar,
  Calendar,
  Flame,
  Zap,
  BookOpen,
  Plus,
  Filter,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  ArrowRight,
  RotateCcw,
  Clock,
  Target,
} from 'lucide-react';
import { Curriculum, StudyGroup } from '@/types';
import { useTheme } from '@/context/ThemeProvider';

interface ExamMilestone {
  id: string;
  curriculum: Curriculum;
  badgeLabel: string;
  title: string;
  sessionName: string;
  targetDate: Date;
  targetDateFormatted: string;
  schools: string[];
  defaultSubject: string;
  defaultTitle: string;
  highYieldTips: string[];
  primaryColor: {
    border: string;
    text: string;
    bg: string;
    lightText: string;
    lightBg: string;
    lightBorder: string;
  };
}

interface ExamRadarProps {
  selectedCurriculum: Curriculum | 'ALL';
  onSelectCurriculum: (c: Curriculum | 'ALL') => void;
  groups: StudyGroup[];
  onOpenCreatePod?: (curriculum: Curriculum, subject?: string, title?: string) => void;
}

// Compute the next valid target date ensuring it never displays negative D-Days
function getNextTargetDate(month: number, day: number, hour = 9): Date {
  const now = new Date();
  const currentYear = now.getFullYear();
  let candidate = new Date(currentYear, month - 1, day, hour, 0, 0);
  if (candidate.getTime() <= now.getTime()) {
    candidate = new Date(currentYear + 1, month - 1, day, hour, 0, 0);
  }
  return candidate;
}

// SAT International scheduled dates
const SAT_SCHEDULE = [
  { month: 3, day: 8 },
  { month: 5, day: 3 },
  { month: 6, day: 7 },
  { month: 8, day: 23 },
  { month: 10, day: 3 },
  { month: 11, day: 7 },
  { month: 12, day: 5 },
];

function getNextSatDate(): Date {
  const now = new Date();
  const currentYear = now.getFullYear();

  for (const date of SAT_SCHEDULE) {
    const candidate = new Date(currentYear, date.month - 1, date.day, 8, 30, 0);
    if (candidate.getTime() > now.getTime()) {
      return candidate;
    }
  }
  // If all in this year have passed, return first one next year
  return new Date(currentYear + 1, SAT_SCHEDULE[0].month - 1, SAT_SCHEDULE[0].day, 8, 30, 0);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getPhaseInfo(daysLeft: number, isLight: boolean) {
  if (daysLeft <= 14) {
    return {
      phase: 'Final Drill & Cram',
      badge: isLight
        ? 'bg-rose-50 text-rose-800 border-rose-200'
        : 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      icon: Flame,
      description: 'Paper timers, formula checks & high-frequency errors',
    };
  }
  if (daysLeft <= 45) {
    return {
      phase: 'Past Paper Sprint',
      badge: isLight
        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
        : 'bg-[#F5B942]/15 text-[#F5B942] border-[#F5B942]/35',
      icon: Zap,
      description: 'Full timed papers & step-by-step markscheme grading',
    };
  }
  if (daysLeft <= 90) {
    return {
      phase: 'IA & Topic Labs',
      badge: isLight
        ? 'bg-amber-50 text-amber-800 border-amber-200'
        : 'bg-amber-400/10 text-amber-300 border-amber-400/25',
      icon: BookOpen,
      description: 'Internal assessment refinement & syllabus weak points',
    };
  }
  return {
    phase: 'Syllabus Mastery',
    badge: isLight
      ? 'bg-sky-50 text-sky-800 border-sky-200'
      : 'bg-blue-500/10 text-blue-300 border-blue-500/25',
    icon: Layers,
    description: 'Foundation building, concept notes & questionbanks',
  };
}

export const ExamRadar: React.FC<ExamRadarProps> = ({
  selectedCurriculum,
  onSelectCurriculum,
  groups,
  onOpenCreatePod,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [now, setNow] = useState<Date>(new Date());
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Update tick every 60 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const milestones: ExamMilestone[] = useMemo(() => {
    const ibDate = getNextTargetDate(5, 1);
    const apDate = getNextTargetDate(5, 5);
    const satDate = getNextSatDate();
    const igcseDate = getNextTargetDate(5, 6);

    return [
      {
        id: 'ib-may',
        curriculum: 'IB',
        badgeLabel: 'IB DP',
        title: 'IB Diploma May Session',
        sessionName: 'Paper 1, 2 & 3 Written Exams',
        targetDate: ibDate,
        targetDateFormatted: formatDate(ibDate),
        schools: ['BST', 'YIS', 'St. Maur', 'Seisen', 'KIST', 'TIS'],
        defaultSubject: 'Mathematics: Analysis & Approaches',
        defaultTitle: 'Paper 2 Timed Sprint & Markscheme Grading',
        highYieldTips: [
          'Master TZ1 & TZ2 past papers from 2019 to 2024',
          'Practice Section B long problems under strict time limits',
          'Verify your calculator settings & formula booklet annotations',
        ],
        primaryColor: {
          border: 'border-blue-500/30',
          text: 'text-blue-400',
          bg: 'bg-blue-500/10',
          lightText: 'text-blue-700',
          lightBg: 'bg-blue-50',
          lightBorder: 'border-blue-200',
        },
      },
      {
        id: 'ap-may',
        curriculum: 'AP',
        badgeLabel: 'AP Exams',
        title: 'College Board AP Window',
        sessionName: 'National Administration Weeks 1 & 2',
        targetDate: apDate,
        targetDateFormatted: formatDate(apDate),
        schools: ['ASIJ', 'CAJ', 'Saint Mary’s'],
        defaultSubject: 'AP Calculus BC',
        defaultTitle: '2023–2024 Released FRQ Timed Drills',
        highYieldTips: [
          'Target official released FRQs with scoring commentary',
          'Speed-drill 60-second MCQs to bank buffer time',
          'Memorize College Board specific justification phrasing',
        ],
        primaryColor: {
          border: 'border-amber-400/30',
          text: 'text-amber-300',
          bg: 'bg-amber-400/10',
          lightText: 'text-amber-800',
          lightBg: 'bg-amber-50',
          lightBorder: 'border-amber-200',
        },
      },
      {
        id: 'sat-digital',
        curriculum: 'SAT_ACT',
        badgeLabel: 'Digital SAT',
        title: 'Digital SAT Window',
        sessionName: 'Bluebook Adaptive International Test',
        targetDate: satDate,
        targetDateFormatted: formatDate(satDate),
        schools: ['All Tokyo Schools', 'Grades 11–12'],
        defaultSubject: 'Digital SAT Math (Advanced & Desmos)',
        defaultTitle: 'Module 2 Hard Adaptive Bank & Desmos Hacks',
        highYieldTips: [
          'Train Desmos linear regression & slider hacks to save 12+ mins',
          'Practice 750+ level Module 2 hard math questions',
          'Drill words-in-context and transition grammar rules daily',
        ],
        primaryColor: {
          border: 'border-teal-400/30',
          text: 'text-teal-300',
          bg: 'bg-teal-400/10',
          lightText: 'text-teal-800',
          lightBg: 'bg-teal-50',
          lightBorder: 'border-teal-200',
        },
      },
      {
        id: 'igcse-may',
        curriculum: 'IGCSE',
        badgeLabel: 'Cambridge / Edexcel',
        title: 'IGCSE May/June Series',
        sessionName: 'Core & Extended Written Papers',
        targetDate: igcseDate,
        targetDateFormatted: formatDate(igcseDate),
        schools: ['BST', 'YIS Foundation', 'KIST'],
        defaultSubject: 'IGCSE Extended Mathematics',
        defaultTitle: 'Paper 4 Extended Math Problem Set Drill',
        highYieldTips: [
          'No formula sheet on Maths 0580 — memorize all surface & volume rules',
          'Differentiate command words: "Describe" vs "Explain" in Sciences',
          'Review examiner reports for the top 5 recurring traps',
        ],
        primaryColor: {
          border: 'border-emerald-400/30',
          text: 'text-emerald-300',
          bg: 'bg-emerald-400/10',
          lightText: 'text-emerald-800',
          lightBg: 'bg-emerald-50',
          lightBorder: 'border-emerald-200',
        },
      },
    ];
  }, []);

  const handleCardClick = (curriculum: Curriculum) => {
    if (selectedCurriculum === curriculum) {
      // Toggle back to all if already active
      onSelectCurriculum('ALL');
    } else {
      onSelectCurriculum(curriculum);
    }
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCardId((prev) => (prev === id ? null : id));
  };

  // Check if a single curriculum is currently filtered
  const singleCurriculumMilestone = useMemo(() => {
    if (selectedCurriculum === 'ALL') return null;
    return milestones.find((m) => m.curriculum === selectedCurriculum) || null;
  }, [milestones, selectedCurriculum]);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 relative z-10">
      {/* Radar Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F5B942]/15">
        <div className="flex items-center space-x-3">
          {/* Pulsing Radar Sonar Icon */}
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[#161513] border border-[#F5B942]/30 shadow-sm">
            <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-[#F5B942]/20 opacity-75" />
            <Radar className="w-5 h-5 text-[#F5B942] relative z-10" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <span>
                  {singleCurriculumMilestone
                    ? `${singleCurriculumMilestone.title} Countdown`
                    : 'Exam D-Day Radar'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#F5B942]/15 border border-[#F5B942]/30 text-[10px] font-bold text-[#F5B942] uppercase tracking-wider">
                  {singleCurriculumMilestone ? 'Focused' : 'Live'}
                </span>
              </h2>
            </div>
            <p className="text-xs text-[#A8A39D] mt-0.5">
              {singleCurriculumMilestone
                ? `Showing target countdown and active study pods specifically for ${singleCurriculumMilestone.badgeLabel}.`
                : 'Target countdowns, revision phase telemetry, and active study pods across Tokyo international schools.'}
            </p>
          </div>
        </div>

        {/* Console Controls */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {selectedCurriculum !== 'ALL' && (
            <button
              onClick={() => onSelectCurriculum('ALL')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#F5B942]/10 border border-[#F5B942]/30 text-xs text-[#F5B942] font-semibold hover:bg-[#F5B942]/20 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Show All 4 Tracks</span>
            </button>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#161513] border border-[#F5B942]/20 text-xs text-[#A8A39D] hover:text-white transition-all cursor-pointer"
            title={isCollapsed ? 'Expand radar' : 'Collapse radar'}
          >
            <span className="text-[11px] font-medium">{isCollapsed ? 'Show' : 'Hide'}</span>
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Radar Cards / Focused View */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="pt-4"
          >
            {/* 1. SINGLE-CURRICULUM FOCUSED HERO RADAR (When user filters by IB, AP, SAT, or IGCSE) */}
            {singleCurriculumMilestone ? (
              (() => {
                const m = singleCurriculumMilestone;
                const diffMs = Math.max(0, m.targetDate.getTime() - now.getTime());
                const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const hoursLeft = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutesLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                const phase = getPhaseInfo(daysLeft, isLight);
                const PhaseIcon = phase.icon;

                const activePods = groups.filter(
                  (g) => g.curriculum === m.curriculum && g.status !== 'cancelled'
                );
                const podCount = activePods.length;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl p-5 sm:p-7 bg-[#161513] border-2 border-[#F5B942] shadow-xl shadow-[#F5B942]/10 ring-2 ring-[#F5B942]/20 text-left relative overflow-hidden"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      {/* Left: Big D-Day Ticker & Target Session */}
                      <div className="lg:col-span-6 space-y-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider border ${
                              isLight
                                ? `${m.primaryColor.lightBg} ${m.primaryColor.lightText} ${m.primaryColor.lightBorder}`
                                : `${m.primaryColor.bg} ${m.primaryColor.text} ${m.primaryColor.border}`
                            }`}
                          >
                            {m.badgeLabel}
                          </span>
                          <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#F5B942] text-[#0E0D0B] text-[11px] font-extrabold shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active Curriculum Filter</span>
                          </span>
                        </div>

                        <div>
                          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                            {m.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#A8A39D] font-medium mt-1">
                            {m.sessionName} • Tokyo Regional Window
                          </p>
                        </div>

                        {/* Prominent Hero Countdown Box */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-[#1C1A17] border border-[#F5B942]/20 flex items-center justify-between shadow-inner">
                          <div>
                            <div className="flex items-baseline space-x-2">
                              <span className="text-4xl sm:text-5xl font-black text-[#F5B942] tracking-tight font-mono">
                                D-{daysLeft}
                              </span>
                              <span className="text-sm sm:text-base font-bold text-[#EDEDEB]">
                                days left
                              </span>
                            </div>
                            <span className="text-xs text-[#7A756D] font-mono block mt-1">
                              {hoursLeft} hours {minutesLeft} minutes until exam commencement
                            </span>
                          </div>

                          <div className="text-right border-l border-[#F5B942]/15 pl-4 sm:pl-6">
                            <div className="flex items-center space-x-1.5 text-xs sm:text-sm text-[#EDEDEB] justify-end font-semibold">
                              <Calendar className="w-4 h-4 text-[#F5B942]" />
                              <span>{m.targetDateFormatted}</span>
                            </div>
                            <span className="text-[11px] text-[#7A756D] mt-1 block font-medium">
                              09:00 AM JST
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-[#7A756D]">
                          Schools preparing:{' '}
                          <span className="text-[#EDEDEB] font-medium">
                            {m.schools.join(' • ')}
                          </span>
                        </div>
                      </div>

                      {/* Right: Revision Telemetry & High-Yield Action */}
                      <div className="lg:col-span-6 space-y-4 lg:border-l lg:border-[#F5B942]/15 lg:pl-6">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          {/* Revision Phase Badge */}
                          <div
                            className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${phase.badge}`}
                          >
                            <PhaseIcon className="w-4 h-4" />
                            <span>{phase.phase}</span>
                            <span className="text-[11px] opacity-80 font-normal hidden sm:inline">
                              — {phase.description}
                            </span>
                          </div>

                          {/* Pod Telemetry Indicator */}
                          <div className="flex items-center space-x-2 text-xs font-bold text-[#A8A39D] px-3 py-1.5 rounded-xl bg-[#1C1A17] border border-[#F5B942]/20">
                            <span className="relative flex h-2.5 w-2.5">
                              {podCount > 0 && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5B942] opacity-75" />
                              )}
                              <span
                                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                                  podCount > 0 ? 'bg-[#F5B942]' : 'bg-[#7A756D]'
                                }`}
                              />
                            </span>
                            <span>
                              {podCount} {podCount === 1 ? 'Pod' : 'Pods'} Active Below
                            </span>
                          </div>
                        </div>

                        {/* High-Yield Revision Checklist */}
                        <div className="p-4 rounded-2xl bg-[#1C1A17] border border-[#F5B942]/15 space-y-2">
                          <div className="text-xs font-bold text-[#F5B942] uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> High-Yield Revision Focus
                          </div>
                          <ul className="space-y-1.5 text-xs text-[#EDEDEB]">
                            {m.highYieldTips.map((tip, idx) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <span className="text-[#F5B942] font-bold shrink-0">•</span>
                                <span className="leading-relaxed">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                          <button
                            type="button"
                            onClick={() => onSelectCurriculum('ALL')}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#1C1A17] hover:bg-[#221F1B] border border-[#F5B942]/25 text-xs text-[#EDEDEB] hover:text-white transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-[#F5B942]" />
                            <span>View All 4 Curriculums</span>
                          </button>

                          {onOpenCreatePod && (
                            <button
                              type="button"
                              onClick={() =>
                                onOpenCreatePod(m.curriculum, m.defaultSubject, m.defaultTitle)
                              }
                              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#F5B942] hover:bg-[#E5A832] text-[#0E0D0B] text-xs font-bold shadow-md shadow-[#F5B942]/20 active:scale-95 transition-all cursor-pointer"
                            >
                              <Plus className="w-4 h-4 stroke-[2.5]" />
                              <span>Host {m.badgeLabel} Study Pod</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })()
            ) : (
              /* 2. OVERVIEW 4-CARD RADAR GRID (When viewing 'ALL') */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {milestones.map((m) => {
                  const isSelected = selectedCurriculum === m.curriculum;
                  const isExpanded = expandedCardId === m.id;

                  // Time diff calculation
                  const diffMs = Math.max(0, m.targetDate.getTime() - now.getTime());
                  const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                  const hoursLeft = Math.floor(
                    (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                  );
                  const minutesLeft = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

                  const phase = getPhaseInfo(daysLeft, isLight);
                  const PhaseIcon = phase.icon;

                  // Active pods count for this curriculum
                  const activePods = groups.filter(
                    (g) => g.curriculum === m.curriculum && g.status !== 'cancelled'
                  );
                  const podCount = activePods.length;

                  return (
                    <motion.div
                      key={m.id}
                      layout
                      onClick={() => handleCardClick(m.curriculum)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleCardClick(m.curriculum);
                        }
                      }}
                      className={`relative rounded-2xl p-4 transition-all duration-300 cursor-pointer overflow-hidden text-left flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#1C1A17] border-2 border-[#F5B942] shadow-lg shadow-[#F5B942]/15 ring-2 ring-[#F5B942]/20'
                          : 'bg-[#161513] border border-[#F5B942]/20 hover:border-[#F5B942]/45 hover:shadow-md hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Top Row: Curriculum Badge + Live Active Indicator */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                                isLight
                                  ? `${m.primaryColor.lightBg} ${m.primaryColor.lightText} ${m.primaryColor.lightBorder}`
                                  : `${m.primaryColor.bg} ${m.primaryColor.text} ${m.primaryColor.border}`
                              }`}
                            >
                              {m.badgeLabel}
                            </span>
                            {isSelected && (
                              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#F5B942] text-[#0E0D0B] text-[10px] font-extrabold shadow-2xs">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Active</span>
                              </span>
                            )}
                          </div>

                          {/* Pod Telemetry Indicator */}
                          <div
                            className="flex items-center space-x-1.5 text-[11px] font-semibold text-[#A8A39D]"
                            title={`${podCount} active pods right now`}
                          >
                            <span className="relative flex h-2 w-2">
                              {podCount > 0 && (
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5B942] opacity-75" />
                              )}
                              <span
                                className={`relative inline-flex rounded-full h-2 w-2 ${
                                  podCount > 0 ? 'bg-[#F5B942]' : 'bg-[#7A756D]'
                                }`}
                              />
                            </span>
                            <span>
                              {podCount} {podCount === 1 ? 'Pod' : 'Pods'}
                            </span>
                          </div>
                        </div>

                        {/* Main Title & Session Name */}
                        <h3 className="text-sm font-bold text-white leading-tight">
                          {m.title}
                        </h3>
                        <p className="text-[11px] text-[#A8A39D] mt-0.5 font-medium line-clamp-1">
                          {m.sessionName}
                        </p>

                        {/* D-Day Ticker Box */}
                        <div className="my-3.5 p-3 rounded-xl bg-[#1C1A17] border border-[#F5B942]/15 flex items-baseline justify-between shadow-inner">
                          <div>
                            <div className="flex items-baseline space-x-1.5">
                              <span className="text-2xl sm:text-3xl font-black text-[#F5B942] tracking-tight font-mono">
                                D-{daysLeft}
                              </span>
                              <span className="text-xs font-semibold text-[#EDEDEB]">
                                days
                              </span>
                            </div>
                            <span className="text-[10px] text-[#7A756D] font-mono block mt-0.5">
                              {hoursLeft}h {minutesLeft}m remaining
                            </span>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center space-x-1 text-[11px] text-[#EDEDEB] justify-end font-medium">
                              <Calendar className="w-3 h-3 text-[#F5B942]" />
                              <span>{m.targetDateFormatted}</span>
                            </div>
                            <span className="text-[10px] text-[#7A756D] mt-0.5 block">
                              Tokyo JST
                            </span>
                          </div>
                        </div>

                        {/* Revision Phase Badge */}
                        <div className="flex items-center space-x-1.5 mb-2.5">
                          <div
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${phase.badge}`}
                          >
                            <PhaseIcon className="w-3 h-3" />
                            <span>{phase.phase}</span>
                          </div>
                        </div>

                        {/* High Yield Preview / Expandable */}
                        <div className="mt-2 text-xs">
                          <button
                            type="button"
                            onClick={(e) => toggleExpand(m.id, e)}
                            className="flex items-center justify-between w-full text-[11px] font-semibold text-[#A8A39D] hover:text-[#F5B942] transition-colors py-1 cursor-pointer"
                          >
                            <span>Syllabus Strategy &amp; Tips</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="pt-2 pb-1 space-y-1.5 border-t border-[#F5B942]/15 text-[11px] text-[#EDEDEB]"
                              >
                                <div className="text-[10px] font-semibold text-[#F5B942] uppercase tracking-wider flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" /> High-Yield Revision Focus
                                </div>
                                <ul className="space-y-1 text-[#A8A39D] pl-1">
                                  {m.highYieldTips.map((tip, idx) => (
                                    <li key={idx} className="flex items-start space-x-1.5">
                                      <span className="text-[#F5B942] font-bold shrink-0">•</span>
                                      <span className="leading-snug text-[#EDEDEB]">{tip}</span>
                                    </li>
                                  ))}
                                </ul>
                                <div className="pt-1 text-[10px] text-[#7A756D]">
                                  Schools: {m.schools.join(' • ')}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Bottom Action Strip */}
                      <div className="mt-3.5 pt-2.5 border-t border-[#F5B942]/15 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-[#F5B942] flex items-center gap-1">
                          {isSelected ? 'Active filter' : 'Filter pods'}
                          <ArrowRight className="w-3 h-3" />
                        </span>

                        {onOpenCreatePod && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenCreatePod(m.curriculum, m.defaultSubject, m.defaultTitle);
                            }}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#F5B942]/15 hover:bg-[#F5B942] text-[#F5B942] hover:text-[#0E0D0B] border border-[#F5B942]/30 text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
                            title={`Host a new study pod for ${m.badgeLabel}`}
                          >
                            <Plus className="w-3 h-3 stroke-[2.5]" />
                            <span>Host Pod</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
