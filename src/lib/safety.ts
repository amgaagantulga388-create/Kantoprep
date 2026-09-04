/**
 * Student Safety & Content Moderation Engine for KantoPrep
 * Guards against:
 * 1. PII leaks (phone numbers, physical home addresses)
 * 2. Academic dishonesty (exam paper leaks, paid IA/EE mills)
 * 3. Profanity & harassment
 * 4. Spam & rapid-fire flood attacks
 */

// Japanese & International phone number regex
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{4}/;

// Academic dishonesty keywords
const ACADEMIC_DISHONESTY_PATTERNS = [
  /\bleak(ed)?\s+(exam|paper|test|markscheme)\b/i,
  /\bbuy\s+(my\s+)?(ia|ee|internal assessment|extended essay|tok|paper)\b/i,
  /\bpay\s+for\s+(ia|ee|homework|essay)\b/i,
  /\bwrite\s+my\s+(ia|ee|essay|paper)\b/i,
  /\bunreleased\s+exam\b/i,
  /\btest\s+bank\s+(leak|trade|sell)\b/i,
];

// Unsafe physical location invitations
const UNSAFE_LOCATION_PATTERNS = [
  /\bcome\s+(over\s+)?to\s+my\s+(house|home|apartment|room|mansion)\b/i,
  /\bat\s+my\s+(house|home|place|apartment)\b/i,
  /\bmy\s+address\s+is\b/i,
];

// Profanity / Harassment blocklist (common harmful patterns)
const HARASSMENT_PATTERNS = [
  /\b(fuck|shit|bitch|asshole|dick|cunt|slut|retard)\b/i,
  /\b(kill\s+yourself|kys)\b/i,
];

export interface SafetyCheckResult {
  safe: boolean;
  severity: 'none' | 'warning' | 'blocked';
  category?: 'pii_phone' | 'unsafe_location' | 'academic_dishonesty' | 'harassment' | 'spam';
  message?: string;
  sanitizedText: string;
}

/**
 * Basic HTML/Script sanitizer
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Inspects a student's proposed message or study session description
 */
export function inspectContentSafety(rawText: string): SafetyCheckResult {
  const sanitized = sanitizeInput(rawText);

  // 1. Check for Academic Dishonesty
  for (const pattern of ACADEMIC_DISHONESTY_PATTERNS) {
    if (pattern.test(rawText)) {
      return {
        safe: false,
        severity: 'blocked',
        category: 'academic_dishonesty',
        message:
          'Academic Honesty Alert: Discussions involving exam leaks, paid work, or unauthorized assessment trading are strictly prohibited across Tokyo schools.',
        sanitizedText: sanitized,
      };
    }
  }

  // 2. Check for Harassment / Severe profanity
  for (const pattern of HARASSMENT_PATTERNS) {
    if (pattern.test(rawText)) {
      return {
        safe: false,
        severity: 'blocked',
        category: 'harassment',
        message: 'Message blocked: Content violates our student community safety code.',
        sanitizedText: sanitized,
      };
    }
  }

  // 3. Check for Unsafe In-Person Location Sharing
  for (const pattern of UNSAFE_LOCATION_PATTERNS) {
    if (pattern.test(rawText)) {
      return {
        safe: false,
        severity: 'warning',
        category: 'unsafe_location',
        message:
          'Student Safety Reminder: For minor protection, study meetups must be held only at verified public libraries or school campuses—never private residences.',
        sanitizedText: sanitized,
      };
    }
  }

  // 4. Check for Phone Number Leaks
  if (PHONE_REGEX.test(rawText) && rawText.replace(/\D/g, '').length >= 10) {
    return {
      safe: false,
      severity: 'warning',
      category: 'pii_phone',
      message:
        'Privacy Notice: Please avoid sharing personal phone numbers in group chat. Keep initial communications inside KantoPrep.',
      sanitizedText: sanitized,
    };
  }

  return {
    safe: true,
    severity: 'none',
    sanitizedText: sanitized,
  };
}

/**
 * Rate limiting state machine to prevent flooding / spam
 */
class RateLimiter {
  private lastActionTimes: Map<string, number> = new Map();

  isRateLimited(key: string, cooldownMs: number): { limited: boolean; waitSeconds: number } {
    const now = Date.now();
    const lastTime = this.lastActionTimes.get(key) || 0;
    const elapsed = now - lastTime;

    if (elapsed < cooldownMs) {
      const waitSeconds = Math.ceil((cooldownMs - elapsed) / 1000);
      return { limited: true, waitSeconds };
    }

    this.lastActionTimes.set(key, now);
    return { limited: false, waitSeconds: 0 };
  }
}

export const rateLimiter = new RateLimiter();
