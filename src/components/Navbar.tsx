'use client';

import React, { useState } from 'react';
import { Award, Plus, ShieldCheck, LogIn, LogOut, ChevronDown, User } from 'lucide-react';
import { StudentProfile } from '@/types';
import { ALLOWED_SCHOOLS } from '@/lib/constants';

interface NavbarProps {
  currentUser: StudentProfile | null;
  onOpenAuthModal: () => void;
  onOpenCreateModal: () => void;
  onOpenCasModal: () => void;
  onOpenSchoolSwitch: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenAuthModal,
  onOpenCreateModal,
  onOpenCasModal,
  onOpenSchoolSwitch,
  onSignOut,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const currentSchool = currentUser
    ? ALLOWED_SCHOOLS.find((s) => s.domain === currentUser.schoolDomain) || ALLOWED_SCHOOLS[0]
    : null;

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-md shadow-emerald-600/20 text-white font-bold text-lg tracking-wider">
            KP
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold tracking-tight text-zinc-900">KantoPrep</span>
              <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                Tokyo Pilot
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-normal hidden sm:block">
              International School Study Network
            </p>
          </div>
        </div>

        {/* Center: School Verified Badge (Clickable to switch demo accounts) */}
        {currentUser && currentSchool && (
          <button
            onClick={onOpenSchoolSwitch}
            className="hidden md:flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-panel hover:border-emerald-300 transition-all duration-200 group text-left cursor-pointer"
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
        <div className="flex items-center space-x-2.5">
          {currentUser ? (
            <>
              {/* CAS / NHS Hours Pill */}
              <button
                onClick={onOpenCasModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:border-amber-300 hover:bg-amber-100/80 transition-all duration-200 cursor-pointer shadow-xs"
                title="View verified CAS / NHS tutoring hours"
              >
                <Award className="w-4 h-4 text-amber-600 animate-pulse" />
                <span className="text-xs font-medium">
                  <strong className="font-semibold text-amber-900">{currentUser.casHours}h</strong> CAS / NHS
                </span>
              </button>

              {/* Primary CTA: Host Session */}
              <button
                onClick={onOpenCreateModal}
                className="flex items-center space-x-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 hover:shadow-emerald-500/30 transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Host a Session</span>
                <span className="sm:hidden">Host</span>
              </button>

              {/* Student Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-1 p-0.5 rounded-full hover:ring-2 hover:ring-emerald-400/40 transition-all cursor-pointer"
                >
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                    alt={currentUser.fullName}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/30 shadow-xs"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </button>

                {isDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-zinc-200 py-1.5 z-50 text-xs text-zinc-700"
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <div className="px-3.5 py-2.5 border-b border-zinc-100">
                      <p className="font-bold text-zinc-900 truncate">{currentUser.fullName}</p>
                      <p className="text-[11px] text-zinc-500 truncate">{currentUser.email}</p>
                      <span className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {currentUser.schoolName}
                      </span>
                    </div>

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
                        onOpenCasModal();
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-zinc-50 flex items-center space-x-2 text-zinc-700 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>Print CAS Certificate</span>
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
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Join</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
