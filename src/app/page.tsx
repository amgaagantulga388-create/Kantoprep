'use client';

import React, { useState, useMemo, useEffect } from 'react';
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

  // Deep link support (?pod=...)
  useEffect(() => {
    if (typeof window === 'undefined' || isAuthLoading || !currentUser) return;

    const params = new URLSearchParams(window.location.search);
    const podId = params.get('pod');
    if (!podId) return;

    const matched = groups.find((g) => g.id === podId);
    if (matched) {
      const isMember = matched.members.some((m) => m.id === currentUser.id);
      if (isMember) {
        setActiveChatGroup(matched);
      } else {
        setPendingJoinGroup(matched);
      }
    }
  }, [isAuthLoading, currentUser, groups]);

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
    const targetGroup = groups.find((g) => g.id === group.id) || group;
    setActiveChatGroup(targetGroup);
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 sm:py-20 p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 max-w-lg mx-auto shadow-sm"
            >
              <BookOpen className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-zinc-900">No Study Pods Found</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                No active groups match your current filter. Be the leader who starts the first sprint!
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-5 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/15 active:scale-95 cursor-pointer"
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
      <footer className="w-full border-t border-zinc-200 bg-white/80 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-zinc-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-zinc-700">KantoPrep</span>
            <span>•</span>
            <span>Verified Tokyo Peer Study Network</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-zinc-500">
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="inline-flex items-center space-x-1 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Suggest Library / Feedback</span>
            </button>
            <span>•</span>
            <span>School Email Whitelisted</span>
            <span>•</span>
            <span>Zero Commercial Ads</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
