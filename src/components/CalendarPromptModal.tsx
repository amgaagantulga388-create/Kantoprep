'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Download,
  ExternalLink,
  MapPin,
  Clock,
  CheckCircle2,
  X,
  MessageSquare,
  BellRing,
} from 'lucide-react';
import { StudyGroup } from '@/types';
import { VENUE_CONFIG } from '@/lib/constants';
import { generateGoogleCalendarUrl, downloadIcsFile } from '@/lib/calendar';

interface CalendarPromptModalProps {
  isOpen: boolean;
  group: StudyGroup | null;
  isHost?: boolean;
  onClose: () => void;
  onOpenChat: (group: StudyGroup) => void;
}

export const CalendarPromptModal: React.FC<CalendarPromptModalProps> = ({
  isOpen,
  group,
  isHost = false,
  onClose,
  onOpenChat,
}) => {
  const [syncedGoogle, setSyncedGoogle] = useState(false);
  const [syncedIcs, setSyncedIcs] = useState(false);

  if (!isOpen || !group) return null;

  const venueInfo = VENUE_CONFIG[group.venueType];
  const googleCalUrl = generateGoogleCalendarUrl(group);

  const handleGoogleClick = () => {
    setSyncedGoogle(true);
    window.open(googleCalUrl, '_blank', 'noopener,noreferrer');
  };

  const handleIcsClick = () => {
    setSyncedIcs(true);
    downloadIcsFile(group);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-[#161513] rounded-3xl p-6 shadow-2xl border border-[#F5B942]/30 z-10 overflow-hidden text-white"
        >
          {/* Subtle gold glow */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-[#F5B942]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-[#F5B942]/15 relative z-10">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#F5B942]/20 border border-[#F5B942]/40 flex items-center justify-center text-[#F5B942]">
                <BellRing className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F5B942] bg-[#F5B942]/10 px-2 py-0.5 rounded-md border border-[#F5B942]/30">
                  {isHost ? 'Pod Created Successfully' : 'Seat Reserved'}
                </span>
                <h3 className="text-lg font-bold text-white mt-1 leading-snug">
                  Never Miss Your Pod Session
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#A8A39D] hover:text-white hover:bg-[#1C1A17] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Persuasive Callout */}
          <div className="mt-4 p-3 rounded-2xl bg-[#1C1A17] border border-[#F5B942]/20 text-xs text-[#EDEDEB] space-y-1 relative z-10">
            <p className="text-white font-medium">
              Sync this pod with your personal calendar to receive automatic notifications on your phone, watch, and computer.
            </p>
            <p className="text-[#A8A39D] text-[11px]">
              Your calendar will notify you 24h and 1h before meeting at the venue.
            </p>
          </div>

          {/* Session Summary Card */}
          <div className="mt-3.5 p-3.5 rounded-2xl bg-[#141310] border border-[#F5B942]/15 text-xs space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-white">{group.title}</h4>
              <span className="text-[11px] font-semibold text-[#F5B942] px-2 py-0.5 rounded-md bg-[#F5B942]/10 border border-[#F5B942]/25">
                {group.subject}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-[#A8A39D]">
              <div className="flex items-center">
                <Clock className="w-3.5 h-3.5 text-[#F5B942] mr-1.5 shrink-0" />
                <span>{group.meetingTime} ({group.durationMinutes} mins)</span>
              </div>
              <div className="flex items-center truncate">
                <MapPin className="w-3.5 h-3.5 text-[#F5B942] mr-1.5 shrink-0" />
                <span className="truncate">{group.venueLabel}</span>
              </div>
            </div>

            {venueInfo?.address && (
              <p className="text-[10px] text-[#7A756D] pl-5 leading-tight">
                {venueInfo.address}
              </p>
            )}
          </div>

          {/* Calendar Action Buttons */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 relative z-10">
            {/* Google Calendar */}
            <button
              type="button"
              onClick={handleGoogleClick}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                syncedGoogle
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-[#F5B942] hover:bg-[#E5A832] text-[#0E0D0B] border-[#F5B942] shadow-md shadow-[#F5B942]/20 active:scale-98'
              }`}
            >
              {syncedGoogle ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Google Cal Synced</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 text-[#0E0D0B]" />
                  <span>Add to Google Cal</span>
                  <ExternalLink className="w-3 h-3 text-[#0E0D0B]/70" />
                </>
              )}
            </button>

            {/* Apple Calendar / Outlook (.ics) */}
            <button
              type="button"
              onClick={handleIcsClick}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                syncedIcs
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-[#1C1A17] hover:bg-[#25231F] text-white border-[#F5B942]/30 hover:border-[#F5B942]/60 active:scale-98'
              }`}
            >
              {syncedIcs ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>.ics File Downloaded</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#F5B942]" />
                  <span>Apple / Outlook (.ics)</span>
                </>
              )}
            </button>
          </div>

          {/* Footer Action */}
          <div className="mt-4 pt-3 border-t border-[#F5B942]/15 flex items-center justify-between text-xs relative z-10">
            <button
              type="button"
              onClick={onClose}
              className="text-[#A8A39D] hover:text-white transition-colors cursor-pointer"
            >
              Maybe later
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenChat(group);
              }}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#25231F] hover:bg-[#322F2A] text-[#EDEDEB] hover:text-white border border-[#F5B942]/20 hover:border-[#F5B942]/50 font-semibold transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#F5B942]" />
              <span>Go to Pod Chat</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
