import { Curriculum } from '@/types';

export interface ExamSessionSchedule {
  id: string;
  name: string;
  testDate: string; // ISO format: YYYY-MM-DDTHH:mm:ss
  registrationDeadline?: string;
  notes?: string;
  isSchoolDay?: boolean;
}

export interface AuthoritySchedule {
  curriculum: Curriculum;
  authorityName: string;
  authorityUrl: string;
  verifiedAcademicYear: string;
  sessions: ExamSessionSchedule[];
}

/**
 * AUTHORITATIVE EXAM SCHEDULE FOR TOKYO INTERNATIONAL SCHOOLS
 * Verified against official College Board, IBO, and Cambridge portals.
 */
export const OFFICIAL_EXAM_SCHEDULES: Record<Curriculum, AuthoritySchedule> = {
  // ── Digital SAT (College Board International) ──
  SAT_ACT: {
    curriculum: 'SAT_ACT',
    authorityName: 'College Board (SAT Suite of Assessments)',
    authorityUrl: 'https://satsuite.collegeboard.org/sat/dates-deadlines',
    verifiedAcademicYear: '2026–2027',
    sessions: [
      {
        id: 'sat-2026-09',
        name: 'September 2026 Administration',
        testDate: '2026-09-12T08:30:00+09:00',
        registrationDeadline: '2026-08-28',
        notes: 'Digital international test date. Standard test centers in Tokyo.',
      },
      {
        id: 'sat-2026-10',
        name: 'October 2026 Administration',
        testDate: '2026-10-03T08:30:00+09:00',
        registrationDeadline: '2026-09-18',
        notes: 'Primary fall test date for senior university applications (Early Action / ED).',
      },
      {
        id: 'sat-2026-11',
        name: 'November 2026 Administration',
        testDate: '2026-11-07T08:30:00+09:00',
        registrationDeadline: '2026-10-23',
        notes: 'International Digital SAT Saturday sitting.',
      },
      {
        id: 'sat-2026-12',
        name: 'December 2026 Administration',
        testDate: '2026-12-05T08:30:00+09:00',
        registrationDeadline: '2026-11-20',
        notes: 'Final international sitting for Regular Decision US/Canada admissions.',
      },
      {
        id: 'sat-2027-03',
        name: 'March 2027 Administration',
        testDate: '2027-03-06T08:30:00+09:00',
        registrationDeadline: '2027-02-19',
        notes: 'Spring sitting — popular for Grade 11 juniors.',
      },
      {
        id: 'sat-2027-05',
        name: 'May 2027 Administration',
        testDate: '2027-05-01T08:30:00+09:00',
        registrationDeadline: '2027-04-16',
        notes: 'Late spring test date.',
      },
      {
        id: 'sat-2027-06',
        name: 'June 2027 Administration',
        testDate: '2027-06-05T08:30:00+09:00',
        registrationDeadline: '2027-05-21',
        notes: 'End-of-school-year international sitting.',
      },
    ],
  },

  // ── IB Diploma Programme (IBO Official Calendar) ──
  IB: {
    curriculum: 'IB',
    authorityName: 'International Baccalaureate Organization (IBO)',
    authorityUrl: 'https://www.ibo.org/programmes/diploma-programme/assessment-and-exams/',
    verifiedAcademicYear: '2026–2027',
    sessions: [
      {
        id: 'ib-2026-nov',
        name: 'November 2026 Retake / Southern Hemisphere Session',
        testDate: '2026-10-23T09:00:00+09:00',
        notes: 'Exam period runs late October to mid-November across Tokyo exam centers.',
      },
      {
        id: 'ib-2027-may',
        name: 'May 2027 Worldwide Examination Session',
        testDate: '2027-04-26T09:00:00+09:00',
        notes: 'Main written papers (HL/SL Papers 1, 2, 3) for Tokyo graduating classes.',
      },
    ],
  },

  // ── College Board AP Exams ──
  AP: {
    curriculum: 'AP',
    authorityName: 'College Board (AP Central)',
    authorityUrl: 'https://apcentral.collegeboard.org/exam-administration-ordering-scores/exam-dates',
    verifiedAcademicYear: '2026–2027',
    sessions: [
      {
        id: 'ap-2027-may-w1',
        name: 'AP Testing Window — Week 1 & 2',
        testDate: '2027-05-03T08:00:00+09:00',
        notes: 'Standard 2-week testing window (Calculus, Physics, Chem, History, Econ).',
      },
      {
        id: 'ap-2027-may-late',
        name: 'AP Late-Testing Window',
        testDate: '2027-05-17T08:00:00+09:00',
        notes: 'Alternate testing for exam conflicts and emergencies.',
      },
    ],
  },

  // ── Cambridge / Edexcel IGCSE ──
  IGCSE: {
    curriculum: 'IGCSE',
    authorityName: 'Cambridge Assessment International Education (CAIE)',
    authorityUrl: 'https://www.cambridgeinternational.org/exam-administration/cambridge-exams-officers-guide/phase-4-before-the-exams/timetabling-exams/',
    verifiedAcademicYear: '2026–2027',
    sessions: [
      {
        id: 'igcse-2026-oct',
        name: 'October / November 2026 Series',
        testDate: '2026-10-05T09:00:00+09:00',
        notes: 'Autumn series for select subjects and resits in Tokyo.',
      },
      {
        id: 'igcse-2027-may',
        name: 'May / June 2027 Series',
        testDate: '2027-05-03T09:00:00+09:00',
        notes: 'Primary Year 10–11 extended and core paper examination series.',
      },
    ],
  },
};

/**
 * Accurately calculates whole days remaining until targetDate relative to referenceDate.
 * Whole days difference = (targetDate - referenceDate):
 * - Future dates return positive integer.
 * - Current date / same timestamp returns 0.
 * - Past dates return negative integer.
 * - Accepts ISO string or Date object.
 * - Safe against NaN and timezone shifts.
 */
export function calculateDaysRemaining(
  targetDate: Date | string,
  referenceDate: Date = new Date()
): number {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const ref = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);

  if (!target || isNaN(target.getTime()) || !ref || isNaN(ref.getTime())) {
    return 0;
  }

  const diffMs = target.getTime() - ref.getTime();
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const days = Math.round(diffMs / MS_PER_DAY);

  // Normalize -0 to 0 in JavaScript
  return days === 0 ? 0 : days;
}

/**
 * Returns the nearest upcoming official exam session for a given curriculum.
 */
export function getNextOfficialSession(
  curriculum: Curriculum,
  referenceDate: Date = new Date(),
  overrideSessionId?: string
): ExamSessionSchedule {
  const refDate = referenceDate instanceof Date && !isNaN(referenceDate.getTime())
    ? referenceDate
    : new Date();

  const schedule = OFFICIAL_EXAM_SCHEDULES[curriculum];
  if (!schedule || !Array.isArray(schedule.sessions) || schedule.sessions.length === 0) {
    // Fallback if unexpected curriculum
    const fallbackDate = new Date(refDate.getFullYear() + 1, 4, 1, 9, 0, 0);
    return {
      id: 'fallback',
      name: `${curriculum} Upcoming Session`,
      testDate: fallbackDate.toISOString(),
    };
  }

  // If a specific session ID was requested and exists
  if (overrideSessionId) {
    const matched = schedule.sessions.find((s) => s.id === overrideSessionId);
    if (matched) return matched;
  }

  const nowMs = refDate.getTime();

  // Find the earliest session whose testDate is in the future
  for (const session of schedule.sessions) {
    const sessionMs = new Date(session.testDate).getTime();
    if (sessionMs > nowMs) {
      return session;
    }
  }

  // If all hardcoded sessions have passed, return the last one rolled forward 1 year
  const lastSession = schedule.sessions[schedule.sessions.length - 1];
  const rolledDate = new Date(lastSession.testDate);
  rolledDate.setFullYear(rolledDate.getFullYear() + 1);

  return {
    ...lastSession,
    id: `${lastSession.id}-next-year`,
    name: `${lastSession.name} (Next Cycle)`,
    testDate: rolledDate.toISOString(),
  };
}

