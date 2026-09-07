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
import { SubjectSurveyModal } from '@/components/SubjectSurveyModal';
import { SchoolSwitchModal } from '@/components/SchoolSwitchModal';
import { InteractiveBackground } from '@/components/InteractiveBackground';
import { SubjectCard } from '@/components/resources/SubjectCard';
import { SuggestResourceModal } from '@/components/resources/SuggestResourceModal';
import { SYLLABUS_DATA } from '@/lib/resourceData';
import { Curriculum } from '@/types';
import { getBookmarkedSubjects, toggleSubjectBookmark } from '@/lib/bookmarks';
import { BookOpen, Search, Sparkles, GraduationCap, Plus, Star, Share2, MessageSquarePlus, Target } from 'lucide-react';

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
  const [isSubjectSurveyOpen, setIsSubjectSurveyOpen] = useState(false);
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
    const list = SYLLABUS_DATA.filter((syllabus) => {
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

    // Pin student's chosen/bookmarked subjects above everything else!
    return [...list].sort((a, b) => {
      const aBookmarked = bookmarkedIds.includes(a.id);
      const bBookmarked = bookmarkedIds.includes(b.id);
      if (aBookmarked && !bBookmarked) return -1;
      if (!aBookmarked && bBookmarked) return 1;
      return 0;
    });
  }, [selectedCurriculum, searchQuery, bookmarkedIds]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0E0D0B] text-white selection:bg-[#F5B942]/30 selection:text-white">
      <InteractiveBackground />

      <Navbar
        currentUser={currentUser}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onOpenWhyKantoPrep={() => setIsWhyOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        onOpenSubjectSurvey={() => setIsSubjectSurveyOpen(true)}
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
              className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-[#1C1A17] border border-[#F5B942]/30 text-xs text-[#F5B942] shadow-2xs mb-5"
            >
              <GraduationCap className="w-3.5 h-3.5 text-[#F5B942]" />
              <span className="font-semibold">YouTube Lessons • Past Papers • Study Links</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight"
            >
              Prep{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F5B942] via-amber-200 to-[#F5B942] shimmer-text">
                Library
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-3 text-base sm:text-lg text-[#A8A39D] max-w-xl mx-auto font-normal leading-relaxed"
            >
              Curated resources organized by syllabus. Watch, practice, and study — all in one place.
            </motion.p>

            {/* Curriculum Selector Pills */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-7 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-[#161513] border border-[#F5B942]/20 max-w-xl mx-auto shadow-lg"
            >
              {curriculumTabs.map((c) => {
                const isActive = selectedCurriculum === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCurriculum(c.id)}
                    className={`relative px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'text-[#0E0D0B] shadow-xs'
                        : 'text-[#A8A39D] hover:text-white hover:bg-[#1C1A17]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeResourcePill"
                        className="absolute inset-0 bg-[#F5B942] rounded-xl"
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A756D]" />
              <input
                type="text"
                placeholder="Search subjects or syllabi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#161513] border border-[#F5B942]/20 focus:border-[#F5B942] focus:ring-2 focus:ring-[#F5B942]/20 text-sm text-white placeholder:text-[#7A756D] transition-all outline-none shadow-sm"
              />
            </div>

            <button
              onClick={() => setIsSubjectSurveyOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-[#F5B942]/15 hover:bg-[#F5B942] text-[#F5B942] hover:text-[#0E0D0B] border border-[#F5B942]/30 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-sm shrink-0"
              title="Select which subjects are pinned to your profile"
            >
              <Target className="w-3.5 h-3.5" />
              <span>Customize Subjects</span>
            </button>
            <button
              onClick={() => setIsSuggestModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#161513] border border-[#F5B942]/20 hover:border-[#F5B942]/60 text-[#EDEDEB] hover:text-[#F5B942] text-xs font-semibold transition-all cursor-pointer shadow-2xs shrink-0"
              title="Suggest a YouTube video, past paper, or tool for the library"
            >
              <Plus className="w-3.5 h-3.5 text-[#F5B942]" />
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
              className="text-center py-16 sm:py-20 p-6 sm:p-8 rounded-3xl bg-[#161513] border border-[#F5B942]/20 max-w-lg mx-auto shadow-sm relative overflow-hidden dotted-bg"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-[#1C1A17] border border-[#F5B942]/30 flex items-center justify-center shadow-sm"
              >
                {selectedCurriculum === 'MY_SUBJECTS' ? (
                  <Star className="w-8 h-8 text-[#F5B942] fill-[#F5B942]" />
                ) : (
                  <BookOpen className="w-8 h-8 text-[#F5B942]" />
                )}
              </motion.div>
              <h3 className="text-base font-bold text-white">
                {selectedCurriculum === 'MY_SUBJECTS'
                  ? 'No bookmarked subjects yet'
                  : 'No subjects found'}
              </h3>
              <p className="text-xs text-[#A8A39D] mt-1.5 max-w-xs mx-auto leading-relaxed">
                {selectedCurriculum === 'MY_SUBJECTS'
                  ? 'Click the star icon on any subject card to pin your enrolled courses here for quick access, just like Khan Academy!'
                  : 'Try selecting a different curriculum or clearing your search.'}
              </p>
              {selectedCurriculum === 'MY_SUBJECTS' && (
                <button
                  onClick={() => setSelectedCurriculum('ALL')}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#F5B942] hover:bg-[#E5A832] text-[#0E0D0B] text-xs font-bold cursor-pointer shadow-md shadow-[#F5B942]/20 transition-all"
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
            <p className="text-xs text-[#7A756D]">
              {filteredSubjects.length} {filteredSubjects.length === 1 ? 'subject' : 'subjects'} available •{' '}
              {filteredSubjects.reduce((acc, s) => acc + s.topics.reduce((t, topic) => t + topic.youtubeResources.length, 0), 0)} videos •{' '}
              {filteredSubjects.reduce((acc, s) => acc + s.topics.reduce((t, topic) => t + topic.pastPapers.length, 0), 0)} past papers
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#F5B942]/15 bg-[#141310]/90 backdrop-blur-sm py-8 px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-white">KantoPrep</span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-[#F5B942]/10 text-[#F5B942] border border-[#F5B942]/30 rounded-full">
              Prep Library
            </span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-[#A8A39D]">
            <button
              onClick={() => setIsInviteOpen(true)}
              className="inline-flex items-center space-x-1 hover:text-[#F5B942] transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-[#F5B942]" />
              <span>Invite / Flyer</span>
            </button>
            <span className="text-[#7A756D]">•</span>
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="inline-flex items-center space-x-1 hover:text-[#F5B942] transition-colors cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-[#F5B942]" />
              <span>Feedback</span>
            </button>
            <span className="text-[#7A756D]">•</span>
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
      <SubjectSurveyModal isOpen={isSubjectSurveyOpen} currentUser={currentUser} onUpdateUser={updateUser} onClose={() => setIsSubjectSurveyOpen(false)} />
      <SchoolSwitchModal isOpen={isSchoolSwitchOpen} onClose={() => setIsSchoolSwitchOpen(false)} currentUser={currentUser} onSelectUser={updateUser} />
    </div>
  );
}
