import { supabase } from '../lib/supabase';
import type { Tables, TablesUpdate } from '../lib/database.types';

export type ProfileRow = Tables<'profiles'>;
export type RedemptionRequestRow = Tables<'points_redemption_requests'>;
export type GiftRedemptionRow = Tables<'gift_redemptions'>;
export type GiftRow = Tables<'gift_catalogue'>;

/** Every function here requires the signed-in user to have role='admin' — enforced by RLS on every table touched. */

export type DirectoryEntry = ProfileRow & { uplineName: string | null; uplineRole: string | null };

/** Flat list of every user in the system with their direct upline resolved — admin's hierarchy overview. */
export async function listAllUsersDirectory(): Promise<DirectoryEntry[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  const all = data ?? [];
  const byId = new Map(all.map((p) => [p.id, p]));
  return all.map((p) => {
    const referrer = p.referrer_id ? byId.get(p.referrer_id) : undefined;
    return { ...p, uplineName: referrer?.full_name ?? null, uplineRole: referrer?.role ?? null };
  });
}

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
export type TdsCheckResult = {
  tds_applicable: boolean;
  cumulative_fy_value: number;
  tds_rate: number | null;
  tds_amount: number | null;
  pan_on_file: boolean;
};

export async function decideRedemption(
  id: string,
  decision: 'approved' | 'rejected' | 'paid'
): Promise<{ request: RedemptionRequestRow; tds: TdsCheckResult | null }> {
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

  let tds: TdsCheckResult | null = null;
  if (decision === 'approved' || decision === 'paid') {
    const { data: tdsData, error: tdsError } = await supabase.rpc('check_and_record_tds', {
      p_user_id: existing.user_id,
      p_benefit_type: 'points_redemption',
      p_ref_table: 'points_redemption_requests',
      p_ref_id: id,
      p_benefit_value: Number(existing.amount),
    });
    if (!tdsError) tds = tdsData as TdsCheckResult;
  }

  return { request: data, tds };
}

export type GiftInput = {
  name: string;
  description: string;
  runsCost: number;
  stock: number;
  marketValueInr: number | null;
};

export async function listAllGiftsForAdmin(): Promise<GiftRow[]> {
  const { data, error } = await supabase.from('gift_catalogue').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createGift(input: GiftInput): Promise<GiftRow> {
  const { data, error } = await supabase
    .from('gift_catalogue')
    .insert({
      name: input.name,
      description: input.description || null,
      runs_cost: input.runsCost,
      stock: input.stock,
      market_value_inr: input.marketValueInr,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateGift(id: string, input: Partial<GiftInput> & { active?: boolean }): Promise<GiftRow> {
  const patch: TablesUpdate<'gift_catalogue'> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.description !== undefined) patch.description = input.description || null;
  if (input.runsCost !== undefined) patch.runs_cost = input.runsCost;
  if (input.stock !== undefined) patch.stock = input.stock;
  if (input.marketValueInr !== undefined) patch.market_value_inr = input.marketValueInr;
  if (input.active !== undefined) patch.active = input.active;

  const { data, error } = await supabase.from('gift_catalogue').update(patch).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

export type ChallengeRow = Tables<'challenges'>;
export type ChallengeInput = {
  title: string;
  subtitle: string;
  target: number;
  rewardRuns: number;
  rewardLabel: string;
};

export async function listAllChallengesForAdmin(): Promise<ChallengeRow[]> {
  const { data, error } = await supabase.from('challenges').select('*').order('title');
  if (error) throw error;
  return data ?? [];
}

export async function createChallenge(input: ChallengeInput): Promise<ChallengeRow> {
  const { data, error } = await supabase
    .from('challenges')
    .insert({
      title: input.title,
      subtitle: input.subtitle || null,
      target: input.target,
      reward_runs: input.rewardRuns,
      reward_points: 0,
      reward_label: input.rewardLabel || `+${input.rewardRuns} Runs`,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateChallenge(id: string, input: Partial<ChallengeInput> & { active?: boolean }): Promise<ChallengeRow> {
  const patch: TablesUpdate<'challenges'> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.subtitle !== undefined) patch.subtitle = input.subtitle || null;
  if (input.target !== undefined) patch.target = input.target;
  if (input.rewardRuns !== undefined) patch.reward_runs = input.rewardRuns;
  if (input.rewardLabel !== undefined) patch.reward_label = input.rewardLabel;
  if (input.active !== undefined) patch.active = input.active;

  const { data, error } = await supabase.from('challenges').update(patch).eq('id', id).select('*').single();
  if (error) throw error;
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

/** Updates a gift claim's fulfillment status (pending → shipped → delivered), optionally attaching proof. Runs the TDS check on delivery, if the gift has a market value set. */
export async function updateGiftRedemptionStatus(
  id: string,
  status: 'shipped' | 'delivered',
  proofUrl?: string
): Promise<{ redemption: GiftRedemptionRow; tds: TdsCheckResult | null }> {
  const { data: auth } = await supabase.auth.getUser();
  const patch: TablesUpdate<'gift_redemptions'> = {
    status,
    updated_by: auth.user?.id,
    updated_at: new Date().toISOString(),
  };
  if (proofUrl) patch.proof_url = proofUrl;
  if (status === 'shipped') patch.shipped_at = new Date().toISOString();
  if (status === 'delivered') patch.delivered_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('gift_redemptions')
    .update(patch)
    .eq('id', id)
    .select('*, gift_catalogue(market_value_inr)')
    .single();
  if (error) throw error;

  let tds: TdsCheckResult | null = null;
  const marketValue = (data as any).gift_catalogue?.market_value_inr;
  if (status === 'delivered' && marketValue) {
    const { data: tdsData, error: tdsError } = await supabase.rpc('check_and_record_tds', {
      p_user_id: data.user_id,
      p_benefit_type: 'gift_redemption',
      p_ref_table: 'gift_redemptions',
      p_ref_id: id,
      p_benefit_value: Number(marketValue),
    });
    if (!tdsError) tds = tdsData as TdsCheckResult;
  }

  const { gift_catalogue, ...redemption } = data as any;
  return { redemption, tds };
}

export type TdsSummaryEntry = {
  userId: string;
  fullName: string;
  mobileNumber: string;
  panNumber: string | null;
  financialYear: string;
  cumulativeFyValue: number;
  tdsApplicable: boolean;
  latestTdsAmount: number | null;
};

/** Every user's cumulative-this-financial-year benefit value and TDS status, for Admin's compliance overview. */
export async function getTdsSummary(financialYear?: string): Promise<TdsSummaryEntry[]> {
  const { data, error } = await supabase.rpc('get_tds_summary', { p_financial_year: financialYear });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    userId: row.user_id,
    fullName: row.full_name || 'GoMax User',
    mobileNumber: row.mobile_number,
    panNumber: row.pan_number,
    financialYear: row.financial_year,
    cumulativeFyValue: Number(row.cumulative_fy_value),
    tdsApplicable: row.tds_applicable,
    latestTdsAmount: row.latest_tds_amount != null ? Number(row.latest_tds_amount) : null,
  }));
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
