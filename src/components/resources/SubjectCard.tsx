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
          ? 'border-[#F5B942]/60 bg-[#1A1815] shadow-xs ring-1 ring-[#F5B942]/30'
          : 'border-[#F5B942]/15 bg-[#161513] hover:border-[#F5B942]/40 hover:bg-[#1A1815]'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#F5B942]/10 border border-[#F5B942]/20 flex items-center justify-center text-[#F5B942] group-hover:bg-[#F5B942]/20 group-hover:scale-105 transition-all">
            {isEmoji ? (
              <span className="text-xl leading-none" role="img" aria-label={syllabus.subject}>
                {syllabus.icon}
              </span>
            ) : (
              <BookOpen className="w-5 h-5 text-[#F5B942]" />
            )}
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="inline-flex items-center bg-[#F5B942]/10 text-[#F5B942] border border-[#F5B942]/30 rounded-full px-2 py-0.5 text-[10px] font-bold">
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
                    ? 'text-[#F5B942] bg-[#F5B942]/15 hover:bg-[#F5B942]/25'
                    : 'text-[#7A756D] hover:text-[#F5B942] hover:bg-[#1C1A17]'
                }`}
                title={isBookmarked ? 'Remove from My Subjects' : 'Bookmark to My Subjects'}
              >
                <Star className={`w-4 h-4 ${isBookmarked ? 'fill-[#F5B942] text-[#F5B942]' : ''}`} />
              </button>
            )}
          </div>
        </div>

        <h3 className="text-base font-bold text-white group-hover:text-[#F5B942] transition-colors mt-4 line-clamp-2">
          {syllabus.subject}
        </h3>

        {/* Feature Badges (Formula Booklet / Desmos) */}
        {(syllabus.formulaBooklet || syllabus.hasCalculator) && (
          <div className="flex items-center space-x-2 mt-2">
            {syllabus.formulaBooklet && (
              <span className="inline-flex items-center space-x-1 text-[10px] font-medium text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-md px-1.5 py-0.5">
                <FileSpreadsheet className="w-3 h-3 text-[#F5B942]" />
                <span>Booklet</span>
              </span>
            )}
            {syllabus.hasCalculator && (
              <span className="inline-flex items-center space-x-1 text-[10px] font-medium text-[#F5B942] bg-[#F5B942]/10 border border-[#F5B942]/20 rounded-md px-1.5 py-0.5">
                <Calculator className="w-3 h-3 text-[#F5B942]" />
                <span>TI-84</span>
              </span>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-[#A8A39D] mt-4">
        {totalVideos} videos • {totalPapers} papers • {totalLinks} links
      </p>
    </motion.div>
  );
};
