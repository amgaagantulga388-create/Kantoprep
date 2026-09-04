'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { FilterBar } from '@/components/FilterBar';
import { GroupCard } from '@/components/GroupCard';
import { GroupChatDrawer } from '@/components/GroupChatDrawer';
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { CasCertificateModal } from '@/components/CasCertificateModal';
import { SafetyReportModal } from '@/components/SafetyReportModal';
import { SchoolSwitchModal } from '@/components/SchoolSwitchModal';
import { SchoolGateScreen } from '@/components/SchoolGateScreen';
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
import { Plus, BookOpen } from 'lucide-react';
import { sanitizeInput } from '@/lib/safety';

export default function Home() {
  // Authentication & Current User State (null = not logged in)
  const [currentUser, setCurrentUser] = useState<StudentProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // App Data State
  const [groups, setGroups] = useState<StudyGroup[]>(INITIAL_GROUPS);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_CHAT_MESSAGES);

  // Filter States
  const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum | 'ALL'>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<SessionFormat | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Modals & Drawers
  const [activeChatGroup, setActiveChatGroup] = useState<StudyGroup | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCasModalOpen, setIsCasModalOpen] = useState(false);
  const [isSchoolSwitchOpen, setIsSchoolSwitchOpen] = useState(false);
  const [reportingGroup, setReportingGroup] = useState<StudyGroup | null>(null);

  // Restore session from localStorage on initial load
  useEffect(() => {
    try {
      const saved = localStorage.getItem('kantoprep_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          setCurrentUser(parsed);
        }
      }
    } catch {
      // Ignore
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  // Handle successful login
  const handleAuthenticated = (user: StudentProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('kantoprep_user', JSON.stringify(user));
    } catch {
      // Ignore storage error
    }
  };

  // Handle Sign Out (Locks app back to Gatekeeper Screen)
  const handleSignOut = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('kantoprep_user');
    } catch {
      // Ignore storage error
    }
  };

  // Filter Logic
  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
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
  }, [groups, selectedCurriculum, selectedFormat, searchQuery]);

  // Handle Joining or Opening Group
  const handleJoinOrOpen = (group: StudyGroup) => {
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

    const targetGroup = groups.find((g) => g.id === group.id) || group;
    setActiveChatGroup(targetGroup);
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

    // Automatically credit CAS hours to host
    const updatedUser: StudentProfile = {
      ...currentUser,
      casHours: Number((currentUser.casHours + newGroup.durationMinutes / 60).toFixed(1)),
    };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('kantoprep_user', JSON.stringify(updatedUser));
    } catch {
      // Ignore
    }

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

  const hostedGroups = useMemo(() => {
    if (!currentUser) return [];
    return groups.filter((g) => g.host.id === currentUser.id);
  }, [groups, currentUser]);

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
    return <SchoolGateScreen onAuthenticated={handleAuthenticated} />;
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
        onOpenAuthModal={() => {}}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenCasModal={() => setIsCasModalOpen(true)}
        onOpenSchoolSwitch={() => setIsSchoolSwitchOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 relative z-10">
        <HeroSection
          selectedCurriculum={selectedCurriculum}
          onSelectCurriculum={setSelectedCurriculum}
          groupCount={groups.length}
        />

        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedFormat={selectedFormat}
          onFormatChange={setSelectedFormat}
          totalResults={filteredGroups.length}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredGroups.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 p-8 rounded-3xl bg-white border border-zinc-200 max-w-lg mx-auto shadow-sm"
            >
              <BookOpen className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-zinc-900">No Study Pods Found</h3>
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
      />

      {/* Create Study Group Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUser={currentUser}
        onCreateGroup={handleCreateGroup}
      />

      {/* Official CAS / NHS Hours Certificate Modal */}
      <CasCertificateModal
        isOpen={isCasModalOpen}
        onClose={() => setIsCasModalOpen(false)}
        currentUser={currentUser}
        hostedGroups={hostedGroups}
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

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 bg-white/80 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-zinc-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-zinc-700">KantoPrep</span>
            <span>•</span>
            <span>Tokyo International School Student Initiative</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-zinc-500">
            <span>Free Tier ($0) Architecture</span>
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
