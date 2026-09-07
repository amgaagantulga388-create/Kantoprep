'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthProvider';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { ExamRadar } from '@/components/ExamRadar';
import { FilterBar } from '@/components/FilterBar';
import { GroupCard } from '@/components/GroupCard';
import { GroupChatDrawer } from '@/components/GroupChatDrawer';
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { SafetyReportModal } from '@/components/SafetyReportModal';
import { SchoolSwitchModal } from '@/components/SchoolSwitchModal';
import { FeedbackModal } from '@/components/FeedbackModal';
import { WhyKantoPrepModal } from '@/components/WhyKantoPrepModal';
import { JoinGroupModal } from '@/components/JoinGroupModal';
import { EditProfileModal } from '@/components/EditProfileModal';
import { SubjectSurveyModal } from '@/components/SubjectSurveyModal';
import { InviteModal } from '@/components/InviteModal';
import { InteractiveBackground } from '@/components/InteractiveBackground';
import { CalendarPromptModal } from '@/components/CalendarPromptModal';
import { AddToHomeScreenBanner } from '@/components/AddToHomeScreenBanner';
import { notifyPodMembersOfChat } from '@/lib/notifications';
import {
  Curriculum,
  SessionFormat,
  StudyGroup,
  StudentProfile,
  ChatMessage,
  ResourceMetadata,
  MessageType,
} from '@/types';
import { INITIAL_GROUPS, INITIAL_CHAT_MESSAGES } from '@/lib/mockData';
import { Plus, BookOpen, MessageSquarePlus, Share2, Target, Sparkles } from 'lucide-react';
import { sanitizeInput } from '@/lib/safety';

export default function Home() {
  // Auth from shared context (gate screen handled by AuthProvider in layout)
  const { currentUser, updateUser: authUpdateUser, logout } = useAuth();

  // App Data State
  const [groups, setGroups] = useState<StudyGroup[]>(INITIAL_GROUPS);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_CHAT_MESSAGES);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Filter States
  const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum | 'ALL'>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<SessionFormat | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMyPodsOnly, setIsMyPodsOnly] = useState(false);

  // Active Modals & Drawers
  const [activeChatGroup, setActiveChatGroup] = useState<StudyGroup | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSchoolSwitchOpen, setIsSchoolSwitchOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSubjectSurveyOpen, setIsSubjectSurveyOpen] = useState(false);
  const [pendingJoinGroup, setPendingJoinGroup] = useState<StudyGroup | null>(null);
  const [reportingGroup, setReportingGroup] = useState<StudyGroup | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [calendarPromptState, setCalendarPromptState] = useState<{ group: StudyGroup; isHost: boolean } | null>(null);
  const [prefillData, setPrefillData] = useState<{
    curriculum?: Curriculum;
    subject?: string;
    title?: string;
    tags?: string;
  }>({});

  // Restore groups and chat history from localStorage on initial load
  useEffect(() => {
    try {
      const savedGroups = localStorage.getItem('kantoprep_groups');
      if (savedGroups) {
        const parsedGroups = JSON.parse(savedGroups);
        if (Array.isArray(parsedGroups) && parsedGroups.length > 0) {
          setGroups(parsedGroups);
        }
      }

      const savedChats = localStorage.getItem('kantoprep_chats');
      if (savedChats) {
        const parsedChats = JSON.parse(savedChats);
        if (parsedChats && typeof parsedChats === 'object') {
          setChatMessages((prev) => ({ ...prev, ...parsedChats }));
        }
      }
    } catch {
      // Ignore
    } finally {
      setIsDataLoaded(true);
    }
  }, []);

  // Persist study groups across reloads
  useEffect(() => {
    if (isDataLoaded) {
      try {
        localStorage.setItem('kantoprep_groups', JSON.stringify(groups));
      } catch {
        // Ignore
      }
    }
  }, [groups, isDataLoaded]);

  // Persist chat messages across reloads
  useEffect(() => {
    if (isDataLoaded) {
      try {
        localStorage.setItem('kantoprep_chats', JSON.stringify(chatMessages));
      } catch {
        // Ignore
      }
    }
  }, [chatMessages, isDataLoaded]);

  const deepLinkProcessedRef = useRef(false);

  // Deep link support (?pod=...) runs once after data load
  useEffect(() => {
    if (typeof window === 'undefined' || deepLinkProcessedRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const podId = params.get('pod');
    if (!podId) return;

    const matched = groups.find((g) => g.id === podId);
    if (matched) {
      deepLinkProcessedRef.current = true;
      const isMember = matched.members.some((m) => m.id === currentUser.id);
      if (isMember) {
        setActiveChatGroup(matched);
      } else {
        setPendingJoinGroup(matched);
      }
      return;
    }

    // Handle deep link from Prep Library: ?create=true&curriculum=...&subject=...&topic=...
    const create = params.get('create');
    const curriculumParam = params.get('curriculum') as Curriculum | null;
    const subjectParam = params.get('subject');
    const topicParam = params.get('topic');

    if (create === 'true') {
      deepLinkProcessedRef.current = true;
      if (curriculumParam) setSelectedCurriculum(curriculumParam);
      if (subjectParam) setSearchQuery(subjectParam);
      setPrefillData({
        curriculum: curriculumParam || undefined,
        subject: subjectParam || undefined,
        title: topicParam ? `${topicParam} Sprint` : (subjectParam ? `${subjectParam} Exam Prep` : ''),
        tags: topicParam ? `${topicParam}, Past Papers` : 'Past Papers, Exam Prep',
      });
      setIsCreateModalOpen(true);
      window.history.replaceState({}, '', '/');
    }
  }, [currentUser, groups]);

  // Keep active chat group in sync with any group updates (leave, join, profile update)
  useEffect(() => {
    if (activeChatGroup) {
      const fresh = groups.find((g) => g.id === activeChatGroup.id);
      if (fresh && fresh !== activeChatGroup) {
        setActiveChatGroup(fresh);
      }
    }
  }, [groups, activeChatGroup]);

  // Handle Logo Click -> Go Home & Reset Filters
  const handleGoHome = () => {
    setSelectedCurriculum('ALL');
    setSelectedFormat('ALL');
    setSearchQuery('');
    setIsMyPodsOnly(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle User Profile Update (Avatar, Nickname)
  const handleUpdateUser = (updatedUser: StudentProfile) => {
    authUpdateUser(updatedUser);
    // Update local groups to reflect profile changes
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        host: g.host.id === updatedUser.id ? updatedUser : g.host,
        members: g.members.map((m) => (m.id === updatedUser.id ? updatedUser : m)),
      }))
    );
  };

  // Compute number of joined or hosted pods
  const myPodsCount = useMemo(() => {
    return groups.filter(
      (g) => g.members.some((m) => m.id === currentUser.id) || g.host.id === currentUser.id
    ).length;
  }, [groups, currentUser]);

  // Filter and prioritize pods matching student's enrolled subjects
  const filteredGroups = useMemo(() => {
    const list = groups.filter((group) => {
      if (isMyPodsOnly) {
        const isMyPod =
          group.members.some((m) => m.id === currentUser.id) || group.host.id === currentUser.id;
        if (!isMyPod) return false;
      }
      if (selectedCurriculum !== 'ALL' && group.curriculum !== selectedCurriculum) {
        return false;
      }
      if (selectedFormat !== 'ALL' && group.format !== selectedFormat) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = group.title.toLowerCase().includes(q);
        const matchesSubject = group.subject.toLowerCase().includes(q);
        const matchesTags = group.tags.some((t) => t.toLowerCase().includes(q));
        const matchesVenue = group.venueLabel.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSubject && !matchesTags && !matchesVenue) {
          return false;
        }
      }
      return true;
    });

    // Prioritize pods matching student's enrolled subjects to appear above others
    if (currentUser.subjects && currentUser.subjects.length > 0) {
      return [...list].sort((a, b) => {
        const aMatches = currentUser.subjects.some(
          (s) =>
            s.toLowerCase().includes(a.subject.toLowerCase()) ||
            a.subject.toLowerCase().includes(s.toLowerCase())
        );
        const bMatches = currentUser.subjects.some(
          (s) =>
            s.toLowerCase().includes(b.subject.toLowerCase()) ||
            b.subject.toLowerCase().includes(s.toLowerCase())
        );
        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
        return 0;
      });
    }

    return list;
  }, [groups, selectedCurriculum, selectedFormat, searchQuery, isMyPodsOnly, currentUser]);

  // Handle Joining or Opening Group
  const handleJoinOrOpen = (group: StudyGroup) => {
    const isMember = group.members.some((m) => m.id === currentUser.id);

    if (!isMember) {
      setPendingJoinGroup(group);
    } else {
      setActiveChatGroup(group);
    }
  };

  // Handle Leaving a Study Pod
  const handleLeaveGroup = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            members: g.members.filter((m) => m.id !== currentUser.id),
          };
        }
        return g;
      })
    );

    const sysMsg: ChatMessage = {
      id: `sys_leave_${Date.now()}`,
      groupId,
      sender: currentUser,
      content: `🙏 ${currentUser.fullName} had to step out of this study pod.`,
      createdAt: new Date().toISOString(),
      isSystem: true,
    };
    setChatMessages((prev) => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), sysMsg],
    }));

    setActiveChatGroup(null);
  };

  // Handle Cancelling a Study Pod (Host Only)
  const handleCancelGroup = (groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    setActiveChatGroup(null);
  };

  // Handle Confirmed Join with Etiquette & Responsibility Acknowledgment
  const handleConfirmJoin = (group: StudyGroup) => {
    const isMember = group.members.some((m) => m.id === currentUser.id);
    if (!isMember) {
      const updated = groups.map((g) => {
        if (g.id === group.id && g.members.length < g.maxMembers) {
          return {
            ...g,
            members: [...g.members, currentUser],
          };
        }
        return g;
      });
      setGroups(updated);

      const sysMsg: ChatMessage = {
        id: `sys_${Date.now()}`,
        groupId: group.id,
        sender: currentUser,
        content: `${currentUser.fullName} (${currentUser.schoolName.split(' ')[0]}) joined the study pod!`,
        createdAt: new Date().toISOString(),
        isSystem: true,
      };
      setChatMessages((prev) => ({
        ...prev,
        [group.id]: [...(prev[group.id] || []), sysMsg],
      }));
    }

    setPendingJoinGroup(null);
    const updatedTargetGroup: StudyGroup = {
      ...group,
      members: group.members.some((m) => m.id === currentUser.id)
        ? group.members
        : [...group.members, currentUser],
    };
    // Prompt student to add the session to their personal calendar
    setCalendarPromptState({ group: updatedTargetGroup, isHost: false });
  };

  // Handle Sending Chat Message
  const handleSendMessage = (
    groupId: string,
    content: string,
    type: MessageType = 'text',
    resource?: ResourceMetadata
  ) => {
    const cleanContent = sanitizeInput(content);
    if (!cleanContent) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      groupId,
      sender: currentUser,
      content: cleanContent,
      createdAt: new Date().toISOString(),
      type,
      resource,
    };

    setChatMessages((prev) => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), newMsg],
    }));

    // Dispatch Reddit-style offline email notification to pod peers in background
    const targetGroup = groups.find((g) => g.id === groupId);
    if (targetGroup) {
      notifyPodMembersOfChat(targetGroup, currentUser, cleanContent);
    }
  };

  // Handle Creating a New Study Group
  const handleCreateGroup = (newGroup: StudyGroup) => {
    setGroups((prev) => [newGroup, ...prev]);

    const welcomeMsg: ChatMessage = {
      id: `msg_init_${Date.now()}`,
      groupId: newGroup.id,
      sender: currentUser,
      content: `Welcome to ${newGroup.title}! Feel free to coordinate past papers, markschemes, and questions here.`,
      createdAt: new Date().toISOString(),
    };
    setChatMessages((prev) => ({
      ...prev,
      [newGroup.id]: [welcomeMsg],
    }));

    // Prompt host to add the created session to their personal calendar
    setCalendarPromptState({ group: newGroup, isHost: true });
  };

  // =========================================================================
  // AUTHENTICATED DASHBOARD: Unlocked only for verified students
  // =========================================================================
  return (
    <div className="min-h-screen flex flex-col bg-[#0E0D0B] text-[#EDEDEB] selection:bg-[#F5B942]/30 selection:text-white">
      {/* Cursor-following ambient spotlight */}
      <InteractiveBackground />

      {/* Frosted Glass Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onGoHome={handleGoHome}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
        onOpenWhyKantoPrep={() => setIsWhyModalOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        onOpenSubjectSurvey={() => setIsSubjectSurveyOpen(true)}
        onOpenInvite={() => setIsInviteModalOpen(true)}
        onOpenAuthModal={() => {}}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenSchoolSwitch={() => setIsSchoolSwitchOpen(true)}
        onSignOut={logout}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 relative z-10">
        <HeroSection
          selectedCurriculum={selectedCurriculum}
          onSelectCurriculum={setSelectedCurriculum}
          groupCount={groups.length}
          onOpenWhyKantoPrep={() => setIsWhyModalOpen(true)}
        />

        {/* Live Exam D-Day Radar */}
        <ExamRadar
          selectedCurriculum={selectedCurriculum}
          onSelectCurriculum={setSelectedCurriculum}
          groups={groups}
          onOpenCreatePod={(curriculum, subject, title) => {
            setPrefillData({
              curriculum,
              subject,
              title,
              tags: 'Exam Prep, Past Papers',
            });
            setIsCreateModalOpen(true);
          }}
        />

        {/* Khan Academy-style Subject Personalization Shelf */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="p-3 sm:p-4 rounded-2xl bg-[#161513] border border-[#F5B942]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-[#F5B942]/10 border border-[#F5B942]/25 text-[#F5B942] shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">Your Enrolled Subjects</span>
                  {currentUser.subjects && currentUser.subjects.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-[#F5B942]/15 text-[#F5B942] text-[10px] font-bold">
                      {currentUser.subjects.length} active
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  {currentUser.subjects && currentUser.subjects.length > 0 ? (
                    currentUser.subjects.map((subj) => (
                      <span
                        key={subj}
                        className="px-2 py-0.5 rounded-md bg-[#1C1A17] border border-[#F5B942]/15 text-[10px] font-medium text-[#EDEDEB]"
                      >
                        {subj}
                      </span>
                    ))
                  ) : (
                    <p className="text-[11px] text-[#A8A39D]">
                      Select what you&apos;re taking this semester to pin matching pods and past papers above everything else.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsSubjectSurveyOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#F5B942]/15 hover:bg-[#F5B942] text-[#F5B942] hover:text-[#0E0D0B] border border-[#F5B942]/30 text-xs font-bold transition-all cursor-pointer whitespace-nowrap self-end sm:self-auto shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {currentUser.subjects && currentUser.subjects.length > 0
                  ? 'Customize Subjects'
                  : 'Choose Your Subjects'}
              </span>
            </button>
          </div>
        </div>

        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedFormat={selectedFormat}
          onFormatChange={setSelectedFormat}
          totalResults={filteredGroups.length}
          isMyPodsOnly={isMyPodsOnly}
          onToggleMyPods={setIsMyPodsOnly}
          myPodsCount={myPodsCount}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredGroups.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 sm:py-20 p-6 sm:p-8 rounded-3xl bg-[#161513] border border-[#F5B942]/20 max-w-lg mx-auto shadow-md relative overflow-hidden dotted-bg"
            >
              {/* Animated floating book illustration */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-[#1C1A17] border border-[#F5B942]/25 flex items-center justify-center shadow-sm"
              >
                <BookOpen className="w-8 h-8 text-[#F5B942]" />
              </motion.div>
              <h3 className="text-base font-bold text-white">No pods yet</h3>
              <p className="text-xs text-[#A8A39D] mt-1.5 max-w-xs mx-auto leading-relaxed">
                Start the first pod. Someone&apos;s probably waiting.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-5 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#F5B942] hover:bg-[#E5A832] text-[#0E0D0B] text-xs font-bold shadow-md shadow-[#F5B942]/20 active:scale-95 cursor-pointer cta-glow"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Host This Session</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              <AnimatePresence>
                {filteredGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    currentUser={currentUser}
                    onJoinOrOpen={handleJoinOrOpen}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>

      {/* Enhanced Group Chat Drawer with Timer & Resources */}
      <GroupChatDrawer
        group={activeChatGroup}
        isOpen={Boolean(activeChatGroup)}
        onClose={() => setActiveChatGroup(null)}
        currentUser={currentUser}
        messages={activeChatGroup ? chatMessages[activeChatGroup.id] || [] : []}
        onSendMessage={handleSendMessage}
        onOpenReport={(grp) => setReportingGroup(grp)}
        onLeaveGroup={handleLeaveGroup}
        onCancelGroup={handleCancelGroup}
      />

      {/* Join Responsibility & Etiquette Reminder Modal */}
      <JoinGroupModal
        isOpen={Boolean(pendingJoinGroup)}
        group={pendingJoinGroup}
        currentUser={currentUser}
        onConfirmJoin={handleConfirmJoin}
        onClose={() => setPendingJoinGroup(null)}
      />

      {/* Edit Nickname & Avatar Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
        onClose={() => setIsEditProfileOpen(false)}
      />

      {/* Khan Academy-style Subject Customization Survey Modal */}
      <SubjectSurveyModal
        isOpen={isSubjectSurveyOpen}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
        onClose={() => setIsSubjectSurveyOpen(false)}
      />

      {/* Create Study Group Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setPrefillData({});
        }}
        currentUser={currentUser}
        onCreateGroup={handleCreateGroup}
        initialCurriculum={prefillData.curriculum}
        initialSubject={prefillData.subject}
        initialTitle={prefillData.title}
        initialTags={prefillData.tags}
      />

      {/* Safety & Moderation Report Modal */}
      <SafetyReportModal
        isOpen={Boolean(reportingGroup)}
        onClose={() => setReportingGroup(null)}
        group={reportingGroup}
        currentUser={currentUser}
      />

      {/* School / Student Switcher Modal (For Pilot Testing) */}
      <SchoolSwitchModal
        isOpen={isSchoolSwitchOpen}
        onClose={() => setIsSchoolSwitchOpen(false)}
        currentUser={currentUser}
        onSelectUser={(u) => authUpdateUser(u)}
      />

      {/* Community Feedback & Venue Suggestion Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Why KantoPrep Manifesto & Science Modal */}
      <WhyKantoPrepModal
        isOpen={isWhyModalOpen}
        onClose={() => setIsWhyModalOpen(false)}
      />

      {/* Invite Classmates & School Noticeboard Flyer Modal */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        currentUser={currentUser}
      />

      {/* 1-Click Calendar Sync Prompt Modal */}
      <CalendarPromptModal
        isOpen={!!calendarPromptState}
        group={calendarPromptState?.group || null}
        isHost={calendarPromptState?.isHost}
        onClose={() => setCalendarPromptState(null)}
        onOpenChat={(g) => {
          setCalendarPromptState(null);
          setActiveChatGroup(g);
        }}
      />

      {/* Add to Home Screen (PWA) Guidance Banner (Told Strictly Once) */}
      <AddToHomeScreenBanner />

      {/* Footer */}
      <footer className="w-full border-t border-[#F5B942]/15 bg-[#0E0D0B]/90 backdrop-blur-sm py-8 sm:py-10 px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-5">
          {/* Brand + Mini Stats */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">KantoPrep</span>
              <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide bg-[#F5B942]/10 text-[#F5B942] border border-[#F5B942]/30 rounded-full">
                Pilot
              </span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] text-[#7A756D]">
              <span>{groups.length} pods hosted</span>
              <span className="text-[#3A3630]">•</span>
              <span>8+ schools connected</span>
              <span className="text-[#3A3630]">•</span>
              <span>100% free</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center space-x-4 text-[11px] text-[#9E988F]">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center space-x-1 hover:text-[#F5B942] transition-colors cursor-pointer"
              title="Print A4 flyer for school library or share invite"
            >
              <Share2 className="w-3.5 h-3.5 text-[#F5B942]" />
              <span>Invite / Flyer</span>
            </button>
            <span className="text-[#3A3630]">•</span>
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="inline-flex items-center space-x-1 hover:text-[#F5B942] transition-colors cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-[#F5B942]" />
              <span>Feedback</span>
            </button>
            <span className="text-[#3A3630]">•</span>
            <a
              href="https://instagram.com/kantoprep"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 hover:text-[#F5B942] transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-[#F5B942]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              <span>@kantoprep</span>
            </a>
            <span className="text-[#3A3630]">•</span>
            <span>School Email Whitelisted</span>
            <span className="text-[#3A3630]">•</span>
            <span>Zero Ads</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
