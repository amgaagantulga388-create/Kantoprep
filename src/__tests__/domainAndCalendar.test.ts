import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isSchoolEmailAllowed,
  getSchoolByEmail,
  isSchoolRecognized,
  isSchoolDomainActive,
  ACTIVE_PUBLISH_SCHOOL_DOMAINS,
} from '@/lib/constants';
import { validateSchoolEmail } from '@/lib/supabase';
import {
  generateIcsContent,
  generateGoogleCalendarUrl,
  downloadIcsFile,
} from '@/lib/calendar';
import { StudyGroup } from '@/types';

// Sample mock study group for calendar testing
const createMockGroup = (overrides?: Partial<StudyGroup>): StudyGroup => ({
  id: 'grp_tdd_101',
  title: 'IB Physics HL: Quantum & Nuclear Mechanics Sprint',
  description: 'Solving past paper 2 questions on binding energy and Feynman diagrams.',
  curriculum: 'IB',
  subject: 'Physics HL',
  format: 'past_paper_sprint',
  venueType: 'hiroo_metropolitan_library',
  venueLabel: 'Tokyo Metropolitan Central Library',
  meetingTime: '2026-10-15T16:30:00.000Z',
  durationMinutes: 90,
  maxMembers: 5,
  host: {
    id: 'usr_host_1',
    fullName: 'Yuto Takahashi',
    email: 'yuto.takahashi@bst.ac.jp',
    schoolDomain: 'bst.ac.jp',
    schoolName: 'The British School in Tokyo',
    gradeLevel: 12,
    curriculum: 'IB',
    subjects: ['Physics HL', 'Math AA HL'],
  },
  members: [],
  status: 'open',
  tags: ['Quantum', 'Physics HL', 'Paper 2'],
  createdAt: '2026-10-01T08:00:00.000Z',
  ...overrides,
});

describe('Task 3: School Domain Gatekeeper & Calendar Integration Engine', () => {
  describe('School Domain Gatekeeper (isSchoolEmailAllowed & getSchoolByEmail)', () => {
    const partnerSchools = [
      { domain: 'students.aobajapan.jp', name: 'Aoba-Japan International School', shortName: 'A-JIS', active: true },
      { domain: 'aobajapan.jp', name: 'Aoba-Japan International School', shortName: 'A-JIS', active: true },
      { domain: 'bst.ac.jp', name: 'The British School in Tokyo', shortName: 'BST', active: false },
      { domain: 'asij.ac.jp', name: 'American School in Japan', shortName: 'ASIJ', active: false },
      { domain: 'k-international.ed.jp', name: 'K. International School Tokyo', shortName: 'KIST', active: false },
      { domain: 'smis.ac.jp', name: "St. Mary's International School", shortName: 'SMIS', active: false },
      { domain: 'seisen.com', name: 'Seisen International School', shortName: 'Seisen', active: false },
      { domain: 'issh.ac.jp', name: 'Intl School of the Sacred Heart', shortName: 'ISSH', active: false },
      { domain: 'yis.ac.jp', name: 'Yokohama International School', shortName: 'YIS', active: false },
      { domain: 'saintmaur.ac.jp', name: 'Saint Maur International School', shortName: 'Saint Maur', active: false },
      { domain: 'caj.ac.jp', name: 'Christian Academy in Japan', shortName: 'CAJ', active: false },
    ];

    describe('School Recognition & Experimental Publish Gating', () => {
      partnerSchools.forEach(({ domain, name, shortName, active }) => {
        it(`recognizes school domain @${domain} (${shortName}) and gates access appropriately`, () => {
          const testEmail = `student@${domain}`;
          const school = getSchoolByEmail(testEmail);
          expect(school).toBeDefined();
          expect(school?.domain).toBe(domain);
          expect(school?.shortName).toBe(shortName);
          expect(school?.name).toBe(name);
          expect(isSchoolRecognized(testEmail)).toBe(true);

          if (active) {
            expect(isSchoolEmailAllowed(testEmail)).toBe(true);
            expect(isSchoolDomainActive(domain)).toBe(true);
            expect(ACTIVE_PUBLISH_SCHOOL_DOMAINS).toContain(domain);
            const val = validateSchoolEmail(testEmail);
            expect(val.isValid).toBe(true);
            expect(val.schoolName).toBe(name);
          } else {
            expect(isSchoolEmailAllowed(testEmail)).toBe(false);
            expect(isSchoolDomainActive(domain)).toBe(false);
            const val = validateSchoolEmail(testEmail);
            expect(val.isValid).toBe(false);
            expect(val.isPendingSchool).toBe(true);
            expect(val.error).toContain('Access is currently limited to Aoba-Japan International School');
            expect(val.error).toContain(name);
          }
        });
      });
    });

    describe('Anti-Spoofing & Domain Validation Logic', () => {
      it('rejects suffix domain spoofing (e.g. students.aobajapan.jp.attacker.com)', () => {
        const spoofedEmails = [
          'student@students.aobajapan.jp.attacker.com',
          'student@bst.ac.jp.phishing.org',
          'student@asij.ac.jp.fake-domain.net',
          'student@k-international.ed.jp.evil.co',
        ];

        spoofedEmails.forEach((email) => {
          expect(isSchoolEmailAllowed(email)).toBe(false);
          expect(getSchoolByEmail(email)).toBeUndefined();
        });
      });

      it('rejects prefix / subdomain spoofing (e.g. evil.students.aobajapan.jp)', () => {
        const subSpoofedEmails = [
          'student@evil.students.aobajapan.jp',
          'student@attacker.bst.ac.jp',
          'student@hack.asij.ac.jp',
          'student@spoof.smis.ac.jp',
        ];

        subSpoofedEmails.forEach((email) => {
          expect(isSchoolEmailAllowed(email)).toBe(false);
          expect(getSchoolByEmail(email)).toBeUndefined();
        });
      });

      it('rejects public email providers', () => {
        const publicEmails = [
          'student@gmail.com',
          'student@yahoo.co.jp',
          'student@yahoo.com',
          'student@outlook.com',
          'student@hotmail.com',
          'student@icloud.com',
          'student@protonmail.com',
        ];

        publicEmails.forEach((email) => {
          expect(isSchoolEmailAllowed(email)).toBe(false);
          expect(getSchoolByEmail(email)).toBeUndefined();
        });
      });

      it('strictly extracts domain after the last "@" symbol to prevent delimiter injection', () => {
        // Any attempt with multiple @ or routing through an external host must be rejected
        expect(isSchoolEmailAllowed('student@bst.ac.jp@attacker.com')).toBe(false);
        expect(getSchoolByEmail('student@bst.ac.jp@attacker.com')).toBeUndefined();

        expect(isSchoolEmailAllowed('malicious@evil.com@bst.ac.jp')).toBe(false);
        expect(getSchoolByEmail('malicious@evil.com@bst.ac.jp')).toBeUndefined();
      });

      it('rejects malformed or incomplete email formats', () => {
        const badFormats: (string | null | undefined | number)[] = [
          '',
          '   ',
          'plainaddress',
          '@bst.ac.jp',
          'user@',
          'user@ ',
          'user name@bst.ac.jp',
          'user@ bst.ac.jp',
          null,
          undefined,
          12345,
        ];

        badFormats.forEach((email) => {
          expect(isSchoolEmailAllowed(email as string)).toBe(false);
          expect(getSchoolByEmail(email as string)).toBeUndefined();
        });
      });

      it('handles case insensitivity seamlessly', () => {
        const upperEmails = [
          'STUDENT@STUDENTS.AOBAJAPAN.JP',
          'ADMIN@AOBAJAPAN.JP',
        ];

        upperEmails.forEach((email) => {
          expect(isSchoolEmailAllowed(email)).toBe(true);
          expect(getSchoolByEmail(email)).toBeDefined();
        });

        // Partner schools recognition is also case-insensitive
        expect(getSchoolByEmail('USER@BST.AC.JP')).toBeDefined();
        expect(getSchoolByEmail('ALEX@ASIJ.AC.JP')).toBeDefined();
      });

      it('trims leading and trailing whitespace', () => {
        const whitespaceEmails = [
          '  student@students.aobajapan.jp  ',
          '\tstudent@aobajapan.jp\n',
        ];

        whitespaceEmails.forEach((email) => {
          expect(isSchoolEmailAllowed(email)).toBe(true);
          expect(getSchoolByEmail(email)).toBeDefined();
        });

        // Partner schools recognition trims whitespace
        expect(getSchoolByEmail('  student@bst.ac.jp  ')).toBeDefined();
        expect(getSchoolByEmail('   kenji@yis.ac.jp ')).toBeDefined();
      });
    });
  });

  describe('Calendar Integration Engine', () => {
    describe('generateIcsContent (RFC 5545 iCalendar standard)', () => {
      it('builds RFC 5545 compliant structure with all required headers and tags', () => {
        const group = createMockGroup();
        const ics = generateIcsContent(group);

        expect(ics).toContain('BEGIN:VCALENDAR');
        expect(ics).toContain('VERSION:2.0');
        expect(ics).toContain('PRODID:-//KantoPrep//Tokyo International School Study Pod//EN');
        expect(ics).toContain('CALSCALE:GREGORIAN');
        expect(ics).toContain('METHOD:PUBLISH');
        expect(ics).toContain('BEGIN:VEVENT');
        expect(ics).toContain('STATUS:CONFIRMED');
        expect(ics).toContain('END:VEVENT');
        expect(ics).toContain('END:VCALENDAR');
      });

      it('uses CRLF (\\r\\n) line endings as strictly mandated by RFC 5545 section 3.1', () => {
        const group = createMockGroup();
        const ics = generateIcsContent(group);

        expect(ics).toContain('\r\n');
        const lines = ics.split('\r\n');
        expect(lines.length).toBeGreaterThan(10);
        expect(lines[0]).toBe('BEGIN:VCALENDAR');
        expect(lines[lines.length - 1]).toBe('END:VCALENDAR');
      });

      it('properly generates UID, SUMMARY, and DESCRIPTION', () => {
        const group = createMockGroup();
        const ics = generateIcsContent(group);

        expect(ics).toContain(`UID:kantoprep-${group.id}@kantoprep.org`);
        expect(ics).toContain(`SUMMARY:[KantoPrep] ${group.title}`);
        expect(ics).toContain(`DESCRIPTION:${group.description}`);
        expect(ics).toContain('Host: Yuto Takahashi (The British School in Tokyo)');
        expect(ics).toContain('Curriculum: IB');
        expect(ics).toContain('Subject: Physics HL');
      });

      it('includes accurate venue label and address in LOCATION', () => {
        const group = createMockGroup({
          venueType: 'hiroo_metropolitan_library',
          venueLabel: 'Tokyo Metropolitan Central Library',
        });
        const ics = generateIcsContent(group);

        expect(ics).toContain('LOCATION:Tokyo Metropolitan Central Library, 5-7-13 Minamiazabu, Minato-ku (Arisugawa-no-miya Park)');
      });

      it('correctly calculates duration between DTSTART and DTEND for a 90-minute session', () => {
        const group = createMockGroup({
          meetingTime: '2026-10-15T16:30:00.000Z',
          durationMinutes: 90,
        });
        const ics = generateIcsContent(group);

        expect(ics).toContain('DTSTART:20261015T163000Z');
        expect(ics).toContain('DTEND:20261015T180000Z');
      });

      it('correctly calculates duration between DTSTART and DTEND for a 60-minute session', () => {
        const group = createMockGroup({
          meetingTime: '2026-10-20T10:00:00.000Z',
          durationMinutes: 60,
        });
        const ics = generateIcsContent(group);

        expect(ics).toContain('DTSTART:20261020T100000Z');
        expect(ics).toContain('DTEND:20261020T110000Z');
      });

      it('falls back gracefully to tomorrow afternoon if meetingTime is not an ISO date', () => {
        const group = createMockGroup({
          meetingTime: 'Tomorrow, 4:30 PM',
          durationMinutes: 45,
        });
        const ics = generateIcsContent(group);

        const startMatch = ics.match(/DTSTART:(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/);
        const endMatch = ics.match(/DTEND:(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/);

        expect(startMatch).not.toBeNull();
        expect(endMatch).not.toBeNull();

        if (startMatch && endMatch) {
          const startDate = new Date(Date.UTC(
            Number(startMatch[1]),
            Number(startMatch[2]) - 1,
            Number(startMatch[3]),
            Number(startMatch[4]),
            Number(startMatch[5]),
            Number(startMatch[6])
          ));
          const endDate = new Date(Date.UTC(
            Number(endMatch[1]),
            Number(endMatch[2]) - 1,
            Number(endMatch[3]),
            Number(endMatch[4]),
            Number(endMatch[5]),
            Number(endMatch[6])
          ));
          const diffMinutes = (endDate.getTime() - startDate.getTime()) / (60 * 1000);
          expect(diffMinutes).toBe(45);
        }
      });
    });

    describe('generateGoogleCalendarUrl', () => {
      it('creates a valid Google Calendar render URL with action=TEMPLATE', () => {
        const group = createMockGroup();
        const urlStr = generateGoogleCalendarUrl(group);

        expect(urlStr.startsWith('https://calendar.google.com/calendar/render?')).toBe(true);

        const url = new URL(urlStr);
        expect(url.searchParams.get('action')).toBe('TEMPLATE');
      });

      it('properly encodes title, dates, details, and location', () => {
        const group = createMockGroup({
          meetingTime: '2026-11-01T14:00:00.000Z',
          durationMinutes: 120,
        });
        const urlStr = generateGoogleCalendarUrl(group);
        const url = new URL(urlStr);

        // Title checks
        const textParam = url.searchParams.get('text');
        expect(textParam).toBe(`[KantoPrep] ${group.title} (${group.subject})`);

        // Dates checks (2 hours = 120 min)
        const datesParam = url.searchParams.get('dates');
        expect(datesParam).toBe('20261101T140000Z/20261101T160000Z');

        // Location checks
        const locationParam = url.searchParams.get('location');
        expect(locationParam).toContain('Tokyo Metropolitan Central Library');
        expect(locationParam).toContain('5-7-13 Minamiazabu');

        // Details checks
        const detailsParam = url.searchParams.get('details');
        expect(detailsParam).toContain('Study Pod:');
        expect(detailsParam).toContain('Subject: Physics HL (IB)');
        expect(detailsParam).toContain('Duration: 120 minutes');
        expect(detailsParam).toContain('Host: Yuto Takahashi (The British School in Tokyo)');
      });
    });

    describe('downloadIcsFile (DOM download trigger)', () => {
      let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
      let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;

      beforeEach(() => {
        createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:http://localhost:3000/mock-uuid');
        revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      });

      afterEach(() => {
        vi.restoreAllMocks();
      });

      it('creates Blob, clicks temporary anchor element, and cleans up URL', () => {
        const group = createMockGroup({ id: 'grp_test_999' });

        const clickSpy = vi.fn();
        const appendChildSpy = vi.spyOn(document.body, 'appendChild');
        const removeChildSpy = vi.spyOn(document.body, 'removeChild');

        // Intercept createElement to spy on click
        const originalCreateElement = document.createElement.bind(document);
        vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
          const el = originalCreateElement(tagName);
          if (tagName === 'a') {
            el.click = clickSpy;
          }
          return el;
        });

        downloadIcsFile(group);

        expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
        const [blobArg] = createObjectURLSpy.mock.calls[0];
        expect(blobArg).toBeInstanceOf(Blob);
        expect(blobArg.type).toBe('text/calendar;charset=utf-8');

        expect(appendChildSpy).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalledTimes(1);
        expect(removeChildSpy).toHaveBeenCalled();
        expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:http://localhost:3000/mock-uuid');
      });
    });
  });
});
