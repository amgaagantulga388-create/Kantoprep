'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
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
  const [currentUser, setCurrentUser] = useState<StudentProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('kantoprep_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      }
    } catch {}
    return null;
  });

  // Gate-screen modal state
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isWhyOpen, setIsWhyOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

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
