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
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookletOpen, setIsBookletOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  useEffect(() => {
    if (subjectId) {
      setIsBookmarked(isSubjectBookmarked(subjectId));
    }
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
      <div className="min-h-screen flex flex-col bg-[#f7faf8] text-zinc-900">
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
            className="text-center p-8 rounded-3xl bg-white border border-zinc-200 max-w-md shadow-sm dotted-bg"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm"
            >
              <BookOpen className="w-8 h-8 text-emerald-500" />
            </motion.div>
            <h3 className="text-base font-bold text-zinc-900">Subject not found</h3>
            <p className="text-xs text-zinc-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
              This subject might not exist yet. Head back to browse available subjects.
            </p>
            <button
              onClick={() => router.push('/resources')}
              className="mt-5 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/15 active:scale-95 cursor-pointer"
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
        {/* Subject Header */}
        <section className="relative pt-6 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => router.push('/resources')}
              className="flex items-center space-x-1.5 text-sm text-zinc-500 hover:text-emerald-700 transition-colors mb-5 cursor-pointer"
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
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  {curriculumLabel[syllabus.curriculum] || syllabus.curriculum}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900">
                  {syllabus.subject}
                </h1>

                {/* Pin Subject Button */}
                <button
                  type="button"
                  onClick={handleToggleBookmark}
                  className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                    isBookmarked
                      ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:border-amber-300 hover:bg-zinc-50'
                  }`}
                  title={isBookmarked ? 'Remove from My Subjects' : 'Pin to My Subjects'}
                >
                  <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-500' : 'text-zinc-400'}`} />
                  <span>{isBookmarked ? 'Bookmarked' : 'Pin Subject'}</span>
                </button>
              </div>
            </motion.div>

            {/* Stats & Tools Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-4 flex flex-wrap items-center gap-2.5 text-xs text-zinc-600"
            >
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium">{stats.topics} Topics</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 shadow-2xs">
                <Video className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium">{stats.videos} Videos</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 shadow-2xs">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium">{stats.papers} Past Papers</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200 shadow-2xs">
                <Link2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium">{stats.links} Links</span>
              </div>

              {/* Formula Booklet Launcher (if applicable) */}
              {syllabus.formulaBooklet && (
                <button
                  type="button"
                  onClick={() => setIsBookletOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:border-blue-300"
                  title="Open official formula booklet"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                  <span>Formula Booklet</span>
                </button>
              )}

              {/* TI-84 Calculator Launcher (if applicable) */}
              {syllabus.hasCalculator && (
                <button
                  type="button"
                  onClick={() => setIsCalculatorOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:border-emerald-300"
                  title="Open TI-84 Plus Online Calculator Simulator"
                >
                  <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                  <span>TI-84 Calculator</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsSuggestModalOpen(true)}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs ml-auto"
                title="Suggest a resource for this subject"
              >
                <Plus className="w-3.5 h-3.5 text-zinc-500" />
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
              className="max-w-3xl mx-auto p-8 sm:p-10 rounded-3xl bg-white border border-emerald-200/90 shadow-sm text-center relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-sm">
                <GraduationCap className="w-8 h-8" />
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-3">
                Official College Board Partner
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                Digital SAT® Prep on Khan Academy
              </h2>
              <p className="mt-3 text-sm text-zinc-600 max-w-lg mx-auto leading-relaxed">
                Khan Academy provides the official, 100% free digital SAT preparation built in direct collaboration with College Board. Includes diagnostic tests, personalized skill trees, video explanations, and official practice questions.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="https://www.khanacademy.org/test-prep/v2-sat-prep"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-md shadow-emerald-600/15 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Open Khan Academy Official SAT Prep</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href="https://bluebook.collegeboard.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-sm font-semibold transition-all cursor-pointer"
                >
                  <span>College Board Bluebook App</span>
                  <ExternalLink className="w-4 h-4 text-zinc-500" />
                </a>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left">
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100">
                  <p className="text-xs font-bold text-zinc-900">Diagnostic Quizzes</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Identifies your exact weak areas in Math and Reading & Writing.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100">
                  <p className="text-xs font-bold text-zinc-900">Adaptive Practice</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Thousands of official College Board questions leveled from Foundation to Advanced.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-100">
                  <p className="text-xs font-bold text-zinc-900">Full Tests on Bluebook</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Pair your Khan Academy review with full timed adaptive tests on the Bluebook app.</p>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          /* Topic Sections */
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            {hasHlTopics && (
              <div className="flex items-center space-x-2 py-2 border-b border-zinc-200 mb-2">
                <span className="text-xs font-semibold text-zinc-500">Curriculum Scope:</span>
                <button
                  onClick={() => setHlFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    hlFilter === 'ALL'
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  All Topics ({syllabus.topics.length})
                </button>
                <button
                  onClick={() => setHlFilter('HL_ONLY')}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    hlFilter === 'HL_ONLY'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <span>⚡ HL Only Section</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    hlFilter === 'HL_ONLY' ? 'bg-amber-600 text-white' : 'bg-amber-200/80 text-amber-900'
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
          <div className="text-center py-10 px-6 rounded-3xl bg-white border border-emerald-200 shadow-sm relative overflow-hidden dotted-bg">
            <h3 className="text-lg font-bold text-zinc-900">Ready to study {syllabus.subject}?</h3>
            <p className="text-sm text-zinc-500 mt-1.5 max-w-md mx-auto leading-relaxed">
              Find peers preparing for the same topics. Create or join a study pod and tackle it together.
            </p>
            <button
              onClick={handleStudyGeneral}
              className="mt-5 inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md shadow-emerald-600/15 active:scale-95 cursor-pointer cta-glow transition-all"
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
