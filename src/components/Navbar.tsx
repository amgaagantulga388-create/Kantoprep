'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, ShieldCheck, LogIn, LogOut, ChevronDown, User, MessageSquarePlus, Sparkles, Share2, BookOpen, Users, Target } from 'lucide-react';
import { StudentProfile } from '@/types';
import { ALLOWED_SCHOOLS } from '@/lib/constants';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  currentUser: StudentProfile | null;
  onGoHome?: () => void;
  onOpenFeedback: () => void;
  onOpenWhyKantoPrep?: () => void;
  onOpenEditProfile?: () => void;
  onOpenSubjectSurvey?: () => void;
  onOpenInvite?: () => void;
  onOpenAuthModal?: () => void;
  onOpenCreateModal?: () => void;
  onOpenSchoolSwitch?: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onGoHome,
  onOpenFeedback,
  onOpenWhyKantoPrep,
  onOpenEditProfile,
  onOpenSubjectSurvey,
  onOpenInvite,
  onOpenAuthModal,
  onOpenCreateModal,
  onOpenSchoolSwitch,
  onSignOut,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const activeTab = pathname.startsWith('/resources') ? 'resources' : 'pods';

  // Close dropdown on outside click
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const currentSchool = currentUser
    ? ALLOWED_SCHOOLS.find((s) => s.domain === currentUser.schoolDomain) || ALLOWED_SCHOOLS[0]
    : null;

  const handleLogoClick = () => {
    if (onGoHome) {
      onGoHome();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Identity (Always Links to Home) */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className="flex items-center space-x-2.5 text-left cursor-pointer group focus:outline-none"
          title="KantoPrep Home"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-md shadow-[#F5B942]/15 border border-[#F5B942]/30 group-hover:scale-105 transition-transform shrink-0 bg-[#161513]">
            <img
              src="/logo.png"
              alt="KantoPrep Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-[#F5B942] transition-colors">
                KantoPrep
              </span>
              <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide bg-[#F5B942]/10 text-[#F5B942] border border-[#F5B942]/30 rounded-full">
                Pilot
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#9E988F] font-normal hidden md:block">
              Tokyo International School Study Network
            </p>
          </div>
        </Link>

        {/* Center: Navigation Tabs */}
        {currentUser && (
          <div className="flex items-center space-x-1 p-1 rounded-xl glass-panel">
            <Link
              href="/"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'pods'
                  ? 'tab-active'
                  : 'text-[#9E988F] hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Study Pods</span>
              <span className="sm:hidden">Pods</span>
            </Link>
            <Link
              href="/resources"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'resources'
                  ? 'tab-active'
                  : 'text-[#9E988F] hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prep Library</span>
              <span className="sm:hidden">Library</span>
            </Link>
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          {/* Light / Dark Mode Switcher */}
          <ThemeToggle />

          {/* Why KantoPrep Button */}
          {onOpenWhyKantoPrep && (
            <button
              onClick={onOpenWhyKantoPrep}
              className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-[#F5B942]/10 border border-[#F5B942]/25 hover:border-[#F5B942]/40 text-[#F5B942] text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              title="Why KantoPrep? Our mission and research"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F5B942]" />
              <span>Why KantoPrep?</span>
            </button>
          )}

          {/* Feedback Button */}
          <button
            onClick={onOpenFeedback}
            className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-[#161513] border border-[#F5B942]/20 hover:border-[#F5B942]/40 text-[#D1CEC7] hover:text-[#F5B942] text-xs font-medium transition-all cursor-pointer shadow-2xs"
            title="Suggest a safe library venue or share feedback"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-[#F5B942]" />
            <span className="hidden sm:inline">Feedback</span>
          </button>

          {currentUser ? (
            <>
              {/* Primary CTA: Host Session (only on Study Pods page) */}
              {activeTab === 'pods' && onOpenCreateModal && (
                <button
                  onClick={onOpenCreateModal}
                  className="flex items-center space-x-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#F5B942] hover:bg-[#E5A832] text-[#0E0D0B] text-xs font-bold shadow-md shadow-[#F5B942]/20 hover:shadow-[#F5B942]/30 transition-all duration-200 active:scale-[0.98] cursor-pointer cta-glow"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Host Pod</span>
                </button>
              )}

              {/* Student Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-1 p-0.5 rounded-full hover:ring-2 hover:ring-[#F5B942]/40 transition-all cursor-pointer"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                    alt={currentUser.fullName}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-[#F5B942]/30 shadow-xs"
                  />
                  <ChevronDown className="w-3 h-3 text-[#7A756D] hidden sm:block" />
                </button>

                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-[#161513] rounded-2xl shadow-2xl border border-[#F5B942]/20 py-1.5 z-50 text-xs text-[#E4E2DD]"
                  >
                    <div className="px-3.5 py-2.5 border-b border-[#F5B942]/15">
                      <p className="font-bold text-white truncate">{currentUser.fullName}</p>
                      <p className="text-[11px] text-[#9E988F] truncate">{currentUser.email}</p>
                      {currentSchool && (
                        <span className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded bg-[#F5B942]/10 text-[#F5B942] border border-[#F5B942]/30 font-medium">
                          {currentSchool.shortName} • {currentUser.gradeLevel ? `Gr. ${currentUser.gradeLevel}` : 'Student'}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenEditProfile?.();
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-white/5 flex items-center space-x-2 text-[#E4E2DD] hover:text-[#F5B942] cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#F5B942]" />
                      <span>Edit Nickname &amp; Avatar</span>
                    </button>

                    {onOpenSubjectSurvey && (
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onOpenSubjectSurvey();
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-white/5 flex items-center space-x-2 text-[#E4E2DD] hover:text-[#F5B942] cursor-pointer transition-colors"
                      >
                        <Target className="w-3.5 h-3.5 text-[#F5B942]" />
                        <span>Customize My Subjects</span>
                      </button>
                    )}

                    {onOpenInvite && (
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onOpenInvite();
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-white/5 flex items-center space-x-2 text-[#E4E2DD] hover:text-[#F5B942] cursor-pointer transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[#F5B942]" />
                        <span>Invite Classmates / Print Flyer</span>
                      </button>
                    )}

                    {onOpenSchoolSwitch && (
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onOpenSchoolSwitch();
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-white/5 flex items-center space-x-2 text-[#E4E2DD] hover:text-[#F5B942] cursor-pointer transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-[#F5B942]" />
                        <span>Switch Student Account</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenFeedback();
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-white/5 flex items-center space-x-2 text-[#E4E2DD] hover:text-[#F5B942] cursor-pointer transition-colors"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5 text-[#F5B942]" />
                      <span>Suggest a Study Venue</span>
                    </button>

                    {/* Mode Toggle in Dropdown */}
                    <div className="px-3.5 py-2 flex items-center justify-between border-t border-[#F5B942]/15">
                      <span className="text-[11px] text-[#A8A39D] font-medium">Appearance</span>
                      <ThemeToggle showLabel={true} className="py-1 px-2.5 text-[11px]" />
                    </div>

                    <div className="my-1 border-t border-[#F5B942]/15" />

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onSignOut();
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-red-500/10 flex items-center space-x-2 text-red-400 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Logged Out View */
            <button
              onClick={() => onOpenAuthModal?.()}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[#F5B942] hover:bg-[#E5A832] text-[#0E0D0B] text-xs font-bold shadow-md shadow-[#F5B942]/20 transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
