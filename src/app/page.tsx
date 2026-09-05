'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { FilterBar } from '@/components/FilterBar';
import { GroupCard } from '@/components/GroupCard';
import { GroupChatDrawer } from '@/components/GroupChatDrawer';
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { SafetyReportModal } from '@/components/SafetyReportModal';
import { SchoolSwitchModal } from '@/components/SchoolSwitchModal';
import { SchoolGateScreen } from '@/components/SchoolGateScreen';
import { FeedbackModal } from '@/components/FeedbackModal';
import { WhyKantoPrepModal } from '@/components/WhyKantoPrepModal';
import { JoinGroupModal } from '@/components/JoinGroupModal';
import { EditProfileModal } from '@/components/EditProfileModal';
import { InteractiveBackground } from '@/components/InteractiveBackground';
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
import { Plus, BookOpen, MessageSquarePlus } from 'lucide-react';
import { sanitizeInput } from '@/lib/safety';

export default function Home() {
  // Authentication & Current User State (null = held at gate)
  const [currentUser, setCurrentUser] = useState<StudentProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

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
  const [pendingJoinGroup, setPendingJoinGroup] = useState<StudyGroup | null>(null);
  const [reportingGroup, setReportingGroup] = useState<StudyGroup | null>(null);

  // Restore session, groups, and chat history from localStorage on initial load
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kantoprep_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          setCurrentUser(parsed);
        }
      }

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
      setIsAuthLoading(false);
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

  // Deep link support (?pod=...) runs once after auth and data load
  useEffect(() => {
    if (typeof window === 'undefined' || isAuthLoading || !currentUser || deepLinkProcessedRef.current) return;

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
    }
  }, [isAuthLoading, currentUser, groups]);

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

  // Handle successful login
  const handleAuthenticated = (user: StudentProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('kantoprep_user', JSON.stringify(user));
    } catch {
      // Ignore
    }
  };

  // Handle Sign Out (Locks app back to Gate Screen)
  const handleSignOut = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('kantoprep_user');
    } catch {
      // Ignore
    }
  };

  // Compute number of joined or hosted pods
  const myPodsCount = useMemo(() => {
    if (!currentUser) return 0;
    return groups.filter(
      (g) => g.members.some((m) => m.id === currentUser.id) || g.host.id === currentUser.id
    ).length;
  }, [groups, currentUser]);

  // Filter Logic
  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      if (isMyPodsOnly) {
        const isMyPod =
          currentUser &&
          (group.members.some((m) => m.id === currentUser.id) || group.host.id === currentUser.id);
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
  }, [groups, selectedCurriculum, selectedFormat, searchQuery, isMyPodsOnly, currentUser]);

  // Handle Joining or Opening Group
  const handleJoinOrOpen = (group: StudyGroup) => {
    if (!currentUser) return;
    const isMember = group.members.some((m) => m.id === currentUser.id);

    if (!isMember) {
      setPendingJoinGroup(group);
    } else {
      setActiveChatGroup(group);
    }
  };

  // Handle Leaving a Study Pod
  const handleLeaveGroup = (groupId: string) => {
    if (!currentUser) return;

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
    if (!currentUser) return;
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    setActiveChatGroup(null);
  };

  // Handle Confirmed Join with Etiquette & Responsibility Acknowledgment
  const handleConfirmJoin = (group: StudyGroup) => {
    if (!currentUser) return;

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
    setActiveChatGroup(updatedTargetGroup);
  };

  // Handle User Profile Update (Avatar, Nickname)
  const handleUpdateUser = (updatedUser: StudentProfile) => {
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('kantoprep_user', JSON.stringify(updatedUser));
    } catch {
      // Ignore
    }
    // Update local groups
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        host: g.host.id === updatedUser.id ? updatedUser : g.host,
        members: g.members.map((m) => (m.id === updatedUser.id ? updatedUser : m)),
      }))
    );
  };

  // Handle Sending Chat Message
  const handleSendMessage = (
    groupId: string,
    content: string,
    type: MessageType = 'text',
    resource?: ResourceMetadata
  ) => {
    if (!currentUser) return;
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
  };

  // Handle Creating a New Study Group
  const handleCreateGroup = (newGroup: StudyGroup) => {
    if (!currentUser) return;

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

    setActiveChatGroup(newGroup);
  };

  // Loading skeleton while checking localStorage
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7faf8] text-emerald-700">
        <div className="flex items-center space-x-2 text-sm font-semibold animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Entering KantoPrep...</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STRICT GATEKEEPER: If not logged in, visitor CANNOT access website
  // =========================================================================
  if (!currentUser) {
    return (
      <>
        <SchoolGateScreen
          onAuthenticated={handleAuthenticated}
          onOpenFeedback={() => setIsFeedbackModalOpen(true)}
          onOpenWhyKantoPrep={() => setIsWhyModalOpen(true)}
        />
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          currentUser={null}
        />
        <WhyKantoPrepModal
          isOpen={isWhyModalOpen}
          onClose={() => setIsWhyModalOpen(false)}
        />
      </>
    );
  }

  // =========================================================================
  // AUTHENTICATED DASHBOARD: Unlocked only for verified students
  // =========================================================================
  return (
    <div className="min-h-screen flex flex-col bg-[#f7faf8] text-zinc-900 selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* Cursor-following ambient spotlight */}
      <InteractiveBackground />

      {/* Frosted Glass Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onGoHome={handleGoHome}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
        onOpenWhyKantoPrep={() => setIsWhyModalOpen(true)}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
        onOpenAuthModal={() => {}}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenSchoolSwitch={() => setIsSchoolSwitchOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 relative z-10">
        <HeroSection
          selectedCurriculum={selectedCurriculum}
          onSelectCurriculum={setSelectedCurriculum}
          groupCount={groups.length}
          onOpenWhyKantoPrep={() => setIsWhyModalOpen(true)}
        />

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
              className="text-center py-16 sm:py-20 p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 max-w-lg mx-auto shadow-sm relative overflow-hidden dotted-bg"
            >
              {/* Animated floating book illustration */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm"
              >
                <BookOpen className="w-8 h-8 text-emerald-500" />
              </motion.div>
              <h3 className="text-base font-bold text-zinc-900">No pods yet</h3>
              <p className="text-xs text-zinc-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
                Start the first pod. Someone&apos;s probably waiting.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-5 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/15 active:scale-95 cursor-pointer cta-glow"
              >
                <Plus className="w-4 h-4" />
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

      {/* Create Study Group Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUser={currentUser}
        onCreateGroup={handleCreateGroup}
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
        onSelectUser={(u) => handleAuthenticated(u)}
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

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 bg-white/80 backdrop-blur-sm py-8 sm:py-10 px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-5">
          {/* Brand + Mini Stats */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-zinc-800">KantoPrep</span>
              <span className="px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                Pilot
              </span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] text-zinc-500">
              <span>{groups.length} pods hosted</span>
              <span className="text-zinc-300">•</span>
              <span>8+ schools connected</span>
              <span className="text-zinc-300">•</span>
              <span>100% free</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center space-x-4 text-[11px] text-zinc-500">
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="inline-flex items-center space-x-1 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Feedback</span>
            </button>
            <span className="text-zinc-300">•</span>
            <a
              href="https://instagram.com/kantoprep"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 hover:text-emerald-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              <span>@kantoprep</span>
            </a>
            <span className="text-zinc-300">•</span>
            <span>School Email Whitelisted</span>
            <span className="text-zinc-300">•</span>
            <span>Zero Ads</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
