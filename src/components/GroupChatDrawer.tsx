'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Bookmark,
  CheckCircle2,
} from 'lucide-react';
import { StudyGroup, StudentProfile, ChatMessage, ResourceMetadata, ResourceCategory } from '@/types';
import { VENUE_CONFIG, getGoogleMapsUrl } from '@/lib/constants';
import { inspectContentSafety, rateLimiter } from '@/lib/safety';
import { generateGoogleCalendarUrl, downloadIcsFile } from '@/lib/calendar';

interface GroupChatDrawerProps {
  group: StudyGroup | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: StudentProfile;
  messages: ChatMessage[];
  onSendMessage: (groupId: string, content: string, type?: 'text' | 'resource_link' | 'timer_event', resource?: ResourceMetadata) => void;
  onOpenReport: (group: StudyGroup) => void;
}

export const GroupChatDrawer: React.FC<GroupChatDrawerProps> = ({
  group,
  isOpen,
  onClose,
  currentUser,
  messages,
  onSendMessage,
  onOpenReport,
}) => {
  const [inputText, setInputText] = useState('');
  const [safetyAlert, setSafetyAlert] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Pomodoro Focus Sprint State (25 mins = 1500 secs)
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerExpanded, setIsTimerExpanded] = useState(false);

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
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

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
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />

          {/* Slide-over Drawer */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-screen max-w-md bg-white flex flex-col shadow-2xl border-l border-zinc-200"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-zinc-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {group.curriculum}
                    </span>
                    <span className="text-xs font-semibold text-zinc-700 truncate max-w-[180px]">
                      {group.subject}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {/* Pomodoro Timer Toggle Button */}
                    <button
                      onClick={() => setIsTimerExpanded(!isTimerExpanded)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isTimerRunning
                          ? 'text-emerald-600 bg-emerald-50'
                          : 'text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100'
                      }`}
                      title="Toggle 25-Min Study Sprint Timer"
                    >
                      <Timer className="w-4 h-4" />
                    </button>

                    {/* Report Button */}
                    <button
                      onClick={() => onOpenReport(group)}
                      title="Report room or participant for safety"
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>

                    {/* Close Button */}
                    <button
                      onClick={onClose}
                      className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <h2 className="mt-2 text-base font-bold text-zinc-900 leading-snug">
                  {group.title}
                </h2>

                {/* Venue & Calendar Actions */}
                <div className="mt-3 p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-zinc-800">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0" />
                      <span className="font-semibold truncate">{group.venueLabel}</span>
                    </div>

                    {/* Add to Maps and Calendar Buttons */}
                    <div className="flex items-center space-x-1">
                      <a
                        href={getGoogleMapsUrl(group.venueLabel, venueInfo?.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white border border-zinc-200 hover:border-emerald-300 text-[10px] text-zinc-700 hover:text-emerald-700 font-medium transition-colors cursor-pointer shadow-2xs"
                        title="Open venue in Google Maps"
                      >
                        <ExternalLink className="w-3 h-3 text-emerald-600" />
                        <span>Maps</span>
                      </a>
                      <a
                        href={generateGoogleCalendarUrl(group)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white border border-zinc-200 hover:border-emerald-300 text-[10px] text-zinc-700 hover:text-emerald-700 font-medium transition-colors cursor-pointer shadow-2xs"
                        title="Add meeting to Google Calendar"
                      >
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        <span>Google Cal</span>
                      </a>
                      <button
                        onClick={() => downloadIcsFile(group)}
                        className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-white border border-zinc-200 hover:border-emerald-300 text-[10px] text-zinc-700 hover:text-emerald-700 font-medium transition-colors cursor-pointer shadow-2xs"
                        title="Download .ics for Apple Calendar / Outlook"
                      >
                        <Download className="w-3 h-3 text-zinc-500" />
                        <span>.ics</span>
                      </button>
                    </div>
                  </div>

                  {venueInfo?.address && (
                    <p className="text-[11px] text-zinc-500 pl-5 leading-tight">
                      {venueInfo.address}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-200 text-[11px] text-zinc-500">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 text-amber-500 mr-1" />
                      {group.meetingTime} ({group.durationMinutes} mins)
                    </span>
                    <span className="flex items-center">
                      <Users className="w-3 h-3 text-emerald-600 mr-1" />
                      {group.members.length}/{group.maxMembers} Students
                    </span>
                  </div>
                </div>

                {/* Pomodoro Focus Timer Bar (Expandable) */}
                <AnimatePresence>
                  {isTimerExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-1.5 text-xs text-emerald-900 font-semibold">
                          <Timer className="w-4 h-4 text-emerald-600" />
                          <span>Pomodoro Focus Sprint</span>
                        </div>
                        <span className="font-mono text-base font-extrabold text-emerald-800">
                          {formatTimerDigits(timerSeconds)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 bg-emerald-200/60 rounded-full overflow-hidden mb-2.5">
                        <div
                          className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                          style={{ width: `${timerPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-end space-x-2 text-xs">
                        <button
                          type="button"
                          onClick={handleResetTimer}
                          className="px-2 py-1 rounded-lg bg-white border border-zinc-200 text-zinc-600 text-[11px] hover:bg-zinc-50 font-medium cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 inline mr-1" />
                          Reset
                        </button>
                        <button
                          type="button"
                          onClick={handleToggleTimer}
                          className={`px-3 py-1 rounded-lg text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center space-x-1 ${
                            isTimerRunning
                              ? 'bg-amber-600 hover:bg-amber-500'
                              : 'bg-emerald-600 hover:bg-emerald-500'
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {/* Academic Honesty Banner */}
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start space-x-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Tokyo Student Safety Shield:</strong> Verified school emails only. No test bank leaks or commercial requests permitted.
                  </p>
                </div>

                {messages.length === 0 ? (
                  <div className="text-center py-12 text-zinc-400 text-xs">
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
                          className="my-2 p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center text-[11px] text-emerald-800 font-medium"
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
                            <img
                              src={msg.sender.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'}
                              alt={msg.sender.fullName}
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-200"
                            />
                          )}

                          <div className={`max-w-[85%] ${isMe ? 'items-end' : 'items-start'}`}>
                            {!isMe && (
                              <div className="flex items-center space-x-1.5 mb-1 px-1">
                                <span className="text-[11px] font-semibold text-zinc-700">
                                  {msg.sender.fullName}
                                </span>
                                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  {msg.sender.schoolName.split(' ')[0]}
                                </span>
                              </div>
                            )}

                            {/* Rich Resource Card */}
                            <a
                              href={msg.resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center space-x-2 text-emerald-700">
                                  <FileText className="w-4 h-4" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                                    {msg.resource.category.replace('_', ' ')}
                                  </span>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-600 transition-colors" />
                              </div>
                              <p className="mt-1.5 text-xs font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors leading-snug">
                                {msg.resource.title}
                              </p>
                              <p className="text-[10px] text-zinc-400 mt-1 truncate">
                                {msg.resource.url}
                              </p>
                            </a>

                            <p className="text-[10px] text-zinc-400 mt-1 px-1 text-right">
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
                          <img
                            src={
                              msg.sender.avatarUrl ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60'
                            }
                            alt={msg.sender.fullName}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-200"
                          />
                        )}

                        <div className={`max-w-[78%] ${isMe ? 'items-end' : 'items-start'}`}>
                          {!isMe && (
                            <div className="flex items-center space-x-1.5 mb-1 px-1">
                              <span className="text-[11px] font-semibold text-zinc-700">
                                {msg.sender.fullName}
                              </span>
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                {msg.sender.schoolName.split(' ')[0]}
                              </span>
                            </div>
                          )}

                          <div
                            className={`p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                              isMe
                                ? 'bg-emerald-600 text-white rounded-br-xs shadow-emerald-600/15'
                                : 'bg-zinc-100 text-zinc-900 rounded-bl-xs border border-zinc-200'
                            }`}
                          >
                            {msg.content}
                          </div>

                          <p className="text-[10px] text-zinc-400 mt-1 px-1 text-right">
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
                <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-xs text-red-700 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
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
                    className="p-3 border-t border-zinc-200 bg-emerald-50/50"
                  >
                    <form onSubmit={handleAttachResource} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-800 flex items-center space-x-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Share Past Paper / Markscheme Link</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsAttachOpen(false)}
                          className="text-zinc-400 hover:text-zinc-700 text-xs"
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
                        className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-emerald-500"
                      />

                      <div className="flex gap-2">
                        <select
                          value={resourceCategory}
                          onChange={(e) => setResourceCategory(e.target.value as ResourceCategory)}
                          className="w-1/3 px-2 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="past_paper">Past Paper</option>
                          <option value="markscheme">Markscheme</option>
                          <option value="notes">Notes</option>
                          <option value="rubric">IA Rubric</option>
                        </select>

                        <input
                          type="url"
                          value={resourceUrl}
                          onChange={(e) => setResourceUrl(e.target.value)}
                          placeholder="https://drive.google.com/..."
                          required
                          className="flex-1 px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        Attach Link to Chat
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Action Chips */}
              <div className="px-3 pt-2 pb-1 bg-white border-t border-zinc-100 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                {quickChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => sendMessageContent(chip)}
                    className="px-2.5 py-1 rounded-full bg-zinc-50 hover:bg-emerald-50 border border-zinc-200 hover:border-emerald-300 text-[11px] text-zinc-600 hover:text-emerald-800 whitespace-nowrap transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSend} className="p-3 bg-white border-t border-zinc-200">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAttachOpen(!isAttachOpen)}
                    title="Attach past paper or resource link"
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      isAttachOpen
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-emerald-600 hover:border-emerald-300'
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
                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white transition-all shadow-md shadow-emerald-600/15 active:scale-95 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
