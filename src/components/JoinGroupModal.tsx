'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Users, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';
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
  currentUser,
  onConfirmJoin,
  onClose,
}) => {
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
          className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 mb-3 border-b border-zinc-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Study Pod Etiquette
              </span>
              <h3 className="text-lg font-bold text-zinc-900 mt-1 leading-snug">
                Join {group.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Session Overview Card */}
          <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-1.5 mb-4">
            <div className="flex items-center justify-between text-zinc-800">
              <span className="font-semibold text-emerald-800">{group.subject}</span>
              <span className="text-zinc-500 font-medium">Host: {group.host.fullName}</span>
            </div>
            <div className="flex items-center text-zinc-600">
              <Clock className="w-3.5 h-3.5 text-amber-500 mr-1.5 shrink-0" />
              <span>{group.meetingTime} ({group.durationMinutes} mins)</span>
            </div>
            <div className="flex items-center justify-between text-zinc-600 pt-0.5">
              <div className="flex items-center truncate mr-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0" />
                <span className="truncate">{group.venueLabel}</span>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-[11px] text-emerald-700 hover:underline shrink-0"
              >
                <span>View Map</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Capacity notice or Smooth Responsibility & Attendance Reminder */}
          {isFull ? (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2 mb-5">
              <Users className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                This study pod is currently full (<strong>{group.members.length}/{group.maxMembers}</strong> seats taken). Check back soon or browse other available sessions!
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-zinc-700 space-y-2 mb-5">
              <div className="flex items-center space-x-1.5 text-emerald-900 font-bold">
                <span>🤝 A quick reminder before you join:</span>
              </div>
              <p className="text-zinc-600 leading-relaxed">
                Your peers are reserving a seat for you. If your schedule changes or something comes up, <strong>please notify your pod in the chat beforehand</strong> so the group can plan accordingly.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-600 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isFull}
              onClick={() => onConfirmJoin(group)}
              className={`w-2/3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 ${
                isFull
                  ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer'
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
