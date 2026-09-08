import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthModal } from '@/components/AuthModal';
import { CreateGroupModal } from '@/components/CreateGroupModal';
import { JoinGroupModal } from '@/components/JoinGroupModal';
import { FeedbackModal } from '@/components/FeedbackModal';
import { InviteModal } from '@/components/InviteModal';
import { EditProfileModal } from '@/components/EditProfileModal';
import { SchoolSwitchModal } from '@/components/SchoolSwitchModal';
import { WhyKantoPrepModal } from '@/components/WhyKantoPrepModal';
import { SubjectSurveyModal } from '@/components/SubjectSurveyModal';
import { CalendarPromptModal } from '@/components/CalendarPromptModal';
import { SafetyReportModal } from '@/components/SafetyReportModal';
import { SuggestResourceModal } from '@/components/resources/SuggestResourceModal';
import manifest from '@/app/manifest';
import { StudentProfile, StudyGroup } from '@/types';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

const mockUser: StudentProfile = {
  id: 'usr_test_a11y',
  fullName: 'Test Student',
  email: 'test.student@students.aobajapan.jp',
  schoolDomain: 'students.aobajapan.jp',
  schoolName: 'Aoba-Japan International School',
  gradeLevel: 11,
  curriculum: 'IB',
  subjects: ['Mathematics: Analysis & Approaches', 'Physics'],
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
  role: 'student',
};

const mockGroup: StudyGroup = {
  id: 'grp_test_a11y',
  title: 'IB Physics HL Past Paper Sprint',
  description: 'Solving paper 2 questions.',
  curriculum: 'IB',
  subject: 'Physics HL',
  format: 'past_paper_sprint',
  venueType: 'hiroo_metropolitan_library',
  venueLabel: 'Tokyo Metropolitan Central Library',
  meetingTime: 'Tomorrow, 4:30 PM',
  durationMinutes: 90,
  maxMembers: 5,
  host: mockUser,
  members: [mockUser],
  status: 'open',
  tags: ['IB', 'Physics'],
  createdAt: new Date().toISOString(),
};

describe('Accessibility (a11y) & ARIA Semantics Audit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Manifest accessibility & category tags', () => {
    it('has proper categories and metadata defined', () => {
      const m = manifest();
      expect(m.categories).toBeDefined();
      expect(m.categories).toContain('education');
      expect(m.categories).toContain('productivity');
    });
  });

  describe('AuthModal a11y', () => {
    it('has role="dialog", aria-modal="true", and aria-labelledby matching header', () => {
      const onClose = vi.fn();
      render(<AuthModal isOpen={true} onClose={onClose} onAuthenticated={vi.fn()} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'auth-modal-title');

      const title = document.getElementById('auth-modal-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Student Sign In & Whitelist');
    });

    it('has accessible close button and dismisses on Escape key', () => {
      const onClose = vi.fn();
      render(<AuthModal isOpen={true} onClose={onClose} onAuthenticated={vi.fn()} />);

      const closeBtn = screen.getByRole('button', { name: 'Close modal' });
      expect(closeBtn).toBeInTheDocument();

      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(2);
    });
  });

  describe('CreateGroupModal a11y', () => {
    it('has role="dialog", aria-modal="true", and aria-labelledby matching header', () => {
      const onClose = vi.fn();
      render(
        <CreateGroupModal
          isOpen={true}
          onClose={onClose}
          currentUser={mockUser}
          onCreateGroup={vi.fn()}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'create-group-title');

      const title = document.getElementById('create-group-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Select Syllabus & Subject');
    });

    it('has accessible close button and dismisses on Escape key', () => {
      const onClose = vi.fn();
      render(
        <CreateGroupModal
          isOpen={true}
          onClose={onClose}
          currentUser={mockUser}
          onCreateGroup={vi.fn()}
        />
      );

      const closeBtn = screen.getByRole('button', { name: 'Close modal' });
      expect(closeBtn).toBeInTheDocument();

      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(2);
    });
  });

  describe('JoinGroupModal a11y', () => {
    it('has role="dialog", aria-modal="true", and aria-labelledby matching header', () => {
      const onClose = vi.fn();
      render(
        <JoinGroupModal
          isOpen={true}
          group={mockGroup}
          currentUser={mockUser}
          onConfirmJoin={vi.fn()}
          onClose={onClose}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'join-group-title');

      const title = document.getElementById('join-group-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent(`Join ${mockGroup.title}`);
    });

    it('has accessible close button and dismisses on Escape key', () => {
      const onClose = vi.fn();
      render(
        <JoinGroupModal
          isOpen={true}
          group={mockGroup}
          currentUser={mockUser}
          onConfirmJoin={vi.fn()}
          onClose={onClose}
        />
      );

      const closeBtn = screen.getByRole('button', { name: 'Close modal' });
      expect(closeBtn).toBeInTheDocument();

      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(2);
    });
  });

  describe('FeedbackModal a11y', () => {
    it('has role="dialog", aria-modal="true", and aria-labelledby matching header', () => {
      const onClose = vi.fn();
      render(<FeedbackModal isOpen={true} onClose={onClose} currentUser={mockUser} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'feedback-modal-title');

      const title = document.getElementById('feedback-modal-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Share Feedback or Suggestion');
    });

    it('has accessible close button and dismisses on Escape key', () => {
      const onClose = vi.fn();
      render(<FeedbackModal isOpen={true} onClose={onClose} currentUser={mockUser} />);

      const closeBtn = screen.getByRole('button', { name: 'Close modal' });
      expect(closeBtn).toBeInTheDocument();

      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(2);
    });
  });

  describe('InviteModal a11y', () => {
    it('has role="dialog", aria-modal="true", and aria-labelledby matching header', () => {
      const onClose = vi.fn();
      render(<InviteModal isOpen={true} onClose={onClose} currentUser={mockUser} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'invite-modal-title');

      const title = document.getElementById('invite-modal-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Invite Classmates & Library Flyer');
    });

    it('has accessible close button and dismisses on Escape key', () => {
      const onClose = vi.fn();
      render(<InviteModal isOpen={true} onClose={onClose} currentUser={mockUser} />);

      const closeBtn = screen.getByRole('button', { name: 'Close modal' });
      expect(closeBtn).toBeInTheDocument();

      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(2);
    });
  });

  describe('EditProfileModal a11y', () => {
    it('has role="dialog", aria-modal="true", and aria-labelledby matching header', () => {
      const onClose = vi.fn();
      render(
        <EditProfileModal
          isOpen={true}
          currentUser={mockUser}
          onUpdateUser={vi.fn()}
          onClose={onClose}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'edit-profile-title');

      const title = document.getElementById('edit-profile-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Edit Profile & Avatar');
    });

    it('has accessible close button and dismisses on Escape key', () => {
      const onClose = vi.fn();
      render(
        <EditProfileModal
          isOpen={true}
          currentUser={mockUser}
          onUpdateUser={vi.fn()}
          onClose={onClose}
        />
      );

      const closeBtn = screen.getByRole('button', { name: 'Close modal' });
      expect(closeBtn).toBeInTheDocument();

      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(2);
    });
  });

  describe('SchoolSwitchModal a11y', () => {
    it('has role="dialog", aria-modal="true", and aria-labelledby matching header', () => {
      const onClose = vi.fn();
      render(
        <SchoolSwitchModal
          isOpen={true}
          currentUser={mockUser}
          onSelectUser={vi.fn()}
          onClose={onClose}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'school-switch-title');

      const title = document.getElementById('school-switch-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Switch School / Test Gate');
    });

    it('has accessible close button and dismisses on Escape key', () => {
      const onClose = vi.fn();
      render(
        <SchoolSwitchModal
          isOpen={true}
          currentUser={mockUser}
          onSelectUser={vi.fn()}
          onClose={onClose}
        />
      );

      const closeBtn = screen.getByRole('button', { name: 'Close modal' });
      expect(closeBtn).toBeInTheDocument();

      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(2);
    });
  });

  describe('WhyKantoPrepModal a11y', () => {
    it('has role="dialog", aria-modal="true", and aria-labelledby matching header', () => {
      const onClose = vi.fn();
      render(<WhyKantoPrepModal isOpen={true} onClose={onClose} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'why-kantoprep-title');

      const title = document.getElementById('why-kantoprep-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Why KantoPrep Exists');
    });

    it('has accessible close button and dismisses on Escape key', () => {
      const onClose = vi.fn();
      render(<WhyKantoPrepModal isOpen={true} onClose={onClose} />);

      const closeBtn = screen.getByRole('button', { name: 'Close modal' });
      expect(closeBtn).toBeInTheDocument();

      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(2);
    });
  });

  describe('SubjectSurveyModal a11y', () => {
    it('has role="dialog", aria-modal="true", and aria-labelledby matching header', () => {
      const onClose = vi.fn();
      render(
        <SubjectSurveyModal
          isOpen={true}
          currentUser={mockUser}
          onUpdateUser={vi.fn()}
          onClose={onClose}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'subject-survey-title');

      const title = document.getElementById('subject-survey-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('What are you studying?');
    });

    it('has accessible close button and dismisses on Escape key', () => {
      const onClose = vi.fn();
      render(
        <SubjectSurveyModal
          isOpen={true}
          currentUser={mockUser}
          onUpdateUser={vi.fn()}
          onClose={onClose}
        />
      );

      const closeBtn = screen.getByRole('button', { name: 'Close modal' });
      expect(closeBtn).toBeInTheDocument();

      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(2);
    });
  });

  describe('Additional Modals a11y (CalendarPrompt, SafetyReport, SuggestResource)', () => {
    it('CalendarPromptModal has role="dialog", aria-modal="true", and close button aria-label', () => {
      const onClose = vi.fn();
      render(
        <CalendarPromptModal
          isOpen={true}
          group={mockGroup}
          onClose={onClose}
          onOpenChat={vi.fn()}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'calendar-prompt-title');
      expect(screen.getByRole('button', { name: 'Close modal' })).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('SafetyReportModal has role="dialog", aria-modal="true", and close button aria-label', () => {
      const onClose = vi.fn();
      render(
        <SafetyReportModal
          isOpen={true}
          group={mockGroup}
          currentUser={mockUser}
          onClose={onClose}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'safety-report-title');
      expect(screen.getByRole('button', { name: 'Close modal' })).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('SuggestResourceModal has role="dialog", aria-modal="true", and close button aria-label', () => {
      const onClose = vi.fn();
      render(
        <SuggestResourceModal
          isOpen={true}
          currentUser={mockUser}
          onClose={onClose}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'suggest-resource-title');
      expect(screen.getByRole('button', { name: 'Close modal' })).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
