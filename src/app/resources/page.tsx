'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthProvider';
import { Navbar } from '@/components/Navbar';
import { FeedbackModal } from '@/components/FeedbackModal';
import { WhyKantoPrepModal } from '@/components/WhyKantoPrepModal';
import { InviteModal } from '@/components/InviteModal';
import { EditProfileModal } from '@/components/EditProfileModal';
import { SchoolSwitchModal } from '@/components/SchoolSwitchModal';
import { InteractiveBackground } from '@/components/InteractiveBackground';
import { SubjectCard } from '@/components/resources/SubjectCard';
import { SuggestResourceModal } from '@/components/resources/SuggestResourceModal';
import { SYLLABUS_DATA } from '@/lib/resourceData';
import { Curriculum } from '@/types';
import { getBookmarkedSubjects, toggleSubjectBookmark } from '@/lib/bookmarks';
import { BookOpen, Search, Sparkles, GraduationCap, Plus, Star, Share2, MessageSquarePlus } from 'lucide-react';

type FilterType = Curriculum | 'ALL' | 'MY_SUBJECTS';

export default function ResourcesPage() {
  const { currentUser, updateUser, logout } = useAuth();
  const router = useRouter();

  // Bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    setBookmarkedIds(getBookmarkedSubjects());
    const handleSync = (e: Event) => {
      const custom = e as CustomEvent<string[]>;
      if (custom.detail) {
        setBookmarkedIds(custom.detail);
      } else {
        setBookmarkedIds(getBookmarkedSubjects());
      }
    };
    window.addEventListener('kantoprep:bookmarks-updated', handleSync);
    return () => window.removeEventListener('kantoprep:bookmarks-updated', handleSync);
  }, []);

  const handleToggleBookmark = (id: string) => {
    const { all } = toggleSubjectBookmark(id);
    setBookmarkedIds(all);
  };

  // Filters
  const [selectedCurriculum, setSelectedCurriculum] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isWhyOpen, setIsWhyOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSchoolSwitchOpen, setIsSchoolSwitchOpen] = useState(false);

  const curriculumTabs: { id: FilterType; label: string }[] = [
    { id: 'ALL', label: 'All Syllabi' },
    {
      id: 'MY_SUBJECTS',
      label: `⭐ My Subjects${bookmarkedIds.length > 0 ? ` (${bookmarkedIds.length})` : ''}`,
    },
    { id: 'IB', label: 'IB Diploma' },
    { id: 'AP', label: 'Advanced Placement' },
    { id: 'IGCSE', label: 'IGCSE' },
    { id: 'SAT_ACT', label: 'Digital SAT' },
  ];

  const filteredSubjects = useMemo(() => {
    return SYLLABUS_DATA.filter((syllabus) => {
      if (selectedCurriculum === 'MY_SUBJECTS') {
        if (!bookmarkedIds.includes(syllabus.id)) return false;
      } else if (selectedCurriculum !== 'ALL' && syllabus.curriculum !== selectedCurriculum) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSubject = syllabus.subject.toLowerCase().includes(q);
        const matchesCurriculum = syllabus.curriculum.toLowerCase().includes(q);
        if (!matchesSubject && !matchesCurriculum) return false;
      }
      return true;
    });
  }, [selectedCurriculum, searchQuery, bookmarkedIds]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7faf8] text-zinc-900 selection:bg-emerald-500/20 selection:text-emerald-900">
      <InteractiveBackground />

      <Navbar
        currentUser={currentUser}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onOpenWhyKantoPrep={() => setIsWhyOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        onOpenInvite={() => setIsInviteOpen(true)}
        onOpenSchoolSwitch={() => setIsSchoolSwitchOpen(true)}
        onSignOut={logout}
      />

      <main className="flex-1 pb-20 relative z-10">
        {/* Hero */}
        <section className="relative pt-8 pb-10 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
          <div className="max-w-4xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-white/90 border border-emerald-200/80 text-xs text-emerald-800 shadow-2xs mb-5"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium">YouTube Lessons • Past Papers • Study Links</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 leading-tight"
            >
              Prep{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 shimmer-text">
                Library
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-3 text-base sm:text-lg text-zinc-600 max-w-xl mx-auto font-normal leading-relaxed"
            >
              Curated resources organized by syllabus. Watch, practice, and study — all in one place.
            </motion.p>

            {/* Curriculum Selector Pills */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-7 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl glass-panel max-w-xl mx-auto"
            >
              {curriculumTabs.map((c) => {
                const isActive = selectedCurriculum === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCurriculum(c.id)}
                    className={`relative px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-emerald-50/50'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeResourcePill"
                        className="absolute inset-0 bg-emerald-600 rounded-xl"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10">{c.label}</span>
                  </button>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Search Bar & Suggest CTA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search subjects or syllabi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-zinc-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all outline-none shadow-sm"
              />
            </div>
            <button
              onClick={() => setIsSuggestModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-white border border-zinc-200 hover:border-emerald-300 text-zinc-700 hover:text-emerald-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs shrink-0"
              title="Suggest a YouTube video, past paper, or tool for the library"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Suggest Resource</span>
            </button>
          </div>
        </div>

        {/* Subject Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredSubjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 sm:py-20 p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 max-w-lg mx-auto shadow-sm relative overflow-hidden dotted-bg"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm"
              >
                {selectedCurriculum === 'MY_SUBJECTS' ? (
                  <Star className="w-8 h-8 text-amber-500 fill-amber-400" />
                ) : (
                  <BookOpen className="w-8 h-8 text-emerald-500" />
                )}
              </motion.div>
              <h3 className="text-base font-bold text-zinc-900">
                {selectedCurriculum === 'MY_SUBJECTS'
                  ? 'No bookmarked subjects yet'
                  : 'No subjects found'}
              </h3>
              <p className="text-xs text-zinc-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
                {selectedCurriculum === 'MY_SUBJECTS'
                  ? 'Click the star icon on any subject card to pin your enrolled courses here for quick access, just like Khan Academy!'
                  : 'Try selecting a different curriculum or clearing your search.'}
              </p>
              {selectedCurriculum === 'MY_SUBJECTS' && (
                <button
                  onClick={() => setSelectedCurriculum('ALL')}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer shadow-sm transition-all"
                >
                  Browse All Syllabi
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
            >
              {filteredSubjects.map((syllabus, i) => (
                <motion.div
                  key={syllabus.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <SubjectCard
                    syllabus={syllabus}
                    onClick={() => router.push(`/resources/${syllabus.id}`)}
                    isBookmarked={bookmarkedIds.includes(syllabus.id)}
                    onToggleBookmark={() => handleToggleBookmark(syllabus.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-zinc-500">
              {filteredSubjects.length} {filteredSubjects.length === 1 ? 'subject' : 'subjects'} available •{' '}
              {filteredSubjects.reduce((acc, s) => acc + s.topics.reduce((t, topic) => t + topic.youtubeResources.length, 0), 0)} videos •{' '}
              {filteredSubjects.reduce((acc, s) => acc + s.topics.reduce((t, topic) => t + topic.pastPapers.length, 0), 0)} past papers
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 bg-white/80 backdrop-blur-sm py-8 px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-zinc-800">KantoPrep</span>
            <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              Prep Library
            </span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-zinc-500">
            <button
              onClick={() => setIsInviteOpen(true)}
              className="inline-flex items-center space-x-1 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Invite / Flyer</span>
            </button>
            <span className="text-zinc-300">•</span>
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="inline-flex items-center space-x-1 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Feedback</span>
            </button>
            <span className="text-zinc-300">•</span>
            <span>100% Free • Zero Ads</span>
          </div>
        </div>
      </footer>

      {/* Shared Modals */}
      <SuggestResourceModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
        currentUser={currentUser}
        defaultCurriculum={
          selectedCurriculum === 'ALL' || selectedCurriculum === 'MY_SUBJECTS'
            ? 'IB'
            : selectedCurriculum
        }
      />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} currentUser={currentUser} />
      <WhyKantoPrepModal isOpen={isWhyOpen} onClose={() => setIsWhyOpen(false)} />
      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} currentUser={currentUser} />
      <EditProfileModal isOpen={isEditProfileOpen} currentUser={currentUser} onUpdateUser={updateUser} onClose={() => setIsEditProfileOpen(false)} />
      <SchoolSwitchModal isOpen={isSchoolSwitchOpen} onClose={() => setIsSchoolSwitchOpen(false)} currentUser={currentUser} onSelectUser={updateUser} />
    </div>
  );
}
