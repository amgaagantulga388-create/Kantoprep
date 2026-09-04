'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowUpRight, MessageCircle } from 'lucide-react';
import { StudyGroup, StudentProfile } from '@/types';
import { FORMAT_CONFIG } from '@/lib/constants';

interface GroupCardProps {
  group: StudyGroup;
  currentUser: StudentProfile;
  onJoinOrOpen: (group: StudyGroup) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  currentUser,
  onJoinOrOpen,
}) => {
  const isMember = group.members.some((m) => m.id === currentUser.id);
  const isHost = group.host.id === currentUser.id;
  const isFull = group.members.length >= group.maxMembers;
  const formatInfo = FORMAT_CONFIG[group.format] || FORMAT_CONFIG.past_paper_sprint;

  const curriculumStyles: Record<string, string> = {
    IB: 'border-blue-200 text-blue-700 bg-blue-50',
    AP: 'border-amber-200 text-amber-700 bg-amber-50',
    IGCSE: 'border-emerald-200 text-emerald-700 bg-emerald-50',
    SAT_ACT: 'border-teal-200 text-teal-700 bg-teal-50',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="relative flex flex-col justify-between p-5 rounded-2xl glass-card transition-all duration-300 group"
    >
      <div>
        {/* Top Header: Curriculum + Format Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase rounded-full border ${
                curriculumStyles[group.curriculum] || curriculumStyles.IB
              }`}
            >
              {group.curriculum}
            </span>
            <span
              className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full border ${formatInfo.badge}`}
            >
              {formatInfo.label}
            </span>
          </div>

          {/* Safe Venue Tag */}
          <div className="flex items-center space-x-1 text-[11px] text-zinc-600 bg-zinc-50 px-2 py-0.5 rounded-lg border border-emerald-100">
            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate max-w-[130px] font-medium">{group.venueLabel}</span>
          </div>
        </div>

        {/* Subject & Title */}
        <p className="text-xs font-semibold text-emerald-700 mb-1">{group.subject}</p>
        <h3 className="text-base font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
          {group.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs text-zinc-600 line-clamp-2 leading-relaxed">
          {group.description}
        </p>

        {/* Topic Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {group.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100/80 text-zinc-700 border border-zinc-200"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-1.5 overflow-hidden">
            {group.members.slice(0, 3).map((member, idx) => (
              <img
                key={member.id || idx}
                src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                alt={member.fullName}
                title={`${member.fullName} (${member.schoolName})`}
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
              />
            ))}
          </div>
          <div className="text-[11px] text-zinc-600">
            <span className="font-semibold text-zinc-900">
              {group.members.length}/{group.maxMembers}
            </span>{' '}
            <span className="text-zinc-400">
              ({group.maxMembers - group.members.length} open)
            </span>
          </div>
        </div>

        <button
          onClick={() => onJoinOrOpen(group)}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer ${
            isMember
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              : isFull
              ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20'
          }`}
          disabled={isFull && !isMember}
        >
          {isMember ? (
            <>
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{isHost ? 'Host Chat' : 'Open Chat'}</span>
            </>
          ) : isFull ? (
            <span>Pod Full</span>
          ) : (
            <>
              <span>Join Pod</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};
