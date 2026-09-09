import { createClient } from '@supabase/supabase-js';
import { ALLOWED_SCHOOLS, isSchoolDomainActive } from './constants';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://buzeouqlsajhjhdyxxje.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_InMV5_ySZpzTNcxhfdOZEQ__ad_qtzW';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Safe Supabase client instance
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Hardened validator for school email domains
 * Protects against subdomain spoofing (e.g. bst.ac.jp.attacker.org)
 * and ensures standard RFC format.
 * In this publish phase, access is live for Aoba-Japan International School first;
 * other partner schools will be added soon.
 */
export function validateSchoolEmail(email: string): {
  isValid: boolean;
  schoolName?: string;
  domain?: string;
  error?: string;
  isPendingSchool?: boolean;
} {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required.' };
  }

  const normalized = email.trim().toLowerCase();

  // Basic RFC 5322 regex check
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(normalized)) {
    return { isValid: false, error: 'Please enter a valid school email address (e.g. name@students.aobajapan.jp).' };
  }

  const parts = normalized.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Invalid email structure.' };
  }

  const userPart = parts[0];
  const domainPart = parts[1];

  if (userPart.length < 1 || userPart.length > 64) {
    return { isValid: false, error: 'Username must be between 1 and 64 characters.' };
  }

  // Match against whitelisted Tokyo international school domains
  const matchedSchool = ALLOWED_SCHOOLS.find(
    (s) => s.domain.toLowerCase() === domainPart.toLowerCase()
  );

  if (!matchedSchool) {
    return {
      isValid: false,
      error: `Access Denied: @${domainPart} is not currently an authorized school domain. Please use your official school email (@students.aobajapan.jp).`,
    };
  }

  // Check if school is active for this experimental publish phase
  if (!isSchoolDomainActive(matchedSchool.domain)) {
    return {
      isValid: false,
      schoolName: matchedSchool.name,
      domain: matchedSchool.domain,
      isPendingSchool: true,
      error: `Access is currently limited to Aoba-Japan International School (@students.aobajapan.jp) for this initial experimental publish. Support for ${matchedSchool.name} (@${matchedSchool.domain}) will be enabled soon!`,
    };
  }

  return {
    isValid: true,
    schoolName: matchedSchool.name,
    domain: matchedSchool.domain,
  };
}

/**
 * Send 6-digit OTP verification code via Supabase Auth.
 */
export async function sendSchoolOtp(email: string): Promise<{
  success: boolean;
  message: string;
  isPilotMode: boolean;
}> {
  const check = validateSchoolEmail(email);
  if (!check.isValid) {
    return { success: false, message: check.error || 'Invalid school email', isPilotMode: false };
  }

  // If Supabase credentials are configured in .env.local, send real email code
  if (supabase && isSupabaseConfigured()) {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        return { success: false, message: error.message, isPilotMode: false };
      }

      return {
        success: true,
        message: `6-digit security code sent to ${email}. Please check your inbox.`,
        isPilotMode: false,
      };
    } catch (err: unknown) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to send code.',
        isPilotMode: false,
      };
    }
  }

  // If credentials are not yet configured in .env.local
  return {
    success: false,
    message: 'Email verification service is being connected. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local.',
    isPilotMode: false,
  };
}

/**
 * Verify 6-digit OTP code with Supabase
 */
export async function verifySchoolOtp(
  email: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  if (!token || token.length < 6) {
    return { success: false, message: 'Please enter a 6-digit verification code.' };
  }

  if (supabase && isSupabaseConfigured()) {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        type: 'email',
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Verified successfully!' };
    } catch (err: unknown) {
      return { success: false, message: err instanceof Error ? err.message : 'Verification failed.' };
    }
  }

  return {
    success: false,
    message: 'Email verification service is not active. Please configure Supabase credentials.',
  };
}

