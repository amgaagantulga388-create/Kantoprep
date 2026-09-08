'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  ShieldAlert,
  MapPin,
  Clock,
  Users,
  AlertTriangle,
  Lock,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Paperclip,
  Calendar,
  Download,
  ExternalLink,
  FileText,
  Share2,
  Check,
  LogOut,
  Trash2,
  Headphones,
} from 'lucide-react';
import { StudyGroup, StudentProfile, ChatMessage, ResourceMetadata, ResourceCategory } from '@/types';
import { VENUE_CONFIG, getGoogleMapsUrl } from '@/lib/constants';
import { inspectContentSafety, rateLimiter } from '@/lib/safety';
import { generateGoogleCalendarUrl, downloadIcsFile } from '@/lib/calendar';
import { ambientAudio, SoundType } from '@/lib/audioEngine';

interface GroupChatDrawerProps {
  group: StudyGroup | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: StudentProfile;
  messages: ChatMessage[];
  onSendMessage: (groupId: string, content: string, type?: 'text' | 'resource_link' | 'timer_event', resource?: ResourceMetadata) => void;
  onOpenReport: (group: StudyGroup) => void;
  onLeaveGroup?: (groupId: string) => void;
  onCancelGroup?: (groupId: string) => void;
}

export const GroupChatDrawer: React.FC<GroupChatDrawerProps> = ({
  group,
  isOpen,
  onClose,
  currentUser,
  messages,
  onSendMessage,
  onOpenReport,
  onLeaveGroup,
  onCancelGroup,
}) => {
  const [inputText, setInputText] = useState('');
  const [safetyAlert, setSafetyAlert] = useState<string | null>(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isHost = group ? group.host.id === currentUser.id : false;
  const isMember = group ? group.members.some((m) => m.id === currentUser.id) : false;

  // Handle Share pod link
  const handleShare = async () => {
    if (!group) return;
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
        // Ignore
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handleConfirmLeave = () => {
    if (!group) return;
    setIsLeaveModalOpen(false);
    if (onLeaveGroup) {
      onLeaveGroup(group.id);
    }
    onClose();
  };

  const handleConfirmCancel = () => {
    if (!group) return;
    setIsCancelModalOpen(false);
    if (onCancelGroup) {
      onCancelGroup(group.id);
    }
    onClose();
  };

  // Pomodoro Focus Sprint State (25 mins = 1500 secs)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerExpanded, setIsTimerExpanded] = useState(false);
  const [ambientSound, setAmbientSound] = useState<SoundType>('off');

  // Stop ambient audio on unmount or drawer close
  useEffect(() => {
    return () => {
      ambientAudio.stop();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      ambientAudio.stop();
    }
  }, [isOpen]);

  const handleClose = () => {
    ambientAudio.stop();
    setAmbientSound('off');
    onClose();
  };

  // Resource attachment popover state
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [resourceCategory, setResourceCategory] = useState<ResourceCategory>('past_paper');

  // Quick action reply chips
  const quickChips = [
    '👋 Arrived at the library!',
    '⏳ Running 5 mins late',
    '🙏 Cannot make it today (notifying pod)',
    '📄 Check Question 3 markscheme',
    '💡 Reviewing formula sheet',
    '✅ Finished Paper 1 sprint',
  ];

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Pomodoro countdown timer tick
  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  if (!group) return null;

  // Toggle Timer
  const handleToggleTimer = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      // Broadcast sprint start to group
      onSendMessage(
        group.id,
        `🎯 ${currentUser.fullName} started a 25-minute Pomodoro study sprint!`,
        'timer_event'
      );
    } else {
      setIsTimerRunning(false);
    }
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(25 * 60);
  };

  const formatTimerDigits = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Handle standard message submission
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessageContent(inputText);
  };

  // Send content with safety verification
  const sendMessageContent = (text: string) => {
    if (!text.trim()) return;

    const rateCheck = rateLimiter.isRateLimited(`chat_${currentUser.id}`, 1200);
    if (rateCheck.limited) {
      setSafetyAlert(`Please wait ${rateCheck.waitSeconds}s before sending another message.`);
      setTimeout(() => setSafetyAlert(null), 3000);
      return;
    }

    const safety = inspectContentSafety(text);
    if (safety.severity === 'blocked') {
      setSafetyAlert(safety.message || 'Message blocked for safety or academic integrity.');
      return;
    }

    if (safety.severity === 'warning') {
      setSafetyAlert(safety.message || 'Please keep contact info safe.');
      setTimeout(() => setSafetyAlert(null), 5000);
    } else {
      setSafetyAlert(null);
    }

    onSendMessage(group.id, safety.sanitizedText, 'text');
    setInputText('');
  };

  // Handle resource attachment submit
  const handleAttachResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceTitle.trim() || !resourceUrl.trim()) return;

    let cleanUrl = resourceUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const newResource: ResourceMetadata = {
      id: `res_${Date.now()}`,
      title: resourceTitle.trim(),
      url: cleanUrl,
      category: resourceCategory,
      sharedBy: currentUser.fullName,
      createdAt: new Date().toISOString(),
    };

    onSendMessage(
      group.id,
      `Shared a resource: ${newResource.title}`,
      'resource_link',
      newResource
    );

    setResourceTitle('');
    setResourceUrl('');
    setIsAttachOpen(false);
  };

  const venueInfo = VENUE_CONFIG[group.venueType];
  const timerPercent = ((25 * 60 - timerSeconds) / (25 * 60)) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />

          {/* Slide-over Drawer */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-screen max-w-md bg-[#141310] flex flex-col shadow-2xl border-l border-[#F5B942]/20 text-white"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-[#F5B942]/15 bg-[#141310]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-[#F5B942]/10 text-[#F5B942] border border-[#F5B942]/30">
                      {group.curriculum}
                    </span>
                    <span className="text-xs font-semibold text-[#A8A39D] truncate max-w-[180px]">
                      {group.subject}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {/* Pomodoro Timer Toggle Button */}
                    <button
                      onClick={() => setIsTimerExpanded(!isTimerExpanded)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isTimerRunning
                          ? 'text-[#0E0D0B] bg-[#F5B942]'
                          : 'text-[#A8A39D] hover:text-white hover:bg-[#1C1A17]'
                      }`}
                      title="Toggle 25-Min Study Sprint Timer"
                    >
                      <Timer className="w-4 h-4" />
                    </button>

                    {/* Report Button */}
                    <button
                      onClick={() => onOpenReport(group)}
                      title="Report room or participant for safety"
                      className="p-1.5 rounded-lg text-[#A8A39D] hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>

                    {/* Close Button */}
                    <button
                      onClick={handleClose}
                      className="p-1.5 rounded-xl text-[#A8A39D] hover:text-white hover:bg-[#1C1A17] transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <h2 className="mt-2 text-base font-bold text-white leading-snug">
                  {group.title}
                </h2>

                {/* Venue & Calendar Actions */}
                <div className="mt-3 p-2.5 rounded-xl bg-[#1A1815] border border-[#F5B942]/15 text-xs flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-white">
                      <MapPin className="w-3.5 h-3.5 text-[#F5B942] mr-1.5 shrink-0" />
                      <span className="font-semibold truncate">{group.venueLabel}</span>
                    </div>

                    {/* Add to Maps, Calendar, and Share Buttons */}
                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={handleShare}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#141310] border border-[#F5B942]/20 hover:border-[#F5B942]/60 text-[10px] text-[#EDEDEB] hover:text-[#F5B942] font-medium transition-colors cursor-pointer shadow-2xs"
                        title="Share pod link"
                      >
                        {shareCopied ? (
                          <Check className="w-3 h-3 text-[#F5B942]" />
                        ) : (
                          <Share2 className="w-3 h-3 text-[#F5B942]" />
                        )}
                        <span>{shareCopied ? 'Copied' : 'Share'}</span>
                      </button>
                      <a
                        href={getGoogleMapsUrl(group.venueLabel, venueInfo?.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#141310] border border-[#F5B942]/20 hover:border-[#F5B942]/60 text-[10px] text-[#EDEDEB] hover:text-[#F5B942] font-medium transition-colors cursor-pointer shadow-2xs"
                        title="Open venue in Google Maps"
                      >
                        <ExternalLink className="w-3 h-3 text-[#F5B942]" />
                        <span>Maps</span>
                      </a>
                      <a
                        href={generateGoogleCalendarUrl(group)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#141310] border border-[#F5B942]/20 hover:border-[#F5B942]/60 text-[10px] text-[#EDEDEB] hover:text-[#F5B942] font-medium transition-colors cursor-pointer shadow-2xs"
                        title="Add meeting to Google Calendar"
                      >
                        <Calendar className="w-3 h-3 text-[#F5B942]" />
                        <span>Google Cal</span>
                      </a>
                      <button
                        onClick={() => downloadIcsFile(group)}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#141310] border border-[#F5B942]/20 hover:border-[#F5B942]/60 text-[10px] text-[#EDEDEB] hover:text-[#F5B942] font-medium transition-colors cursor-pointer shadow-2xs"
                        title="Download .ics for Apple Calendar / Outlook"
                      >
                        <Download className="w-3 h-3 text-[#A8A39D]" />
                        <span>.ics</span>
                      </button>
                    </div>
                  </div>

                  {venueInfo?.address && (
                    <p className="text-[11px] text-[#7A756D] pl-5 leading-tight">
                      {venueInfo.address}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-[#F5B942]/10 text-[11px] text-[#A8A39D]">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 text-[#F5B942] mr-1" />
                      {group.meetingTime} ({group.durationMinutes} mins)
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="flex items-center">
                        <Users className="w-3 h-3 text-[#F5B942] mr-1" />
                        {group.members.length}/{group.maxMembers} Students
                      </span>
                      {isHost ? (
                        <button
                          type="button"
                          onClick={() => setIsCancelModalOpen(true)}
                          className="text-[10px] text-red-400 hover:text-red-300 font-medium hover:underline cursor-pointer pl-1.5 border-l border-[#F5B942]/15"
                          title="Cancel and remove this study session"
                        >
                          Cancel Pod
                        </button>
                      ) : isMember ? (
                        <button
                          type="button"
                          onClick={() => setIsLeaveModalOpen(true)}
                          className="text-[10px] text-[#A8A39D] hover:text-red-400 font-medium hover:underline cursor-pointer pl-1.5 border-l border-[#F5B942]/15"
                          title="Leave this study pod"
                        >
                          Leave Pod
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Pomodoro Focus Timer Bar (Expandable) */}
                <AnimatePresence>
                  {isTimerExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-3 rounded-2xl bg-[#1C1A17] border border-[#F5B942]/30 overflow-hidden shadow-inner"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-1.5 text-xs text-[#F5B942] font-semibold">
                          <Timer className="w-4 h-4 text-[#F5B942]" />
                          <span>Pomodoro Focus Sprint</span>
                        </div>
                        <span className="font-mono text-base font-extrabold text-white">
                          {formatTimerDigits(timerSeconds)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-[#0E0D0B] rounded-full overflow-hidden mb-2.5 border border-[#F5B942]/20">
                        <div
                          className="h-full bg-[#F5B942] transition-all duration-300 rounded-full shadow-[0_0_8px_rgba(245,185,66,0.5)]"
                          style={{ width: `${timerPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-end space-x-2 text-xs">
                        <button
                          type="button"
                          onClick={handleResetTimer}
                          className="px-2 py-1 rounded-lg bg-[#141310] border border-[#F5B942]/20 text-[#A8A39D] hover:text-white text-[11px] hover:bg-[#1A1815] font-medium cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 inline mr-1" />
                          Reset
                        </button>
                        <button
                          type="button"
                          onClick={handleToggleTimer}
                          className={`px-3 py-1 rounded-lg text-[#0E0D0B] text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                            isTimerRunning
                              ? 'bg-amber-400 hover:bg-amber-300'
                              : 'bg-[#F5B942] hover:bg-[#E5A832]'
                          }`}
                        >
                          {isTimerRunning ? (
                            <>
                              <Pause className="w-3 h-3" />
                              <span>Pause Sprint</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3" />
                              <span>Start 25m Sprint</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Ambient Focus Audio Soundboard */}
                      <div className="mt-2.5 pt-2 border-t border-[#F5B942]/15 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-[#A8A39D] flex items-center gap-1">
                          <Headphones className="w-3 h-3 text-[#F5B942]" />
                          <span>Focus Audio</span>
                        </span>
                        <div className="flex items-center space-x-1">
                          {[
                            { id: 'off', label: 'Off' },
                            { id: 'rain', label: '🌧️ Rain' },
                            { id: 'library', label: '📚 Library' },
                            { id: 'cafe', label: '☕ Cafe' },
                          ].map((snd) => (
                            <button
                              key={snd.id}
                              type="button"
                              onClick={() => {
                                const next = snd.id as SoundType;
                                setAmbientSound(next);
                                ambientAudio.play(next);
                              }}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                                ambientSound === snd.id
                                  ? 'bg-[#F5B942] text-[#0E0D0B] font-bold shadow-2xs'
                                  : 'bg-[#141310] text-[#A8A39D] hover:text-white border border-[#F5B942]/20'
                              }`}
                            >
                              {snd.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {/* Academic Honesty Banner */}
                <div className="p-3 rounded-xl bg-[#1C1A17] border border-[#F5B942]/20 text-xs text-[#EDEDEB] flex items-start space-x-2">
                  <Lock className="w-4 h-4 text-[#F5B942] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-[#F5B942]">Tokyo Student Safety Shield:</strong> Verified school emails only. No test bank leaks or commercial requests permitted.
                  </p>
                </div>

                {messages.length === 0 ? (
                  <div className="text-center py-12 text-[#7A756D] text-xs">
                    <p>No messages yet. Be the first to say hi and coordinate past papers!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender.id === currentUser.id;

                    // Timer or System Announcement
                    if (msg.isSystem || msg.type === 'timer_event') {
                      return (
                        <div
                          key={msg.id}
                          className="my-2 p-2 rounded-xl bg-[#1C1A17] border border-[#F5B942]/20 text-center text-[11px] text-[#F5B942] font-medium"
                        >
                          {msg.content}
                        </div>
                      );
                    }

                    // Resource Link Card Message
                    if (msg.type === 'resource_link' && msg.resource) {
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end space-x-2 ${
                            isMe ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {!isMe && (
                            <Image
                              src={msg.sender.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                              alt={msg.sender.fullName}
                              width={28}
                              height={28}
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-[#F5B942]/30"
                              unoptimized={msg.sender.avatarUrl?.startsWith('data:')}
                            />
                          )}

                          <div className={`max-w-[85%] ${isMe ? 'items-end' : 'items-start'}`}>
                            {!isMe && (
                              <div className="flex items-center space-x-1.5 mb-1 px-1">
                                <span className="text-[11px] font-semibold text-[#EDEDEB]">
                                  {msg.sender.fullName}
                                </span>
                                <span className="text-[10px] text-[#F5B942] bg-[#F5B942]/10 px-1.5 py-0.5 rounded border border-[#F5B942]/30 font-medium">
                                  {msg.sender.schoolName.split(' ')[0]}
                                </span>
                              </div>
                            )}

                            {/* Rich Resource Card */}
                            <a
                              href={msg.resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-3.5 rounded-2xl bg-[#1A1815] border border-[#F5B942]/20 shadow-xs hover:border-[#F5B942] hover:shadow-[0_0_15px_rgba(245,185,66,0.15)] transition-all group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center space-x-2 text-[#F5B942]">
                                  <FileText className="w-4 h-4" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F5B942]/10 border border-[#F5B942]/30">
                                    {msg.resource.category.replace('_', ' ')}
                                  </span>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-[#A8A39D] group-hover:text-[#F5B942] transition-colors" />
                              </div>
                              <p className="mt-1.5 text-xs font-bold text-white group-hover:text-[#F5B942] transition-colors leading-snug">
                                {msg.resource.title}
                              </p>
                              <p className="text-[10px] text-[#7A756D] mt-1 truncate">
                                {msg.resource.url}
                              </p>
                            </a>

                            <p className="text-[10px] text-[#7A756D] mt-1 px-1 text-right">
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    // Standard Text Message
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end space-x-2 ${
                          isMe ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {!isMe && (
                          <Image
                            src={
                              msg.sender.avatarUrl ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'
                            }
                            alt={msg.sender.fullName}
                            width={28}
                            height={28}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-[#F5B942]/30"
                            unoptimized={msg.sender.avatarUrl?.startsWith('data:')}
                          />
                        )}

                        <div className={`max-w-[78%] ${isMe ? 'items-end' : 'items-start'}`}>
                          {!isMe && (
                            <div className="flex items-center space-x-1.5 mb-1 px-1">
                              <span className="text-[11px] font-semibold text-[#EDEDEB]">
                                {msg.sender.fullName}
                              </span>
                              <span className="text-[10px] text-[#F5B942] bg-[#F5B942]/10 px-1.5 py-0.5 rounded border border-[#F5B942]/30 font-medium">
                                {msg.sender.schoolName.split(' ')[0]}
                              </span>
                            </div>
                          )}

                          <div
                            className={`p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                              isMe
                                ? 'bg-[#F5B942] text-[#0E0D0B] font-medium rounded-br-xs shadow-md shadow-[#F5B942]/10'
                                : 'bg-[#1A1815] text-[#EDEDEB] rounded-bl-xs border border-[#F5B942]/15'
                            }`}
                          >
                            {msg.content}
                          </div>

                          <p className="text-[10px] text-[#7A756D] mt-1 px-1 text-right">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Safety Warning */}
              {safetyAlert && (
                <div className="px-4 py-2 bg-red-950/60 border-t border-red-900/60 text-xs text-red-300 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-[11px] leading-tight">{safetyAlert}</span>
                </div>
              )}

              {/* Resource Attachment Popover Modal */}
              <AnimatePresence>
                {isAttachOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-3 border-t border-[#F5B942]/20 bg-[#161513]"
                  >
                    <form onSubmit={handleAttachResource} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center space-x-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-[#F5B942]" />
                          <span>Share Past Paper / Markscheme Link</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsAttachOpen(false)}
                          className="text-[#A8A39D] hover:text-white text-xs cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      <input
                        type="text"
                        value={resourceTitle}
                        onChange={(e) => setResourceTitle(e.target.value)}
                        placeholder="e.g., May 2024 Math AA HL Paper 1 PDF"
                        required
                        className="w-full px-3 py-1.5 bg-[#1C1A17] border border-[#F5B942]/20 rounded-xl text-xs text-white placeholder-[#7A756D] focus:outline-none focus:border-[#F5B942]"
                      />

                      <div className="flex gap-2">
                        <select
                          value={resourceCategory}
                          onChange={(e) => setResourceCategory(e.target.value as ResourceCategory)}
                          className="w-1/3 px-2 py-1.5 bg-[#1C1A17] border border-[#F5B942]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B942]"
                        >
                          <option value="past_paper" className="bg-[#1C1A17] text-white">Past Paper</option>
                          <option value="markscheme" className="bg-[#1C1A17] text-white">Markscheme</option>
                          <option value="notes" className="bg-[#1C1A17] text-white">Notes</option>
                          <option value="rubric" className="bg-[#1C1A17] text-white">IA Rubric</option>
                        </select>

                        <input
                          type="url"
                          value={resourceUrl}
                          onChange={(e) => setResourceUrl(e.target.value)}
                          placeholder="https://drive.google.com/..."
                          required
                          className="flex-1 px-3 py-1.5 bg-[#1C1A17] border border-[#F5B942]/20 rounded-xl text-xs text-white placeholder-[#7A756D] focus:outline-none focus:border-[#F5B942]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-1.5 bg-[#F5B942] hover:bg-[#E5A832] text-[#0E0D0B] text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        Attach Link to Chat
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Action Chips */}
              <div className="px-3 pt-2 pb-1 bg-[#141310] border-t border-[#F5B942]/10 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                {quickChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => sendMessageContent(chip)}
                    className="px-2.5 py-1 rounded-full bg-[#1A1815] hover:bg-[#F5B942]/10 border border-[#F5B942]/20 hover:border-[#F5B942] text-[11px] text-[#A8A39D] hover:text-[#F5B942] whitespace-nowrap transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSend} className="p-3 bg-[#141310] border-t border-[#F5B942]/15">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAttachOpen(!isAttachOpen)}
                    title="Attach past paper or resource link"
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      isAttachOpen
                        ? 'bg-[#F5B942] border-[#F5B942] text-[#0E0D0B]'
                        : 'bg-[#1A1815] border-[#F5B942]/20 text-[#A8A39D] hover:text-[#F5B942] hover:border-[#F5B942]/50'
                    }`}
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      if (safetyAlert) setSafetyAlert(null);
                    }}
                    placeholder={`Message ${group.members.length} peers...`}
                    className="flex-1 bg-[#1A1815] border border-[#F5B942]/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#7A756D] focus:outline-none focus:border-[#F5B942] focus:ring-1 focus:ring-[#F5B942] transition-all"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2.5 rounded-xl bg-[#F5B942] hover:bg-[#E5A832] disabled:opacity-40 disabled:hover:bg-[#F5B942] text-[#0E0D0B] font-bold transition-all shadow-md shadow-[#F5B942]/20 active:scale-95 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
              {/* Leave Pod Confirmation Modal */}
              <AnimatePresence>
                {isLeaveModalOpen && (
                  <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsLeaveModalOpen(false)}
                      className="fixed inset-0 bg-black/70 backdrop-blur-xs"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="relative w-full max-w-sm bg-[#161513] rounded-3xl p-5 shadow-2xl border border-[#F5B942]/20 z-10 space-y-3"
                    >
                      <div className="flex items-center space-x-2 text-white font-bold text-sm">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-[#F5B942]/30 text-[#F5B942] flex items-center justify-center">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <span>Leave Study Pod?</span>
                      </div>
                      <p className="text-xs text-[#A8A39D] leading-relaxed">
                        Your seat will open for another student. To be respectful, a brief notice will be posted in the chat so your study partners aren&apos;t left waiting.
                      </p>
                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsLeaveModalOpen(false)}
                          className="px-3.5 py-1.5 rounded-xl border border-[#F5B942]/20 hover:bg-[#1C1A17] text-xs text-[#EDEDEB] font-medium cursor-pointer transition-colors"
                        >
                          Stay in Pod
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmLeave}
                          className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                        >
                          Confirm Leave
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Cancel Pod Confirmation Modal */}
              <AnimatePresence>
                {isCancelModalOpen && (
                  <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsCancelModalOpen(false)}
                      className="fixed inset-0 bg-black/70 backdrop-blur-xs"
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="relative w-full max-w-sm bg-[#161513] rounded-3xl p-5 shadow-2xl border border-[#F5B942]/20 z-10 space-y-3"
                    >
                      <div className="flex items-center space-x-2 text-white font-bold text-sm">
                        <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center">
                          <Trash2 className="w-4 h-4" />
                        </div>
                        <span>Cancel Study Session?</span>
                      </div>
                      <p className="text-xs text-[#A8A39D] leading-relaxed">
                        As host, cancelling will remove <strong className="text-white">{group.title}</strong> from KantoPrep listings and notify all joined members.
                      </p>
                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsCancelModalOpen(false)}
                          className="px-3.5 py-1.5 rounded-xl border border-[#F5B942]/20 hover:bg-[#1C1A17] text-xs text-[#EDEDEB] font-medium cursor-pointer transition-colors"
                        >
                          Keep Session
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmCancel}
                          className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                        >
                          Cancel Session
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
