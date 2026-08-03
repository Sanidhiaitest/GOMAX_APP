import { supabase } from '../lib/supabase';
import type { Tables, TablesUpdate } from '../lib/database.types';

export type Profile = Tables<'profiles'>;

export async function getMyProfile(): Promise<Profile | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', auth.user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateMyProfile(patch: TablesUpdate<'profiles'>): Promise<Profile> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', auth.user.id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

/** Given a referral code, returns the role of the person it belongs to (used to gate which roles a new signup may pick). Works pre-auth via a SECURITY DEFINER RPC — never a direct table read. */
export async function getReferrerRoleByCode(referralCode: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_referrer_role_by_code', { p_referral_code: referralCode });
  if (error) throw error;
  const payload = data as { found: boolean; role?: string };
  return payload.found ? payload.role ?? null : null;
}
