'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowUpRight, MessageCircle, ExternalLink, Share2, Check, Crown } from 'lucide-react';
import { StudyGroup, StudentProfile } from '@/types';
import { FORMAT_CONFIG, getGoogleMapsUrl } from '@/lib/constants';

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
  const [copied, setCopied] = useState(false);
  const isMember = group.members.some((m) => m.id === currentUser.id);
  const isHost = group.host.id === currentUser.id;
  const isFull = group.members.length >= group.maxMembers;
  const formatInfo = FORMAT_CONFIG[group.format] || FORMAT_CONFIG.past_paper_sprint;
  const capacityPercent = Math.round((group.members.length / group.maxMembers) * 100);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/?pod=${group.id}`
      : `https://kantoprep.vercel.app/?pod=${group.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `KantoPrep: ${group.title}`,
          text: `Join our Tokyo peer study pod for ${group.subject} at ${group.venueLabel}!`,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard if cancelled or failed
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  const curriculumStyles: Record<string, string> = {
    IB: 'border-blue-400/30 text-blue-300 bg-blue-500/10',
    AP: 'border-amber-400/30 text-amber-300 bg-amber-500/10',
    IGCSE: 'border-[#F5B942]/30 text-[#F5B942] bg-[#F5B942]/10',
    SAT_ACT: 'border-teal-400/30 text-teal-300 bg-teal-500/10',
  };

  const isEnrolledSubject = currentUser.subjects?.some(
    (subj) =>
      subj.toLowerCase().includes(group.subject.toLowerCase()) ||
      group.subject.toLowerCase().includes(subj.toLowerCase())
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative flex flex-col justify-between p-5 rounded-2xl glass-card glow-card transition-all duration-300 group ${
        isEnrolledSubject ? 'ring-1 ring-[#F5B942]/30' : ''
      }`}
    >
      <div>
        {/* Top Header: Curriculum + Format Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center flex-wrap gap-1.5">
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
            {isEnrolledSubject && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#F5B942] text-[#0E0D0B] shadow-2xs flex items-center space-x-0.5">
                <span>⭐ Your Subject</span>
              </span>
            )}
          </div>

          {/* Safe Venue Tag (Links directly to Google Maps) */}
          <a
            href={getGoogleMapsUrl(group.venueLabel)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center space-x-1 text-[11px] text-[#D1CEC7] hover:text-[#F5B942] bg-[#1C1A17] hover:bg-[#23201C] px-2 py-0.5 rounded-lg border border-[#F5B942]/20 hover:border-[#F5B942]/40 transition-all shadow-2xs group/map cursor-pointer"
            title="Open library in Google Maps"
          >
            <MapPin className="w-3 h-3 text-[#F5B942] shrink-0 group-hover/map:scale-110 transition-transform" />
            <span className="truncate max-w-[120px] font-medium">{group.venueLabel}</span>
            <ExternalLink className="w-2.5 h-2.5 text-[#7A756D] group-hover/map:text-[#F5B942] shrink-0" />
          </a>
        </div>

        {/* Subject & Title */}
        <p className="text-xs font-bold text-[#F5B942] mb-1">{group.subject}</p>
        <h3 className="text-base font-bold text-white group-hover:text-[#F5B942] transition-colors line-clamp-2 leading-snug">
          {group.title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs text-[#A8A39D] line-clamp-2 leading-relaxed">
          {group.description}
        </p>

        {/* Topic Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {group.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-md bg-[#1C1A17] text-[#C2BEB6] border border-[#F5B942]/15"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-5 pt-4 border-t border-[#F5B942]/15">
        {/* Member Avatars Row with Host Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-1.5 overflow-hidden">
              {group.members.slice(0, 4).map((member, idx) => (
                <div key={member.id || idx} className="relative">
                  <img
                    src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                    alt={member.fullName}
                    title={`${member.fullName}${member.id === group.host.id ? ' (Host)' : ''} • ${member.schoolName}`}
                    className={`inline-block h-6 w-6 rounded-full ring-2 ring-[#161513] object-cover ${
                      member.id === group.host.id ? 'ring-[#F5B942]/50' : ''
                    }`}
                  />
                  {member.id === group.host.id && (
                    <Crown className="absolute -top-1.5 -right-0.5 w-3 h-3 text-[#F5B942] drop-shadow-sm" />
                  )}
                </div>
              ))}
            </div>
            <div className="text-[11px] text-[#A8A39D]">
              <span className="font-semibold text-white">
                {group.members.length}/{group.maxMembers}
              </span>{' '}
              <span className="text-[#7A756D]">
                ({group.maxMembers - group.members.length} open)
              </span>
            </div>
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div className="capacity-bar h-1 mb-3">
          <div
            className={`capacity-bar-fill h-full ${capacityPercent >= 100 ? '!bg-[#F5B942]' : ''}`}
            style={{ width: `${capacityPercent}%` }}
          />
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleShare}
            className="relative p-2 rounded-xl border border-[#F5B942]/20 hover:border-[#F5B942]/50 hover:bg-[#F5B942]/10 text-[#9E988F] hover:text-[#F5B942] transition-all cursor-pointer shadow-2xs"
            title="Share pod link with peers"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#F5B942]" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            {copied && (
              <span className="absolute -top-7 right-0 px-2 py-0.5 rounded-md bg-[#1C1A17] border border-[#F5B942]/30 text-[#F5B942] text-[10px] font-semibold whitespace-nowrap shadow-lg animate-in fade-in slide-in-from-bottom-1">
                Link copied!
              </span>
            )}
          </button>

          <button
            onClick={() => onJoinOrOpen(group)}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.98] cursor-pointer ${
              isMember
                ? 'bg-[#F5B942]/15 border border-[#F5B942]/40 text-[#F5B942] hover:bg-[#F5B942]/25'
                : isFull
                ? 'bg-[#1C1A17] text-[#7A756D] cursor-not-allowed border border-[#2A2723]'
                : 'bg-[#F5B942] hover:bg-[#E5A832] text-[#0E0D0B] shadow-sm shadow-[#F5B942]/20 cta-glow'
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
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
