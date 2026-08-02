import { supabase } from '../lib/supabase';

function toE164(mobileNumber: string) {
  const digits = mobileNumber.replace(/[^0-9]/g, '');
  return digits.startsWith('91') ? `+${digits}` : `+91${digits}`;
}

/** Sends an SMS OTP to the given 10-digit Indian mobile number. */
export async function sendOtp(mobileNumber: string) {
  const { error } = await supabase.auth.signInWithOtp({
    phone: toE164(mobileNumber),
  });
  if (error) throw error;
}

/** Verifies the OTP and completes sign-in. Returns the authenticated user id. */
export async function verifyOtp(mobileNumber: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone: toE164(mobileNumber),
    token,
    type: 'sms',
  });
  if (error) throw error;
  return data.user?.id ?? null;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}
