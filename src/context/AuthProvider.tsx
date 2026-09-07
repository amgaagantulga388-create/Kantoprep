'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StudentProfile } from '@/types';
import { SchoolGateScreen } from '@/components/SchoolGateScreen';
import { FeedbackModal } from '@/components/FeedbackModal';
import { WhyKantoPrepModal } from '@/components/WhyKantoPrepModal';
import { InviteModal } from '@/components/InviteModal';

interface AuthContextType {
  currentUser: StudentProfile;
  updateUser: (user: StudentProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<StudentProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Gate-screen modal state
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isWhyOpen, setIsWhyOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Restore session from localStorage
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

  const login = (user: StudentProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('kantoprep_user', JSON.stringify(user));
    } catch {
      // Ignore
    }
  };

  const updateUser = (user: StudentProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('kantoprep_user', JSON.stringify(user));
    } catch {
      // Ignore
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('kantoprep_user');
    } catch {
      // Ignore
    }
  };

  // Loading state
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

  // Gate screen — unauthenticated
  if (!currentUser) {
    return (
      <>
        <SchoolGateScreen
          onAuthenticated={login}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
          onOpenWhyKantoPrep={() => setIsWhyOpen(true)}
          onOpenInvite={() => setIsInviteOpen(true)}
        />
        <FeedbackModal
          isOpen={isFeedbackOpen}
          onClose={() => setIsFeedbackOpen(false)}
          currentUser={null}
        />
        <WhyKantoPrepModal
          isOpen={isWhyOpen}
          onClose={() => setIsWhyOpen(false)}
        />
        <InviteModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          currentUser={null}
        />
      </>
    );
  }

  // Authenticated — render children with context
  return (
    <AuthContext.Provider value={{ currentUser, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
