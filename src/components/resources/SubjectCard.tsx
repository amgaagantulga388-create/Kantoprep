'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Star, FileSpreadsheet, Calculator } from 'lucide-react';
import { SubjectSyllabus } from '@/types';

export interface SubjectCardProps {
  syllabus: SubjectSyllabus;
  onClick: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (e: React.MouseEvent) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  syllabus,
  onClick,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const totalVideos =
    syllabus.topics?.reduce(
      (sum, topic) => sum + (topic.youtubeResources?.length || 0),
      0
    ) || 0;

  const totalPapers =
    syllabus.topics?.reduce(
      (sum, topic) => sum + (topic.pastPapers?.length || 0),
      0
    ) || 0;

  const totalLinks =
    syllabus.topics?.reduce(
      (sum, topic) => sum + (topic.externalResources?.length || 0),
      0
    ) || 0;

  const isEmoji =
    syllabus.icon && /\p{Extended_Pictographic}/u.test(syllabus.icon);

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`glass-card border rounded-2xl p-5 cursor-pointer flex flex-col justify-between group transition-all relative ${
        isBookmarked
          ? 'border-amber-300/80 bg-gradient-to-b from-amber-50/20 to-white shadow-xs ring-1 ring-amber-400/20'
          : 'border-zinc-200/80 hover:border-emerald-300'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 group-hover:scale-105 transition-all">
            {isEmoji ? (
              <span className="text-xl leading-none" role="img" aria-label={syllabus.subject}>
                {syllabus.icon}
              </span>
            ) : (
              <BookOpen className="w-5 h-5 text-emerald-600" />
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5 text-[10px] font-semibold">
              {syllabus.curriculum}
            </span>

            {onToggleBookmark && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(e);
                }}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  isBookmarked
                    ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                    : 'text-zinc-400 hover:text-amber-500 hover:bg-zinc-100'
                }`}
                title={isBookmarked ? 'Remove from My Subjects' : 'Bookmark to My Subjects'}
              >
                <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-500' : ''}`} />
              </button>
            )}
          </div>
        </div>

        <h3 className="text-base font-bold text-zinc-900 group-hover:text-emerald-800 transition-colors mt-4 line-clamp-2">
          {syllabus.subject}
        </h3>

        {/* Feature Badges (Formula Booklet / Desmos) */}
        {(syllabus.formulaBooklet || syllabus.hasCalculator) && (
          <div className="flex items-center space-x-2 mt-2">
            {syllabus.formulaBooklet && (
              <span className="inline-flex items-center space-x-1 text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-200/80 rounded-md px-1.5 py-0.5">
                <FileSpreadsheet className="w-3 h-3" />
                <span>Booklet</span>
              </span>
            )}
            {syllabus.hasCalculator && (
              <span className="inline-flex items-center space-x-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-md px-1.5 py-0.5">
                <Calculator className="w-3 h-3" />
                <span>Desmos</span>
              </span>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-500 mt-4">
        {totalVideos} videos • {totalPapers} papers • {totalLinks} links
      </p>
    </motion.div>
  );
};
