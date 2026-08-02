import { supabase } from '../lib/supabase';
import type { Tables } from '../lib/database.types';

export type ProfileRow = Tables<'profiles'>;
export type DealerBusinessRow = Tables<'dealer_business_details'>;
export type RedemptionRow = Tables<'redemption_requests'>;
export type FraudFlagRow = Tables<'fraud_flags'>;

/** Requires the signed-in user to have role='admin' in profiles (enforced by RLS on every call below). */

export async function listApplicators(): Promise<ProfileRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'mason')
    .order('points', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listPendingDealerApprovals(): Promise<
  (DealerBusinessRow & { profile: ProfileRow | null })[]
> {
  const { data, error } = await supabase
    .from('dealer_business_details')
    .select('*, profile:profiles!dealer_business_details_dealer_id_fkey(*)')
    .eq('verification_status', 'pending');
  if (error) throw error;
  return (data ?? []) as any;
}

export async function approveDealer(dealerId: string): Promise<DealerBusinessRow> {
  const { data, error } = await supabase
    .from('dealer_business_details')
    .update({ verification_status: 'verified' })
    .eq('dealer_id', dealerId)
    .select('*')
    .single();
  if (error) throw error;
  await supabase.from('profiles').update({ kyc_status: 'verified' }).eq('id', dealerId);
  return data;
}

export async function listPendingRedemptions(): Promise<RedemptionRow[]> {
  const { data, error } = await supabase
    .from('redemption_requests')
    .select('*')
    .eq('status', 'pending')
    .order('requested_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Approves or rejects a redemption. Rejections refund the points that were deducted up front. */
export async function decideRedemption(id: string, decision: 'approved' | 'rejected'): Promise<RedemptionRow> {
  const { data: auth } = await supabase.auth.getUser();
  const { data: existing, error: getErr } = await supabase
    .from('redemption_requests')
    .select('*')
    .eq('id', id)
    .single();
  if (getErr) throw getErr;

  const { data, error } = await supabase
    .from('redemption_requests')
    .update({ status: decision, decided_at: new Date().toISOString(), decided_by: auth.user?.id })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;

  if (decision === 'rejected' && existing.status === 'pending') {
    const { data: profile } = await supabase.from('profiles').select('points').eq('id', existing.user_id).single();
    await supabase
      .from('profiles')
      .update({ points: (profile?.points ?? 0) + existing.amount })
      .eq('id', existing.user_id);
  }
  return data;
}

export async function listFraudFlags(): Promise<FraudFlagRow[]> {
  const { data, error } = await supabase.from('fraud_flags').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getKpiSummary() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [{ count: scansToday }, { data: monthOrders }] = await Promise.all([
    supabase
      .from('scan_activity')
      .select('*', { count: 'exact', head: true })
      .gte('scanned_at', startOfDay.toISOString()),
    supabase.from('orders').select('amount').gte('created_at', startOfMonth.toISOString()),
  ]);

  const gmvThisMonth = (monthOrders ?? []).reduce((sum, o) => sum + Number(o.amount), 0);
  return { scansToday: scansToday ?? 0, gmvThisMonth };
}
