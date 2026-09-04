import { createClient } from '@supabase/supabase-js';
import { ALLOWED_SCHOOLS } from './constants';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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
 */
export function validateSchoolEmail(email: string): {
  isValid: boolean;
  schoolName?: string;
  domain?: string;
  error?: string;
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
      error: `Access Denied: @${domainPart} is not currently an authorized school domain. Please use your official school email (@students.aobajapan.jp, @bst.ac.jp, etc.).`,
    };
  }

  return {
    isValid: true,
    schoolName: matchedSchool.name,
    domain: matchedSchool.domain,
  };
}

/**
 * Send 6-digit OTP verification code via Supabase Free Tier
 * Gracefully falls back to pilot mode if Supabase env vars are not yet configured.
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

  // If Supabase credentials are configured in .env, send real free email code
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
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to send code.', isPilotMode: false };
    }
  }

  // Otherwise, pilot mode: simulate instant delivery for testing
  return {
    success: true,
    message: `Pilot Mode: 6-digit security code generated for ${email}. Enter any 6 digits to verify.`,
    isPilotMode: true,
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
    } catch (err: any) {
      return { success: false, message: err?.message || 'Verification failed.' };
    }
  }

  // Pilot mode verification
  return { success: true, message: 'Pilot verified!' };
}
