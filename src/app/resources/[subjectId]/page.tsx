'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthProvider';
import { Navbar } from '@/components/Navbar';
import { FeedbackModal } from '@/components/FeedbackModal';
import { WhyKantoPrepModal } from '@/components/WhyKantoPrepModal';
import { InviteModal } from '@/components/InviteModal';
import { EditProfileModal } from '@/components/EditProfileModal';
import { SchoolSwitchModal } from '@/components/SchoolSwitchModal';
import { InteractiveBackground } from '@/components/InteractiveBackground';
import { TopicSection } from '@/components/resources/TopicSection';
import { SuggestResourceModal } from '@/components/resources/SuggestResourceModal';
import { FormulaBookletDrawer } from '@/components/resources/FormulaBookletDrawer';
import { CalculatorDrawer } from '@/components/resources/CalculatorDrawer';
import { SYLLABUS_DATA } from '@/lib/resourceData';
import { isSubjectBookmarked, toggleSubjectBookmark } from '@/lib/bookmarks';
import { ArrowLeft, BookOpen, Video, FileText, Link2, Sparkles, Plus, Star, FileSpreadsheet, Calculator, GraduationCap, ExternalLink } from 'lucide-react';

export default function SubjectDetailPage() {
  const { currentUser, updateUser, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as string;

  // Bookmarks & Academic Tools Modals
  const [isBookmarked, setIsBookmarked] = useState(() => (subjectId ? isSubjectBookmarked(subjectId) : false));
  const [isBookletOpen, setIsBookletOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  useEffect(() => {
    const handleSync = () => {
      if (subjectId) setIsBookmarked(isSubjectBookmarked(subjectId));
    };
    window.addEventListener('kantoprep:bookmarks-updated', handleSync);
    return () => window.removeEventListener('kantoprep:bookmarks-updated', handleSync);
  }, [subjectId]);

  const handleToggleBookmark = () => {
    if (!subjectId) return;
    const { bookmarked } = toggleSubjectBookmark(subjectId);
    setIsBookmarked(bookmarked);
  };

  // Modals
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isWhyOpen, setIsWhyOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSchoolSwitchOpen, setIsSchoolSwitchOpen] = useState(false);

  // HL Filter for IB Syllabi
  const [hlFilter, setHlFilter] = useState<'ALL' | 'HL_ONLY'>('ALL');

  const syllabus = useMemo(() => {
    return SYLLABUS_DATA.find((s) => s.id === subjectId);
  }, [subjectId]);

  const hasHlTopics = useMemo(() => {
    return Boolean(syllabus?.topics.some((t) => t.isHlOnly));
  }, [syllabus]);

  const displayedTopics = useMemo(() => {
    if (!syllabus) return [];
    if (hlFilter === 'HL_ONLY') {
      return syllabus.topics.filter((t) => t.isHlOnly);
    }
    return syllabus.topics;
  }, [syllabus, hlFilter]);

  // Resource counts
  const stats = useMemo(() => {
    if (!syllabus) return { videos: 0, papers: 0, links: 0, topics: 0 };
    return {
      topics: syllabus.topics.length,
      videos: syllabus.topics.reduce((acc, t) => acc + t.youtubeResources.length, 0),
      papers: syllabus.topics.reduce((acc, t) => acc + t.pastPapers.length, 0),
      links: syllabus.topics.reduce((acc, t) => acc + t.externalResources.length, 0),
    };
  }, [syllabus]);

  const curriculumLabel: Record<string, string> = {
    IB: 'IB Diploma',
    AP: 'Advanced Placement',
    IGCSE: 'IGCSE',
    SAT_ACT: 'Digital SAT',
  };

  if (!syllabus) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0E0D0B] text-white selection:bg-[#F5B942]/20 selection:text-[#F5B942]">
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
        <main className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-8 rounded-3xl bg-[#161513] border border-[#F5B942]/20 max-w-md shadow-sm"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-[#F5B942]/10 border border-[#F5B942]/20 flex items-center justify-center shadow-sm"
            >
              <BookOpen className="w-8 h-8 text-[#F5B942]" />
            </motion.div>
            <h3 className="text-base font-bold text-white">Subject not found</h3>
            <p className="text-xs text-[#A8A39D] mt-1.5 max-w-xs mx-auto leading-relaxed">
              This subject might not exist yet. Head back to browse available subjects.
            </p>
            <button
              onClick={() => router.push('/resources')}
              className="mt-5 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#F5B942] hover:bg-[#E5A832] text-[#0E0D0B] text-xs font-bold shadow-md shadow-[#F5B942]/20 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Library</span>
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  const handleStudyTopic = (topicName: string) => {
    const query = new URLSearchParams({
      create: 'true',
      curriculum: syllabus.curriculum,
      subject: syllabus.subject,
      topic: topicName,
    });
    router.push(`/?${query.toString()}`);
  };

  const handleStudyGeneral = () => {
    const query = new URLSearchParams({
      create: 'true',
      curriculum: syllabus.curriculum,
      subject: syllabus.subject,
    });
    router.push(`/?${query.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0E0D0B] text-white selection:bg-[#F5B942]/20 selection:text-[#F5B942]">
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
        {/* Subject Header */}
        <section className="relative pt-6 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => router.push('/resources')}
              className="flex items-center space-x-1.5 text-sm text-[#A8A39D] hover:text-[#F5B942] transition-colors mb-5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Prep Library</span>
            </motion.button>

            {/* Subject Title */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#F5B942]/10 text-[#F5B942] border border-[#F5B942]/30 rounded-full">
                  {curriculumLabel[syllabus.curriculum] || syllabus.curriculum}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                  {syllabus.subject}
                </h1>

                {/* Pin Subject Button */}
                <button
                  type="button"
                  onClick={handleToggleBookmark}
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                    isBookmarked
                      ? 'bg-[#F5B942]/20 text-[#F5B942] border-[#F5B942]/60 hover:bg-[#F5B942]/30'
                      : 'bg-[#1C1A17] text-[#EDEDEB] border-[#F5B942]/20 hover:border-[#F5B942]/50 hover:text-[#F5B942]'
                  }`}
                  title={isBookmarked ? 'Remove from My Subjects' : 'Pin to My Subjects'}
                >
                  <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#F5B942] text-[#F5B942]' : 'text-[#7A756D]'}`} />
                  <span>{isBookmarked ? 'Bookmarked' : 'Pin Subject'}</span>
                </button>
              </div>
            </motion.div>

            {/* Stats & Tools Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-4 flex flex-wrap items-center gap-2.5 text-xs text-[#EDEDEB]"
            >
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#161513] border border-[#F5B942]/15 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#F5B942]" />
                <span className="font-medium">{stats.topics} Topics</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#161513] border border-[#F5B942]/15 shadow-2xs">
                <Video className="w-3.5 h-3.5 text-[#F5B942]" />
                <span className="font-medium">{stats.videos} Videos</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#161513] border border-[#F5B942]/15 shadow-2xs">
                <FileText className="w-3.5 h-3.5 text-[#F5B942]" />
                <span className="font-medium">{stats.papers} Past Papers</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#161513] border border-[#F5B942]/15 shadow-2xs">
                <Link2 className="w-3.5 h-3.5 text-[#F5B942]" />
                <span className="font-medium">{stats.links} Links</span>
              </div>

              {/* Formula Booklet Launcher (if applicable) */}
              {syllabus.formulaBooklet && (
                <button
                  type="button"
                  onClick={() => setIsBookletOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#1C1A17] hover:bg-[#F5B942]/10 text-[#EDEDEB] hover:text-[#F5B942] border border-[#F5B942]/25 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:border-[#F5B942]/40"
                  title="Open official formula booklet"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#F5B942]" />
                  <span>Formula Booklet</span>
                </button>
              )}

              {/* TI-84 Calculator Launcher (if applicable) */}
              {syllabus.hasCalculator && (
                <button
                  type="button"
                  onClick={() => setIsCalculatorOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#1C1A17] hover:bg-[#F5B942]/10 text-[#EDEDEB] hover:text-[#F5B942] border border-[#F5B942]/25 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:border-[#F5B942]/40"
                  title="Open TI-84 Plus Online Calculator Simulator"
                >
                  <Calculator className="w-3.5 h-3.5 text-[#F5B942]" />
                  <span>TI-84 Calculator</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsSuggestModalOpen(true)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#1C1A17] hover:bg-[#25221E] text-[#EDEDEB] hover:text-[#F5B942] border border-[#F5B942]/20 text-xs font-semibold transition-all cursor-pointer shadow-2xs ml-auto"
                title="Suggest a resource for this subject"
              >
                <Plus className="w-3.5 h-3.5 text-[#A8A39D]" />
                <span>Suggest Resource</span>
              </button>
            </motion.div>
          </div>
        </section>

        {/* Content Section: Dedicated Khan Academy Portal for SAT, or Topic List for others */}
        {syllabus.curriculum === 'SAT_ACT' ? (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto p-8 sm:p-10 rounded-3xl bg-[#161513] border border-[#F5B942]/20 shadow-sm text-center relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#F5B942]/10 border border-[#F5B942]/20 flex items-center justify-center mx-auto mb-4 text-[#F5B942] shadow-sm">
                <GraduationCap className="w-8 h-8" />
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#F5B942]/10 text-[#F5B942] border border-[#F5B942]/30 mb-3">
                Official College Board Partner
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Digital SAT® Prep on Khan Academy
              </h2>
              <p className="mt-3 text-sm text-[#A8A39D] max-w-lg mx-auto leading-relaxed">
                Khan Academy provides the official, 100% free digital SAT preparation built in direct collaboration with College Board. Includes diagnostic tests, personalized skill trees, video explanations, and official practice questions.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="https://www.khanacademy.org/test-prep/v2-sat-prep"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-[#F5B942] hover:bg-[#E5A832] text-[#0E0D0B] text-sm font-bold shadow-md shadow-[#F5B942]/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Open Khan Academy Official SAT Prep</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href="https://bluebook.collegeboard.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-[#1C1A17] hover:bg-[#25221E] text-white border border-[#F5B942]/20 text-sm font-semibold transition-all cursor-pointer"
                >
                  <span>College Board Bluebook App</span>
                  <ExternalLink className="w-4 h-4 text-[#A8A39D]" />
                </a>
              </div>

              <div className="mt-8 pt-6 border-t border-[#F5B942]/15 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left">
                <div className="p-3.5 rounded-xl bg-[#1C1A17] border border-[#F5B942]/15">
                  <p className="text-xs font-bold text-white">Diagnostic Quizzes</p>
                  <p className="text-[11px] text-[#A8A39D] mt-0.5">Identifies your exact weak areas in Math and Reading & Writing.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#1C1A17] border border-[#F5B942]/15">
                  <p className="text-xs font-bold text-white">Adaptive Practice</p>
                  <p className="text-[11px] text-[#A8A39D] mt-0.5">Thousands of official College Board questions leveled from Foundation to Advanced.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#1C1A17] border border-[#F5B942]/15">
                  <p className="text-xs font-bold text-white">Full Tests on Bluebook</p>
                  <p className="text-[11px] text-[#A8A39D] mt-0.5">Pair your Khan Academy review with full timed adaptive tests on the Bluebook app.</p>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          /* Topic Sections */
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            {hasHlTopics && (
              <div className="flex items-center space-x-2 py-2 border-b border-[#F5B942]/15 mb-2">
                <span className="text-xs font-semibold text-[#A8A39D]">Curriculum Scope:</span>
                <button
                  onClick={() => setHlFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    hlFilter === 'ALL'
                      ? 'bg-[#F5B942] text-[#0E0D0B] font-bold shadow-xs'
                      : 'bg-[#1C1A17] text-[#A8A39D] hover:text-white border border-[#F5B942]/15'
                  }`}
                >
                  All Topics ({syllabus.topics.length})
                </button>
                <button
                  onClick={() => setHlFilter('HL_ONLY')}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    hlFilter === 'HL_ONLY'
                      ? 'bg-[#F5B942] text-[#0E0D0B] font-bold shadow-xs'
                      : 'bg-[#1C1A17] text-[#EDEDEB] border border-[#F5B942]/25 hover:bg-[#F5B942]/10'
                  }`}
                >
                  <span>⚡ HL Only Section</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    hlFilter === 'HL_ONLY' ? 'bg-[#0E0D0B] text-[#F5B942]' : 'bg-[#F5B942]/20 text-[#F5B942]'
                  }`}>
                    {syllabus.topics.filter((t) => t.isHlOnly).length}
                  </span>
                </button>
              </div>
            )}

            {displayedTopics.map((topic, i) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
              >
                <TopicSection
                  topic={topic}
                  defaultOpen={i === 0}
                  onStudyTopic={handleStudyTopic}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Study Pod CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10"
        >
          <div className="text-center py-10 px-6 rounded-3xl bg-[#161513] border border-[#F5B942]/20 shadow-sm relative overflow-hidden">
            <h3 className="text-lg font-bold text-white">Ready to study {syllabus.subject}?</h3>
            <p className="text-sm text-[#A8A39D] mt-1.5 max-w-md mx-auto leading-relaxed">
              Find peers preparing for the same topics. Create or join a study pod and tackle it together.
            </p>
            <button
              onClick={handleStudyGeneral}
              className="mt-5 inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#F5B942] hover:bg-[#E5A832] text-[#0E0D0B] text-sm font-bold shadow-md shadow-[#F5B942]/20 active:scale-95 cursor-pointer cta-glow transition-all"
            >
              <span>Host a Study Pod for This Subject →</span>
            </button>
          </div>
        </motion.div>
      </main>

      {/* Modals */}
      <SuggestResourceModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
        currentUser={currentUser}
        defaultCurriculum={syllabus.curriculum}
        defaultSubject={syllabus.subject}
      />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} currentUser={currentUser} />
      <WhyKantoPrepModal isOpen={isWhyOpen} onClose={() => setIsWhyOpen(false)} />
      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} currentUser={currentUser} />
      <EditProfileModal isOpen={isEditProfileOpen} currentUser={currentUser} onUpdateUser={updateUser} onClose={() => setIsEditProfileOpen(false)} />
      <SchoolSwitchModal isOpen={isSchoolSwitchOpen} onClose={() => setIsSchoolSwitchOpen(false)} currentUser={currentUser} onSelectUser={updateUser} />

      {/* Formula Booklet Drawer */}
      {syllabus.formulaBooklet && (
        <FormulaBookletDrawer
          isOpen={isBookletOpen}
          onClose={() => setIsBookletOpen(false)}
          subjectName={syllabus.subject}
          booklet={syllabus.formulaBooklet}
        />
      )}

      {/* TI-84 Online Calculator Drawer */}
      {syllabus.hasCalculator && (
        <CalculatorDrawer
          isOpen={isCalculatorOpen}
          onClose={() => setIsCalculatorOpen(false)}
        />
      )}
    </div>
  );
}
