'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { SubjectSyllabus } from '@/types';

export interface SubjectCardProps {
  syllabus: SubjectSyllabus;
  onClick: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ syllabus, onClick }) => {
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
      className="glass-card border border-zinc-200/80 rounded-2xl p-5 cursor-pointer flex flex-col justify-between group hover:border-emerald-300 transition-colors"
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
          <span className="inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5 text-[10px] font-semibold">
            {syllabus.curriculum}
          </span>
        </div>

        <h3 className="text-base font-bold text-zinc-900 group-hover:text-emerald-800 transition-colors mt-4">
          {syllabus.subject}
        </h3>
      </div>

      <p className="text-xs text-zinc-500 mt-4">
        {totalVideos} videos • {totalPapers} papers • {totalLinks} links
      </p>
    </motion.div>
  );
};
