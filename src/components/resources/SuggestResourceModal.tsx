'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle2, Video, FileText, Link2, BookOpen } from 'lucide-react';
import { StudentProfile, Curriculum } from '@/types';
import { CURRICULUM_OPTIONS, SUBJECTS_BY_CURRICULUM } from '@/lib/constants';

interface SuggestResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StudentProfile | null;
  defaultCurriculum?: Curriculum;
  defaultSubject?: string;
}

export interface SuggestedResource {
  id: string;
  studentEmail?: string;
  studentName?: string;
  curriculum: Curriculum;
  subject: string;
  topic: string;
  type: 'youtube' | 'past_paper' | 'guide_link' | 'notes';
  title: string;
  url: string;
  note?: string;
  createdAt: string;
}

const SuggestResourceModalContent: React.FC<SuggestResourceModalProps> = ({
  onClose,
  currentUser,
  defaultCurriculum = 'IB',
  defaultSubject,
}) => {
  const [curriculum, setCurriculum] = useState<Curriculum>(defaultCurriculum);
  const [subject, setSubject] = useState<string>(
    defaultSubject || (SUBJECTS_BY_CURRICULUM[defaultCurriculum] ? SUBJECTS_BY_CURRICULUM[defaultCurriculum][0] : '')
  );
  const [topic, setTopic] = useState('');
  const [type, setType] = useState<'youtube' | 'past_paper' | 'guide_link' | 'notes'>('youtube');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleCurriculumChange = (c: Curriculum) => {
    setCurriculum(c);
    setSubject(SUBJECTS_BY_CURRICULUM[c][0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    const suggestion: SuggestedResource = {
      id: `sug_${Date.now()}`,
      studentEmail: currentUser?.email,
      studentName: currentUser?.fullName,
      curriculum,
      subject,
      topic: topic.trim() || 'General',
      type,
      title: title.trim(),
      url: url.trim(),
      note: note.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('kantoprep_suggested_resources') || '[]');
      localStorage.setItem('kantoprep_suggested_resources', JSON.stringify([suggestion, ...existing]));
    } catch {
      // Ignore
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTitle('');
      setUrl('');
      setTopic('');
      setNote('');
      onClose();
    }, 2200);
  };

  const resourceTypes: { id: 'youtube' | 'past_paper' | 'guide_link' | 'notes'; label: string; icon: React.ElementType }[] = [
    { id: 'youtube', label: 'YouTube Video', icon: Video },
    { id: 'past_paper', label: 'Past Paper / Question', icon: FileText },
    { id: 'guide_link', label: 'Study Guide / Tool', icon: Link2 },
    { id: 'notes', label: 'Student Notes', icon: BookOpen },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-xs"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-lg rounded-3xl bg-[#161513] p-6 shadow-2xl border border-[#F5B942]/20 z-10 overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-full text-[#A8A39D] hover:text-white hover:bg-[#1C1A17] transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center"
            >
              <div className="mx-auto w-14 h-14 rounded-full bg-[#F5B942]/15 flex items-center justify-center mb-4 text-[#F5B942]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Resource Submitted!</h3>
              <p className="text-xs text-[#A8A39D] mt-2 max-w-xs mx-auto">
                Thank you for contributing to the KantoPrep library. Our student curators will review and index it!
              </p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center space-x-2 text-[#F5B942] mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Community Contribution</span>
              </div>
              <h2 className="text-xl font-bold text-white">Suggest a Study Resource</h2>
              <p className="text-xs text-[#A8A39D] mt-1 mb-5">
                Know a great YouTube breakdown, past paper link, or question bank trick? Share it with peers across Tokyo.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Resource Type Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#EDEDEB] mb-1.5">Resource Format</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {resourceTypes.map((rt) => {
                      const Icon = rt.icon;
                      const isSelected = type === rt.id;
                      return (
                        <button
                          key={rt.id}
                          type="button"
                          onClick={() => setType(rt.id)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#F5B942]/15 border-[#F5B942]/60 text-[#F5B942] shadow-2xs font-semibold'
                              : 'bg-[#1C1A17] border-[#F5B942]/20 text-[#A8A39D] hover:border-[#F5B942]/40 hover:text-[#EDEDEB]'
                          }`}
                        >
                          <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-[#F5B942]' : 'text-[#7A756D]'}`} />
                          <span className="text-[11px] text-center">{rt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Curriculum & Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#EDEDEB] mb-1">Curriculum</label>
                    <select
                      value={curriculum}
                      onChange={(e) => handleCurriculumChange(e.target.value as Curriculum)}
                      className="w-full px-3 py-2 rounded-xl bg-[#1C1A17] border border-[#F5B942]/20 text-xs text-white focus:border-[#F5B942] focus:ring-2 focus:ring-[#F5B942]/20 outline-none"
                    >
                      {CURRICULUM_OPTIONS.map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#1C1A17] text-white">
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#EDEDEB] mb-1">Subject</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#1C1A17] border border-[#F5B942]/20 text-xs text-white focus:border-[#F5B942] focus:ring-2 focus:ring-[#F5B942]/20 outline-none truncate"
                    >
                      {(SUBJECTS_BY_CURRICULUM[curriculum] || []).map((s) => (
                        <option key={s} value={s} className="bg-[#1C1A17] text-white">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Topic / Chapter */}
                <div>
                  <label className="block text-xs font-semibold text-[#EDEDEB] mb-1">
                    Specific Syllabus Topic / Chapter <span className="text-[#7A756D] font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Integration by Parts, Desmos Sliders, Rotational Dynamics"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1C1A17] border border-[#F5B942]/20 text-xs text-white placeholder:text-[#7A756D] focus:border-[#F5B942] focus:ring-2 focus:ring-[#F5B942]/20 outline-none"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-[#EDEDEB] mb-1">Resource Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 10-Minute Guide to IB Math Vector Cross Products"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1C1A17] border border-[#F5B942]/20 text-xs text-white placeholder:text-[#7A756D] focus:border-[#F5B942] focus:ring-2 focus:ring-[#F5B942]/20 outline-none"
                  />
                </div>

                {/* URL */}
                <div>
                  <label className="block text-xs font-semibold text-[#EDEDEB] mb-1">Resource URL / Link</label>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or link to paper"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1C1A17] border border-[#F5B942]/20 text-xs text-white placeholder:text-[#7A756D] focus:border-[#F5B942] focus:ring-2 focus:ring-[#F5B942]/20 outline-none"
                  />
                </div>

                {/* Note */}
                <div>
                  <label className="block text-xs font-semibold text-[#EDEDEB] mb-1">
                    Why is this helpful? <span className="text-[#7A756D] font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. 'Best step-by-step breakdown for exam questions that came up in May 2023 TZ2!'"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#1C1A17] border border-[#F5B942]/20 text-xs text-white placeholder:text-[#7A756D] focus:border-[#F5B942] focus:ring-2 focus:ring-[#F5B942]/20 outline-none resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A8A39D] hover:text-white hover:bg-[#1C1A17] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#F5B942] hover:bg-[#E5A832] text-[#0E0D0B] text-xs font-bold shadow-md shadow-[#F5B942]/20 transition-all cursor-pointer active:scale-95"
                  >
                    Submit Suggestion
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export const SuggestResourceModal: React.FC<SuggestResourceModalProps> = (props) => {
  if (!props.isOpen) return null;
  return (
    <SuggestResourceModalContent
      key={`${props.defaultCurriculum}-${props.defaultSubject}`}
      {...props}
    />
  );
};
