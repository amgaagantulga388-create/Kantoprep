import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  sanitizeInput,
  inspectContentSafety,
  rateLimiter,
  RateLimiter,
} from '@/lib/safety';

describe('Safety & Content Moderation Engine', () => {
  describe('sanitizeInput', () => {
    it('escapes HTML tags and angle brackets (< and >)', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('escapes double and single quotes', () => {
      const input = 'He said "Hello" and \'World\'';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('He said &quot;Hello&quot; and &#x27;World&#x27;');
    });

    it('escapes forward slashes', () => {
      const input = 'path/to/resource';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('path&#x2F;to&#x2F;resource');
    });

    it('trims leading and trailing whitespace', () => {
      const input = '   hello world   ';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('hello world');
    });

    it('handles empty and falsy input gracefully', () => {
      expect(sanitizeInput('')).toBe('');
      // @ts-expect-error testing null input
      expect(sanitizeInput(null)).toBe('');
      // @ts-expect-error testing undefined input
      expect(sanitizeInput(undefined)).toBe('');
    });

    it('sanitizes complex nested HTML and malicious payloads', () => {
      const complexPayload = ' <img src="x" onerror="alert(\'pwned\')" /> ';
      const sanitized = sanitizeInput(complexPayload);
      expect(sanitized).toBe(
        '&lt;img src=&quot;x&quot; onerror=&quot;alert(&#x27;pwned&#x27;)&quot; &#x2F;&gt;'
      );
    });

    it('preserves regular alphanumeric text and safe punctuation', () => {
      const safeText = 'Tokyo Metropolitan Central Library - Room 4B!';
      expect(sanitizeInput(safeText)).toBe(safeText);
    });
  });

  describe('inspectContentSafety', () => {
    describe('Academic discussion (safe)', () => {
      it('allows normal academic study group invitations at public libraries', () => {
        const text =
          'Let\'s meet at Tokyo Metropolitan Central Library for Math HL Paper 2';
        const result = inspectContentSafety(text);

        expect(result.safe).toBe(true);
        expect(result.severity).toBe('none');
        expect(result.category).toBeUndefined();
        expect(result.sanitizedText).toBe(
          'Let&#x27;s meet at Tokyo Metropolitan Central Library for Math HL Paper 2'
        );
      });

      it('allows questions about past papers and syllabus topics', () => {
        const text =
          'Can anyone explain Question 3 on the 2023 Chemistry HL paper?';
        const result = inspectContentSafety(text);

        expect(result.safe).toBe(true);
        expect(result.severity).toBe('none');
      });

      it('allows legitimate discussion of internal assessments without trading', () => {
        const text =
          'Looking for a study partner to brainstorm Physics IA topics together';
        const result = inspectContentSafety(text);

        expect(result.safe).toBe(true);
        expect(result.severity).toBe('none');
      });
    });

    describe('PII phone number detection', () => {
      it('flags Japanese mobile phone numbers (090-1234-5678) as warning with category pii_phone', () => {
        const text = 'Call me at 090-1234-5678 to confirm meetup';
        const result = inspectContentSafety(text);

        expect(result.safe).toBe(false);
        expect(result.severity).toBe('warning');
        expect(result.category).toBe('pii_phone');
        expect(result.message).toContain('Privacy Notice');
        expect(result.sanitizedText).toBe(sanitizeInput(text));
      });

      it('flags international formatted phone numbers (+81 80 9876 5432)', () => {
        const text = 'My WhatsApp is +81 80 9876 5432';
        const result = inspectContentSafety(text);

        expect(result.safe).toBe(false);
        expect(result.severity).toBe('warning');
        expect(result.category).toBe('pii_phone');
      });

      it('flags continuous digit phone numbers without hyphens', () => {
        const text = 'Reach me at 08012345678';
        const result = inspectContentSafety(text);

        expect(result.safe).toBe(false);
        expect(result.severity).toBe('warning');
        expect(result.category).toBe('pii_phone');
      });

      it('flags Tokyo landline telephone numbers ((03) 1234-5678)', () => {
        const text = 'Our landline is (03) 1234-5678';
        const result = inspectContentSafety(text);

        expect(result.safe).toBe(false);
        expect(result.severity).toBe('warning');
        expect(result.category).toBe('pii_phone');
      });

      it('does not flag standard dates or small numbers as phone numbers', () => {
        const text = 'Exam on 2024-11-15 from 09:00 to 12:00 in Room 101';
        const result = inspectContentSafety(text);

        expect(result.safe).toBe(true);
        expect(result.severity).toBe('none');
      });
    });

    describe('Academic dishonesty prevention', () => {
      it('blocks requests asking for leaked exam papers', () => {
        const text = 'Does anyone have leaked exam papers for May 2024?';
        const result = inspectContentSafety(text);

        expect(result.safe).toBe(false);
        expect(result.severity).toBe('blocked');
        expect(result.category).toBe('academic_dishonesty');
        expect(result.message).toContain('Academic Honesty Alert');
      });

      it('blocks offers to buy IAs or coursework ("buy my ia")', () => {
        const text = 'I got a 7, buy my ia for $50';
        const result = inspectContentSafety(text);

        expect(result.safe).toBe(false);
        expect(result.severity).toBe('blocked');
        expect(result.category).toBe('academic_dishonesty');
      });

      it('blocks paying for essays or assignments ("pay for essay")', () => {
        const text = 'Will pay for essay help before midnight deadline';
        const result = inspectContentSafety(text);

        expect(result.safe).toBe(false);
        expect(result.severity).toBe('blocked');
        expect(result.category).toBe('academic_dishonesty');
      });

      it('blocks solicitations for unreleased exams ("unreleased exam")', () => {
        const text = 'Looking for an unreleased exam markscheme';
        const result = inspectContentSafety(text);

        expect(result.safe).toBe(false);
        expect(result.severity).toBe('blocked');
        expect(result.category).toBe('academic_dishonesty');
      });

      it('blocks ghostwriting requests ("write my ia", "write my essay")', () => {
        const result1 = inspectContentSafety('Can someone write my ia?');
        expect(result1.safe).toBe(false);
        expect(result1.severity).toBe('blocked');
        expect(result1.category).toBe('academic_dishonesty');

        const result2 = inspectContentSafety('Need someone to write my essay');
        expect(result2.safe).toBe(false);
        expect(result2.severity).toBe('blocked');
        expect(result2.category).toBe('academic_dishonesty');
      });

      it('blocks test bank leaking or trading', () => {
        const text = 'Anyone want to trade test bank leak?';
        const result = inspectContentSafety(text);

        expect(result.safe).toBe(false);
        expect(result.severity).toBe('blocked');
        expect(result.category).toBe('academic_dishonesty');
      });

      it('blocks plural variations and assessment trading ("leaked papers", "buy my ias", "pay for essays", "unreleased exams")', () => {
        const variants = [
          'Does anyone have leaked papers?',
          'buy my ias cheap',
          'willing to pay for essays',
          'do you have unreleased exams?',
          'test bank leaks available',
        ];
        for (const variant of variants) {
          const result = inspectContentSafety(variant);
          expect(result.safe).toBe(false);
          expect(result.severity).toBe('blocked');
          expect(result.category).toBe('academic_dishonesty');
        }
      });
    });

    describe('Harassment and profanity filtering', () => {
      it('blocks profanity and insulting language', () => {
        const insults = ['fuck off', 'you are a bitch', 'what an asshole', 'stop being a dick'];
        for (const insult of insults) {
          const result = inspectContentSafety(insult);
          expect(result.safe).toBe(false);
          expect(result.severity).toBe('blocked');
          expect(result.category).toBe('harassment');
          expect(result.message).toContain('violates our student community safety code');
        }
      });

      it('blocks self-harm directives and toxic harassment ("kys", "kill yourself")', () => {
        const resultKys = inspectContentSafety('go kys');
        expect(resultKys.safe).toBe(false);
        expect(resultKys.severity).toBe('blocked');
        expect(resultKys.category).toBe('harassment');

        const resultKill = inspectContentSafety('just kill yourself');
        expect(resultKill.safe).toBe(false);
        expect(resultKill.severity).toBe('blocked');
        expect(resultKill.category).toBe('harassment');
      });
    });

    describe('Unsafe private residence locations', () => {
      it('flags private residence invitations ("come over to my house")', () => {
        const text = 'Hey everyone, come over to my house for study session';
        const result = inspectContentSafety(text);

        expect(result.safe).toBe(false);
        expect(result.severity).toBe('warning');
        expect(result.category).toBe('unsafe_location');
        expect(result.message).toContain('Student Safety Reminder');
      });

      it('flags apartment meetup suggestions ("at my apartment")', () => {
        const text = 'Let us study at my apartment this Saturday';
        const result = inspectContentSafety(text);

        expect(result.safe).toBe(false);
        expect(result.severity).toBe('warning');
        expect(result.category).toBe('unsafe_location');
      });

      it('flags private home location declarations ("my address is ...")', () => {
        const text = 'My address is 3-2-1 Minato-ku, come at 2pm';
        const result = inspectContentSafety(text);

        expect(result.safe).toBe(false);
        expect(result.severity).toBe('warning');
        expect(result.category).toBe('unsafe_location');
      });

      it('flags informal residence references ("come over to my place", "come to my place")', () => {
        const text1 = 'come over to my place to study';
        const result1 = inspectContentSafety(text1);
        expect(result1.safe).toBe(false);
        expect(result1.severity).toBe('warning');
        expect(result1.category).toBe('unsafe_location');

        const text2 = 'come to my place';
        const result2 = inspectContentSafety(text2);
        expect(result2.safe).toBe(false);
        expect(result2.severity).toBe('warning');
        expect(result2.category).toBe('unsafe_location');
      });
    });

    describe('Precedence & edge cases', () => {
      it('prioritizes academic dishonesty (blocked) over phone number warning', () => {
        const text = 'buy my ia, call 090-1234-5678';
        const result = inspectContentSafety(text);

        expect(result.safe).toBe(false);
        expect(result.severity).toBe('blocked');
        expect(result.category).toBe('academic_dishonesty');
      });

      it('prioritizes harassment (blocked) over unsafe location warning', () => {
        const text = 'fuck you, come over to my house';
        const result = inspectContentSafety(text);

        expect(result.safe).toBe(false);
        expect(result.severity).toBe('blocked');
        expect(result.category).toBe('harassment');
      });

      it('handles empty text safely', () => {
        const result = inspectContentSafety('');
        expect(result.safe).toBe(true);
        expect(result.severity).toBe('none');
        expect(result.sanitizedText).toBe('');
      });
    });
  });

  describe('rateLimiter', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns limited: false and waitSeconds: 0 on initial call', () => {
      const key = `user_init_${Date.now()}`;
      const res = rateLimiter.isRateLimited(key, 5000);

      expect(res.limited).toBe(false);
      expect(res.waitSeconds).toBe(0);
    });

    it('returns limited: true and waitSeconds > 0 on subsequent immediate call within cooldownMs', () => {
      const key = `user_rapid_${Date.now()}`;
      const first = rateLimiter.isRateLimited(key, 5000);
      expect(first.limited).toBe(false);

      // Advance by 1 second (1000ms < 5000ms cooldown)
      vi.advanceTimersByTime(1000);

      const second = rateLimiter.isRateLimited(key, 5000);
      expect(second.limited).toBe(true);
      expect(second.waitSeconds).toBe(4);
    });

    it('tracks different keys independently without cross-user throttling', () => {
      const userA = `user_a_${Date.now()}`;
      const userB = `user_b_${Date.now()}`;

      const resA1 = rateLimiter.isRateLimited(userA, 5000);
      expect(resA1.limited).toBe(false);

      const resA2 = rateLimiter.isRateLimited(userA, 5000);
      expect(resA2.limited).toBe(true);

      // User B should NOT be limited
      const resB1 = rateLimiter.isRateLimited(userB, 5000);
      expect(resB1.limited).toBe(false);
      expect(resB1.waitSeconds).toBe(0);
    });

    it('allows action again once cooldown has elapsed', () => {
      const key = `user_cooldown_${Date.now()}`;

      const first = rateLimiter.isRateLimited(key, 3000);
      expect(first.limited).toBe(false);

      // 1.5 seconds in: still limited
      vi.advanceTimersByTime(1500);
      const intermediate = rateLimiter.isRateLimited(key, 3000);
      expect(intermediate.limited).toBe(true);
      expect(intermediate.waitSeconds).toBe(2);

      // Advance past the 3000ms cooldown (another 2000ms, total 3500ms)
      vi.advanceTimersByTime(2000);
      const afterCooldown = rateLimiter.isRateLimited(key, 3000);
      expect(afterCooldown.limited).toBe(false);
      expect(afterCooldown.waitSeconds).toBe(0);
    });

    it('supports standalone RateLimiter instances and reset() method', () => {
      const customLimiter = new RateLimiter();
      const key = 'custom_key_1';

      expect(customLimiter.isRateLimited(key, 5000).limited).toBe(false);
      expect(customLimiter.isRateLimited(key, 5000).limited).toBe(true);

      // Reset specific key
      customLimiter.reset(key);
      expect(customLimiter.isRateLimited(key, 5000).limited).toBe(false);

      // Reset all keys
      expect(customLimiter.isRateLimited(key, 5000).limited).toBe(true);
      customLimiter.reset();
      expect(customLimiter.isRateLimited(key, 5000).limited).toBe(false);
    });
  });
});
