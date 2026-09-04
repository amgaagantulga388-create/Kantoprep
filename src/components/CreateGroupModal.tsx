'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Sparkles, AlertTriangle, ExternalLink, ShieldCheck, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Curriculum, SessionFormat, VenueType, StudyGroup, StudentProfile } from '@/types';
import { CURRICULUM_OPTIONS, SUBJECTS_BY_CURRICULUM, FORMAT_CONFIG, VENUE_CONFIG, getGoogleMapsUrl } from '@/lib/constants';
import { inspectContentSafety, rateLimiter } from '@/lib/safety';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StudentProfile;
  onCreateGroup: (newGroup: StudyGroup) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCreateGroup,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [curriculum, setCurriculum] = useState<Curriculum>(currentUser.curriculum || 'IB');
  const [subject, setSubject] = useState<string>(SUBJECTS_BY_CURRICULUM[currentUser.curriculum || 'IB'][0]);
  const [format, setFormat] = useState<SessionFormat>('past_paper_sprint');
  const [venueType, setVenueType] = useState<VenueType>('hikarigaoka_library');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [meetingTime, setMeetingTime] = useState('Tomorrow, 4:30 PM');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [maxMembers, setMaxMembers] = useState(5);
  const [tagsInput, setTagsInput] = useState('Paper 1, Exam Prep');
  const [safetyError, setSafetyError] = useState<string | null>(null);
  const [hasAgreedToPledge, setHasAgreedToPledge] = useState(false);

  if (!isOpen) return null;

  const handleCurriculumChange = (c: Curriculum) => {
    setCurriculum(c);
    setSubject(SUBJECTS_BY_CURRICULUM[c][0]);
  };

  const handleProceedToCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const rateCheck = rateLimiter.isRateLimited(`host_${currentUser.id}`, 20000);
    if (rateCheck.limited) {
      setSafetyError(`Rate limit: Please wait ${rateCheck.waitSeconds}s before creating another group.`);
      return;
    }

    const titleCheck = inspectContentSafety(title);
    const descCheck = inspectContentSafety(description);

    if (titleCheck.severity === 'blocked') {
      setSafetyError(titleCheck.message || 'Title flagged for safety review.');
      return;
    }
    if (descCheck.severity === 'blocked') {
      setSafetyError(descCheck.message || 'Description flagged for safety review.');
      return;
    }

    setSafetyError(null);
    setStep(4);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAgreedToPledge) return;

    const titleCheck = inspectContentSafety(title);
    const descCheck = inspectContentSafety(description);

    const newGroup: StudyGroup = {
      id: `grp_${Date.now()}`,
      title: titleCheck.sanitizedText,
      description: descCheck.sanitizedText || 'Collaborative syllabus study session.',
      curriculum,
      subject,
      format,
      venueType,
      venueLabel: VENUE_CONFIG[venueType].label,
      meetingTime,
      durationMinutes,
      maxMembers,
      host: currentUser,
      members: [currentUser],
      status: 'open',
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };

    onCreateGroup(newGroup);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#14b8a6', '#059669'],
    });

    onClose();
    setStep(1);
    setTitle('');
    setDescription('');
    setHasAgreedToPledge(false);
  };

  const venueInfo = VENUE_CONFIG[venueType];
  const mapsUrl = getGoogleMapsUrl(venueInfo.label, venueInfo.address);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-zinc-200 z-10 overflow-hidden"
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-200">
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-600">
              Step {step} of 4
            </span>
            <h2 className="text-lg font-bold text-zinc-900">
              {step === 1 && 'Select Syllabus & Subject'}
              {step === 2 && 'Format & Safe Study Hub'}
              {step === 3 && 'Session Details & Time'}
              {step === 4 && 'Host Responsibility Commitment'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {safetyError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{safetyError}</span>
          </div>
        )}

        <form onSubmit={step === 4 ? handleFinalSubmit : step === 3 ? handleProceedToCommitment : (e) => e.preventDefault()}>
          {/* STEP 1: CURRICULUM & SUBJECT */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-2">
                  Curriculum Program
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CURRICULUM_OPTIONS.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => handleCurriculumChange(c.id)}
                      className={`p-3 text-left rounded-2xl border text-xs transition-all cursor-pointer ${
                        curriculum === c.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold shadow-xs'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300'
                      }`}
                    >
                      <span className="font-bold block text-zinc-900">{c.label}</span>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">{c.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Specific Subject Module
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-emerald-500"
                >
                  {SUBJECTS_BY_CURRICULUM[curriculum].map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  <span>Next: Format &amp; Study Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: FORMAT & VENUE (WITH GOOGLE MAPS DIRECT LINK) */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-2">
                  Session Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(FORMAT_CONFIG) as SessionFormat[]).map((f) => {
                    const cfg = FORMAT_CONFIG[f];
                    return (
                      <button
                        type="button"
                        key={f}
                        onClick={() => setFormat(f)}
                        className={`p-2.5 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                          format === f
                            ? 'bg-emerald-50 border-emerald-500 text-zinc-900 font-semibold'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300'
                        }`}
                      >
                        <p className="font-semibold text-zinc-900">{cfg.label}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1">
                          {cfg.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-700">
                    Pre-Approved Safe Study Venue
                  </label>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-[11px] text-emerald-700 hover:underline font-medium"
                    title="Open library in Google Maps"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <select
                  value={venueType}
                  onChange={(e) => setVenueType(e.target.value as VenueType)}
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-emerald-500"
                >
                  {(Object.keys(VENUE_CONFIG) as VenueType[]).map((v) => (
                    <option key={v} value={v}>
                      {VENUE_CONFIG[v].label} ({VENUE_CONFIG[v].isPhysical ? 'In-Person' : 'Virtual'})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-zinc-500 mt-1.5 pl-1">
                  📍 {venueInfo.address}
                </p>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-semibold hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all active:scale-95 shadow-sm cursor-pointer"
                >
                  <span>Next: Details &amp; Time</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: SESSION DETAILS & TIME */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Session Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (safetyError) setSafetyError(null);
                  }}
                  placeholder="e.g., May 2024 Math AA HL Paper 1 Full Sprint"
                  required
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    placeholder="e.g., Friday, 4:30 PM"
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Max Student Slots
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={8}
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(Number(e.target.value))}
                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Goal &amp; Agenda Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (safetyError) setSafetyError(null);
                  }}
                  placeholder="State what materials to bring (past paper year, rubric draft, calculator)..."
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-semibold hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
                >
                  <span>Review Host Commitment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: HOST RESPONSIBILITY PLEDGE */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs space-y-1.5">
                <div className="font-bold text-zinc-900 text-sm truncate">{title}</div>
                <div className="text-emerald-800 font-semibold">{subject} • {curriculum}</div>
                <div className="text-zinc-600">⏰ {meetingTime} ({durationMinutes} mins)</div>
                <div className="flex items-center justify-between text-zinc-600 pt-1 border-t border-zinc-200">
                  <span>📍 {venueInfo.label}</span>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-emerald-700 hover:underline"
                  >
                    <span>Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Responsibility Commitment */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-zinc-700 space-y-2.5">
                <div className="flex items-center space-x-1.5 text-emerald-900 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Host Commitment &amp; Responsibility</span>
                </div>
                <p className="leading-relaxed text-zinc-600">
                  As the session host, other students are setting aside their time and traveling to meet you. 
                  <strong> Please assure that you will be present and not abandon this study pod.</strong>
                </p>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  If an emergency arises and you cannot attend, you agree to notify the group in the chat as soon as possible so peers are not left waiting.
                </p>

                <label className="flex items-start space-x-2.5 pt-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasAgreedToPledge}
                    onChange={(e) => setHasAgreedToPledge(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="font-semibold text-zinc-900 text-xs">
                    I commit to arriving on time, leading responsibly, and not abandoning my pod.
                  </span>
                </label>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-semibold hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={!hasAgreedToPledge}
                  className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Study Pod</span>
                </button>
              </div>
            </motion.div>
          )}
        </form>
      </motion.div>
    </div>
  );
};
