'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, ShieldCheck, LogIn, LogOut, ChevronDown, User, MessageSquarePlus, Sparkles, Share2 } from 'lucide-react';
import { StudentProfile } from '@/types';
import { ALLOWED_SCHOOLS } from '@/lib/constants';

interface NavbarProps {
  currentUser: StudentProfile | null;
  onGoHome: () => void;
  onOpenFeedback: () => void;
  onOpenWhyKantoPrep?: () => void;
  onOpenEditProfile?: () => void;
  onOpenInvite?: () => void;
  onOpenAuthModal: () => void;
  onOpenCreateModal: () => void;
  onOpenSchoolSwitch: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onGoHome,
  onOpenFeedback,
  onOpenWhyKantoPrep,
  onOpenEditProfile,
  onOpenInvite,
  onOpenAuthModal,
  onOpenCreateModal,
  onOpenSchoolSwitch,
  onSignOut,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Identity (Click to Go Home) */}
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center space-x-2.5 text-left cursor-pointer group focus:outline-none"
          title="KantoPrep Home"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shadow-md shadow-emerald-600/15 border border-emerald-200/80 group-hover:scale-105 transition-transform shrink-0 bg-white">
            <img
              src="/logo.png"
              alt="KantoPrep Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 group-hover:text-emerald-700 transition-colors">
                KantoPrep
              </span>
              <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                Pilot
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 font-normal hidden md:block">
              Tokyo International School Study Network
            </p>
          </div>
        </button>

        {/* Center: School Verified Badge (Hidden on mobile, visible on tablet/desktop) */}
        {currentUser && currentSchool && (
          <button
            onClick={onOpenSchoolSwitch}
            className="hidden md:flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-panel hover:border-emerald-300 transition-all duration-200 group text-left cursor-pointer shadow-2xs"
            title="Click to test school gate / switch profile"
          >
            <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${currentSchool.badgeColor}`} />
            <span className="text-xs font-medium text-zinc-700 group-hover:text-zinc-900 transition-colors">
              {currentSchool.shortName} • {currentUser.gradeLevel ? `Gr. ${currentUser.gradeLevel}` : 'Student'}
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </button>
        )}

        {/* Right: Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          {/* Why KantoPrep Button */}
          {onOpenWhyKantoPrep && (
            <button
              onClick={onOpenWhyKantoPrep}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-200 hover:border-emerald-300 text-emerald-800 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              title="Why KantoPrep? Our mission and research"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Why KantoPrep?</span>
            </button>
          )}

          {/* Invite Peers / Print Flyer Button */}
          {onOpenInvite && (
            <button
              onClick={onOpenInvite}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-white border border-zinc-200 hover:border-emerald-300 text-zinc-700 hover:text-emerald-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              title="Invite peers or print school flyer"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Invite</span>
            </button>
          )}

          {/* Feedback Button */}
          <button
            onClick={onOpenFeedback}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-white border border-zinc-200 hover:border-emerald-300 text-zinc-600 hover:text-emerald-700 text-xs font-medium transition-all cursor-pointer shadow-2xs"
            title="Suggest a safe library venue or share feedback"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Feedback</span>
          </button>

          {currentUser ? (
            <>
              {/* Primary CTA: Host Session */}
              <button
                onClick={onOpenCreateModal}
                className="flex items-center space-x-1 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 hover:shadow-emerald-500/30 transition-all duration-200 active:scale-[0.98] cursor-pointer cta-glow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Host Pod</span>
              </button>

              {/* Student Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-1 p-0.5 rounded-full hover:ring-2 hover:ring-emerald-400/40 transition-all cursor-pointer"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                    alt={currentUser.fullName}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-emerald-500/30 shadow-xs"
                  />
                  <ChevronDown className="w-3 h-3 text-zinc-400 hidden sm:block" />
                </button>

                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-zinc-200 py-1.5 z-50 text-xs text-zinc-700"
                  >
                    <div className="px-3.5 py-2.5 border-b border-zinc-100">
                      <p className="font-bold text-zinc-900 truncate">{currentUser.fullName}</p>
                      <p className="text-[11px] text-zinc-500 truncate">{currentUser.email}</p>
                      <span className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                        {currentUser.schoolName}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenEditProfile?.();
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-zinc-50 flex items-center space-x-2 text-zinc-700 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Edit Nickname &amp; Avatar</span>
                    </button>

                    {onOpenInvite && (
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onOpenInvite();
                        }}
                        className="w-full px-3.5 py-2 text-left hover:bg-zinc-50 flex items-center space-x-2 text-zinc-700 cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Invite Classmates / Print Flyer</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenSchoolSwitch();
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-zinc-50 flex items-center space-x-2 text-zinc-700 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Switch Student Account</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenFeedback();
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-zinc-50 flex items-center space-x-2 text-zinc-700 cursor-pointer"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Suggest a Study Venue</span>
                    </button>

                    <div className="my-1 border-t border-zinc-100" />

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onSignOut();
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-red-50 flex items-center space-x-2 text-red-600 cursor-pointer"
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
              onClick={onOpenAuthModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
