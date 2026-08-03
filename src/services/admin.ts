import { supabase } from '../lib/supabase';
import type { Tables, TablesUpdate } from '../lib/database.types';

export type ProfileRow = Tables<'profiles'>;
export type RedemptionRequestRow = Tables<'points_redemption_requests'>;
export type GiftRedemptionRow = Tables<'gift_redemptions'>;
export type GiftRow = Tables<'gift_catalogue'>;

/** Every function here requires the signed-in user to have role='admin' — enforced by RLS on every table touched. */

export async function listApplicators(): Promise<ProfileRow[]> {
  const { data, error } = await supabase.from('profiles').select('*').eq('role', 'applicator').order('points', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listAllRedemptions(): Promise<(RedemptionRequestRow & { user: ProfileRow | null })[]> {
  const { data, error } = await supabase
    .from('points_redemption_requests')
    .select('*, profiles!points_redemption_requests_user_id_fkey(*)')
    .order('requested_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({ ...row, user: row.profiles ?? null }));
}

export async function listPendingRedemptions(): Promise<RedemptionRequestRow[]> {
  const { data, error } = await supabase
    .from('points_redemption_requests')
    .select('*')
    .eq('status', 'pending')
    .order('requested_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Approves/rejects/marks-paid a Points redemption. Rejections refund the points that were deducted up front. */
export async function decideRedemption(id: string, decision: 'approved' | 'rejected' | 'paid'): Promise<RedemptionRequestRow> {
  const { data: auth } = await supabase.auth.getUser();
  const { data: existing, error: getErr } = await supabase
    .from('points_redemption_requests')
    .select('*')
    .eq('id', id)
    .single();
  if (getErr) throw getErr;

  const { data, error } = await supabase
    .from('points_redemption_requests')
    .update({ status: decision, decided_at: new Date().toISOString(), decided_by: auth.user?.id })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;

  if (decision === 'rejected' && existing.status === 'pending') {
    const { data: profile } = await supabase.from('profiles').select('points').eq('id', existing.user_id).single();
    await supabase.from('profiles').update({ points: (profile?.points ?? 0) + existing.amount }).eq('id', existing.user_id);
    await supabase.from('points_ledger').insert({
      user_id: existing.user_id,
      entry_type: 'adjustment',
      amount: existing.amount,
      ref_table: 'points_redemption_requests',
      ref_id: existing.id,
    });
  }
  return data;
}

export async function listGiftRedemptions(status?: 'pending' | 'shipped' | 'delivered'): Promise<
  (GiftRedemptionRow & { gift: GiftRow | null; user: ProfileRow | null })[]
> {
  let query = supabase.from('gift_redemptions').select('*, gift_catalogue(*), profiles!gift_redemptions_user_id_fkey(*)');
  if (status) query = query.eq('status', status);
  const { data, error } = await query.order('requested_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({ ...row, gift: row.gift_catalogue ?? null, user: row.profiles ?? null }));
}

/** Updates a gift claim's fulfillment status (pending → shipped → delivered), optionally attaching proof. */
export async function updateGiftRedemptionStatus(
  id: string,
  status: 'shipped' | 'delivered',
  proofUrl?: string
): Promise<GiftRedemptionRow> {
  const { data: auth } = await supabase.auth.getUser();
  const patch: TablesUpdate<'gift_redemptions'> = {
    status,
    updated_by: auth.user?.id,
    updated_at: new Date().toISOString(),
  };
  if (proofUrl) patch.proof_url = proofUrl;
  if (status === 'shipped') patch.shipped_at = new Date().toISOString();
  if (status === 'delivered') patch.delivered_at = new Date().toISOString();

  const { data, error } = await supabase.from('gift_redemptions').update(patch).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

export type UserLedgerSummary = {
  profile: ProfileRow;
  pointsLedger: Tables<'points_ledger'>[];
  runsLedger: Tables<'runs_ledger'>[];
  commissionEarned: Tables<'commission_ledger'>[];
  scans: Tables<'scan_transactions'>[];
  redemptions: RedemptionRequestRow[];
  giftClaims: (GiftRedemptionRow & { gift: GiftRow | null })[];
};

/** Full-access lookup for dispute resolution: every ledger for one person, found by mobile number. Admin-only (RLS-enforced). */
export async function getUserLedgerByMobile(mobileNumber: string): Promise<UserLedgerSummary | null> {
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('mobile_number', mobileNumber)
    .maybeSingle();
  if (profileErr) throw profileErr;
  if (!profile) return null;

  const [pointsLedger, runsLedger, commissionEarned, scans, redemptions, giftClaims] = await Promise.all([
    supabase.from('points_ledger').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }),
    supabase.from('runs_ledger').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }),
    supabase.from('commission_ledger').select('*').eq('recipient_id', profile.id).order('created_at', { ascending: false }),
    supabase.from('scan_transactions').select('*').eq('applicator_id', profile.id).order('created_at', { ascending: false }),
    supabase.from('points_redemption_requests').select('*').eq('user_id', profile.id).order('requested_at', { ascending: false }),
    supabase.from('gift_redemptions').select('*, gift_catalogue(*)').eq('user_id', profile.id).order('requested_at', { ascending: false }),
  ]);

  return {
    profile,
    pointsLedger: pointsLedger.data ?? [],
    runsLedger: runsLedger.data ?? [],
    commissionEarned: commissionEarned.data ?? [],
    scans: scans.data ?? [],
    redemptions: redemptions.data ?? [],
    giftClaims: (giftClaims.data ?? []).map((row: any) => ({ ...row, gift: row.gift_catalogue ?? null })),
  };
}

export async function getKpiSummary() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [{ count: scansToday }, { data: monthScans }, { count: pendingRedemptions }] = await Promise.all([
    supabase.from('scan_transactions').select('*', { count: 'exact', head: true }).gte('created_at', startOfDay.toISOString()),
    supabase.from('scan_transactions').select('points_awarded').gte('created_at', startOfMonth.toISOString()),
    supabase.from('points_redemption_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  const pointsIssuedThisMonth = (monthScans ?? []).reduce((sum, s) => sum + Number(s.points_awarded), 0);
  return { scansToday: scansToday ?? 0, pointsIssuedThisMonth, pendingRedemptions: pendingRedemptions ?? 0 };
}
