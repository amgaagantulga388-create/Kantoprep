'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Users, ArrowRight, ExternalLink } from 'lucide-react';
import { StudyGroup, StudentProfile } from '@/types';
import { getGoogleMapsUrl, VENUE_CONFIG } from '@/lib/constants';

interface JoinGroupModalProps {
  isOpen: boolean;
  group: StudyGroup | null;
  currentUser: StudentProfile;
  onConfirmJoin: (group: StudyGroup) => void;
  onClose: () => void;
}

export const JoinGroupModal: React.FC<JoinGroupModalProps> = ({
  isOpen,
  group,
  onConfirmJoin,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !group) return null;

  const venueInfo = VENUE_CONFIG[group.venueType];
  const mapsUrl = getGoogleMapsUrl(group.venueLabel, venueInfo?.address);
  const isFull = group.members.length >= group.maxMembers;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="join-group-title"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-[#161513] rounded-3xl p-6 shadow-2xl border border-[#F5B942]/20 z-10 overflow-hidden text-white"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 mb-3 border-b border-[#F5B942]/15">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F5B942] bg-[#F5B942]/10 px-2 py-0.5 rounded-md border border-[#F5B942]/30">
                Study Pod Etiquette
              </span>
              <h3 id="join-group-title" className="text-lg font-bold text-white mt-1 leading-snug">
                Join {group.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-xl text-[#A8A39D] hover:text-white hover:bg-[#1C1A17] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Session Overview Card */}
          <div className="p-3 rounded-2xl bg-[#1C1A17] border border-[#F5B942]/15 text-xs space-y-1.5 mb-4 text-[#EDEDEB]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#F5B942]">{group.subject}</span>
              <span className="text-[#A8A39D] font-medium">Host: {group.host.fullName}</span>
            </div>
            <div className="flex items-center text-[#A8A39D]">
              <Clock className="w-3.5 h-3.5 text-[#F5B942] mr-1.5 shrink-0" />
              <span>{group.meetingTime} ({group.durationMinutes} mins)</span>
            </div>
            <div className="flex items-center justify-between text-[#A8A39D] pt-0.5">
              <div className="flex items-center truncate mr-2 text-[#EDEDEB]">
                <MapPin className="w-3.5 h-3.5 text-[#F5B942] mr-1.5 shrink-0" />
                <span className="truncate">{group.venueLabel}</span>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-[11px] text-[#F5B942] hover:underline shrink-0"
              >
                <span>View Map</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Capacity notice or Smooth Responsibility & Attendance Reminder */}
          {isFull ? (
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-[#F5B942]/30 text-xs text-amber-200 flex items-start space-x-2 mb-5">
              <Users className="w-4 h-4 text-[#F5B942] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                This study pod is currently full (<strong>{group.members.length}/{group.maxMembers}</strong> seats taken). Check back soon or browse other available sessions!
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-[#1A1815] border border-[#F5B942]/25 text-xs text-[#EDEDEB] space-y-2 mb-5">
              <div className="flex items-center space-x-1.5 text-[#F5B942] font-bold">
                <span>🤝 A quick reminder before you join:</span>
              </div>
              <p className="text-[#A8A39D] leading-relaxed">
                Your peers are reserving a seat for you. If your schedule changes or something comes up, <strong className="text-white">please notify your pod in the chat beforehand</strong> so the group can plan accordingly.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl border border-[#F5B942]/20 hover:bg-[#1C1A17] text-xs font-semibold text-[#EDEDEB] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isFull}
              onClick={() => onConfirmJoin(group)}
              className={`w-2/3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                isFull
                  ? 'bg-[#1C1A17] text-[#7A756D] border border-[#F5B942]/10 cursor-not-allowed'
                  : 'bg-[#F5B942] hover:bg-[#E5A832] text-[#0E0D0B] shadow-md shadow-[#F5B942]/20 active:scale-95 cursor-pointer'
              }`}
            >
              <span>{isFull ? 'Pod Full' : 'I Commit & Join Pod'}</span>
              {!isFull && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
