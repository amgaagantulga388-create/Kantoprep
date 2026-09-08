import { describe, it, expect } from 'vitest';
import {
  OFFICIAL_EXAM_SCHEDULES,
  calculateDaysRemaining,
  getNextOfficialSession,
  ExamSessionSchedule,
} from '@/lib/examSchedule';
import { Curriculum } from '@/types';

describe('Task 4: Exam Schedule & D-Day Radar Unit Tests', () => {
  describe('Authoritative Exam Schedules (OFFICIAL_EXAM_SCHEDULES)', () => {
    const requiredCurricula: Curriculum[] = ['SAT_ACT', 'IB', 'AP', 'IGCSE'];

    it('contains all 4 authoritative curriculum tracks', () => {
      requiredCurricula.forEach((curriculum) => {
        expect(OFFICIAL_EXAM_SCHEDULES[curriculum]).toBeDefined();
        expect(OFFICIAL_EXAM_SCHEDULES[curriculum].curriculum).toBe(curriculum);
      });
    });

    it('provides valid authority credentials and verified academic year for each curriculum', () => {
      requiredCurricula.forEach((curriculum) => {
        const schedule = OFFICIAL_EXAM_SCHEDULES[curriculum];

        expect(schedule.authorityName).toBeDefined();
        expect(schedule.authorityName.trim().length).toBeGreaterThan(0);

        expect(schedule.authorityUrl).toBeDefined();
        expect(schedule.authorityUrl.startsWith('https://')).toBe(true);

        expect(schedule.verifiedAcademicYear).toBeDefined();
        expect(schedule.verifiedAcademicYear).toMatch(/\d{4}.*\d{4}/);
      });
    });

    it('contains non-empty sessions with valid ISO dates and unique IDs per curriculum', () => {
      requiredCurricula.forEach((curriculum) => {
        const schedule = OFFICIAL_EXAM_SCHEDULES[curriculum];
        expect(schedule.sessions.length).toBeGreaterThan(0);

        const sessionIds = new Set<string>();

        schedule.sessions.forEach((session: ExamSessionSchedule) => {
          // ID check
          expect(session.id).toBeDefined();
          expect(session.id.trim().length).toBeGreaterThan(0);
          expect(sessionIds.has(session.id)).toBe(false);
          sessionIds.add(session.id);

          // Name check
          expect(session.name).toBeDefined();
          expect(session.name.trim().length).toBeGreaterThan(0);

          // Test date ISO format validation
          expect(session.testDate).toBeDefined();
          const parsedDate = new Date(session.testDate);
          expect(isNaN(parsedDate.getTime())).toBe(false);
          expect(session.testDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

          // Optional registration deadline format check if present
          if (session.registrationDeadline) {
            const parsedDeadline = new Date(session.registrationDeadline);
            expect(isNaN(parsedDeadline.getTime())).toBe(false);
          }
        });
      });
    });

    it('maintains chronological ordering of sessions in each curriculum', () => {
      requiredCurricula.forEach((curriculum) => {
        const sessions = OFFICIAL_EXAM_SCHEDULES[curriculum].sessions;
        for (let i = 0; i < sessions.length - 1; i++) {
          const current = new Date(sessions[i].testDate).getTime();
          const next = new Date(sessions[i + 1].testDate).getTime();
          expect(next).toBeGreaterThanOrEqual(current);
        }
      });
    });
  });

  describe('Countdown Engine (calculateDaysRemaining)', () => {
    it('returns a positive integer for future dates', () => {
      const reference = new Date('2026-09-01T08:30:00+09:00');
      const futureDate = new Date('2026-09-12T08:30:00+09:00');

      const days = calculateDaysRemaining(futureDate, reference);
      expect(days).toBe(11);
      expect(Number.isInteger(days)).toBe(true);
      expect(days).toBeGreaterThan(0);
    });

    it('returns 0 for the current date / same timestamp', () => {
      const today = new Date('2026-09-09T10:00:00Z');
      expect(calculateDaysRemaining(today, today)).toBe(0);

      // Default reference date test
      const now = new Date();
      expect(calculateDaysRemaining(now)).toBe(0);
      expect(Object.is(calculateDaysRemaining(now), -0)).toBe(false);
    });

    it('returns a negative integer for past dates', () => {
      const reference = new Date('2026-09-12T08:30:00+09:00');
      const pastDate = new Date('2026-09-01T08:30:00+09:00');

      const days = calculateDaysRemaining(pastDate, reference);
      expect(days).toBe(-11);
      expect(Number.isInteger(days)).toBe(true);
      expect(days).toBeLessThan(0);
    });

    it('works seamlessly with both string ISO format and Date object inputs', () => {
      const reference = new Date('2026-09-01T08:30:00+09:00');
      const isoString = '2026-09-12T08:30:00+09:00';
      const dateObject = new Date(isoString);

      const daysFromString = calculateDaysRemaining(isoString, reference);
      const daysFromDate = calculateDaysRemaining(dateObject, reference);

      expect(daysFromString).toBe(11);
      expect(daysFromDate).toBe(11);
      expect(daysFromString).toEqual(daysFromDate);
    });

    it('handles invalid dates gracefully without returning NaN', () => {
      const validRef = new Date('2026-09-01T00:00:00Z');

      expect(calculateDaysRemaining('invalid-date-string', validRef)).toBe(0);
      expect(calculateDaysRemaining('', validRef)).toBe(0);
      expect(calculateDaysRemaining(new Date(NaN), validRef)).toBe(0);
      expect(calculateDaysRemaining('2026-09-12T08:30:00Z', new Date(NaN))).toBe(0);
    });
  });

  describe('Session Resolution Engine (getNextOfficialSession)', () => {
    it('correctly selects the next upcoming session given a reference date', () => {
      // On Sept 1, 2026: SAT next session should be Sept 12, 2026
      const refDate = new Date('2026-09-01T00:00:00+09:00');
      const satSession = getNextOfficialSession('SAT_ACT', refDate);

      expect(satSession).toBeDefined();
      expect(satSession.id).toBe('sat-2026-09');
      expect(satSession.name).toBe('September 2026 Administration');

      // IB next session on Sept 1, 2026 should be November 2026 Retake
      const ibSession = getNextOfficialSession('IB', refDate);
      expect(ibSession.id).toBe('ib-2026-nov');

      // AP next session on Sept 1, 2026 should be May 2027 Week 1
      const apSession = getNextOfficialSession('AP', refDate);
      expect(apSession.id).toBe('ap-2027-may-w1');

      // IGCSE next session on Sept 1, 2026 should be October 2026 Series
      const igcseSession = getNextOfficialSession('IGCSE', refDate);
      expect(igcseSession.id).toBe('igcse-2026-oct');
    });

    it('advances to subsequent session once current session has passed', () => {
      // After Sept 12, 2026 SAT has passed (e.g. Sept 15, 2026)
      const afterSeptSat = new Date('2026-09-15T00:00:00+09:00');
      const satSession = getNextOfficialSession('SAT_ACT', afterSeptSat);

      expect(satSession.id).toBe('sat-2026-10');
      expect(satSession.name).toBe('October 2026 Administration');
    });

    it('returns the requested session when overrideSessionId is provided and exists', () => {
      const refDate = new Date('2026-09-01T00:00:00+09:00');
      const springSession = getNextOfficialSession('SAT_ACT', refDate, 'sat-2027-03');

      expect(springSession).toBeDefined();
      expect(springSession.id).toBe('sat-2027-03');
      expect(springSession.name).toBe('March 2027 Administration');
    });

    it('falls back to chronological next session if overrideSessionId is not found', () => {
      const refDate = new Date('2026-09-01T00:00:00+09:00');
      const session = getNextOfficialSession('SAT_ACT', refDate, 'non-existent-session-id');

      expect(session).toBeDefined();
      expect(session.id).toBe('sat-2026-09');
    });

    it('rolls forward by 1 year with "-next-year" suffix when all sessions have passed (e.g. 2030)', () => {
      const distantFuture = new Date('2030-01-01T00:00:00+09:00');

      const satNextCycle = getNextOfficialSession('SAT_ACT', distantFuture);
      expect(satNextCycle.id).toBe('sat-2027-06-next-year');
      expect(satNextCycle.name).toContain('(Next Cycle)');
      const satDate = new Date(satNextCycle.testDate);
      expect(satDate.getFullYear()).toBe(2028);

      const ibNextCycle = getNextOfficialSession('IB', distantFuture);
      expect(ibNextCycle.id).toBe('ib-2027-may-next-year');
      expect(ibNextCycle.name).toContain('(Next Cycle)');
      const ibDate = new Date(ibNextCycle.testDate);
      expect(ibDate.getFullYear()).toBe(2028);
    });

    it('handles unknown curriculum with safe fallback', () => {
      const refDate = new Date('2026-09-01T00:00:00+09:00');
      const unknownCurriculum = 'UNKNOWN' as unknown as Curriculum;
      const fallbackSession = getNextOfficialSession(unknownCurriculum, refDate);

      expect(fallbackSession).toBeDefined();
      expect(fallbackSession.id).toBe('fallback');
      expect(fallbackSession.name).toContain('UNKNOWN');
      expect(isNaN(new Date(fallbackSession.testDate).getTime())).toBe(false);
    });
  });
});
