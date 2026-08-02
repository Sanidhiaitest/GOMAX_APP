import { supabase } from '../lib/supabase';
import type { Tables } from '../lib/database.types';

export type ScanRow = Tables<'scan_activity'>;
export type ChallengeRow = Tables<'challenges'>;
export type ChallengeProgressRow = Tables<'challenge_progress'>;
export type BadgeRow = Tables<'badges'>;
export type UserBadgeRow = Tables<'user_badges'>;
export type ScratchCardRow = Tables<'scratch_cards'>;
export type UserScratchCardRow = Tables<'user_scratch_cards'>;
export type RedemptionRow = Tables<'redemption_requests'>;
export type ReferralRow = Tables<'referrals'>;

/** Records a QR-code scan for the signed-in user and credits points to their profile. */
export async function recordScan(params: { productId?: string; qrCode?: string; points: number }) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not authenticated');

  const { data: scan, error: scanErr } = await supabase
    .from('scan_activity')
    .insert({ user_id: auth.user.id, product_id: params.productId, qr_code: params.qrCode, points: params.points })
    .select('*')
    .single();
  if (scanErr) throw scanErr;

  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', auth.user.id)
    .single();
  if (profErr) throw profErr;

  const { error: updErr } = await supabase
    .from('profiles')
    .update({ points: (profile?.points ?? 0) + params.points })
    .eq('id', auth.user.id);
  if (updErr) throw updErr;

  return scan;
}

export async function listMyScans(): Promise<ScanRow[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase
    .from('scan_activity')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('scanned_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listChallenges(): Promise<ChallengeRow[]> {
  const { data, error } = await supabase.from('challenges').select('*').eq('active', true);
  if (error) throw error;
  return data ?? [];
}

export async function listMyChallengeProgress(): Promise<ChallengeProgressRow[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase
    .from('challenge_progress')
    .select('*')
    .eq('user_id', auth.user.id);
  if (error) throw error;
  return data ?? [];
}

export async function listBadges(): Promise<BadgeRow[]> {
  const { data, error } = await supabase.from('badges').select('*');
  if (error) throw error;
  return data ?? [];
}

export async function listMyUnlockedBadges(): Promise<UserBadgeRow[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase.from('user_badges').select('*').eq('user_id', auth.user.id);
  if (error) throw error;
  return data ?? [];
}

export async function listScratchCardTemplates(): Promise<ScratchCardRow[]> {
  const { data, error } = await supabase.from('scratch_cards').select('*').eq('active', true);
  if (error) throw error;
  return data ?? [];
}

export type MyScratchCard = {
  id: string;
  title: string;
  subtitle: string | null;
  reward: number;
  expiresIn: string;
  scratched: boolean;
};

/** Ensures the signed-in user has an instance of every active scratch-card template, then returns them joined. */
export async function ensureMyScratchCards(): Promise<MyScratchCard[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const [{ data: templates }, { data: existing }] = await Promise.all([
    supabase.from('scratch_cards').select('*').eq('active', true),
    supabase.from('user_scratch_cards').select('*').eq('user_id', auth.user.id),
  ]);

  const existingCardIds = new Set((existing ?? []).map((e) => e.card_id));
  const missing = (templates ?? []).filter((t) => !existingCardIds.has(t.id));
  if (missing.length > 0) {
    await supabase
      .from('user_scratch_cards')
      .insert(missing.map((t) => ({ user_id: auth.user!.id, card_id: t.id })));
  }

  const { data: all } = await supabase
    .from('user_scratch_cards')
    .select('*, scratch_cards(*)')
    .eq('user_id', auth.user.id);

  return (all ?? []).map((row: any) => ({
    id: row.id,
    title: row.scratch_cards?.title ?? 'Scratch card',
    subtitle: row.scratch_cards?.subtitle ?? null,
    reward: row.scratch_cards?.reward ?? 0,
    expiresIn: row.scratch_cards?.expires_rule ?? '',
    scratched: row.scratched,
  }));
}

export async function listMyScratchCards(): Promise<UserScratchCardRow[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase
    .from('user_scratch_cards')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function scratchCard(userCardId: string): Promise<UserScratchCardRow> {
  const { data, error } = await supabase
    .from('user_scratch_cards')
    .update({ scratched: true, scratched_at: new Date().toISOString() })
    .eq('id', userCardId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function listLeaderboard(limit = 10) {
  const { data: auth } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, points')
    .eq('role', 'mason')
    .order('points', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((p, i) => ({
    rank: i + 1,
    name: p.id === auth.user?.id ? 'You' : p.full_name || 'GoMax User',
    scans: p.points,
    isYou: p.id === auth.user?.id,
  }));
}

/** Marks a challenge as complete for the signed-in user and credits its reward. */
export async function claimChallenge(challenge: ChallengeRow) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not authenticated');

  await supabase.from('challenge_progress').upsert(
    {
      user_id: auth.user.id,
      challenge_id: challenge.id,
      progress: challenge.target,
      completed_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,challenge_id' }
  );

  if (challenge.reward_points || challenge.reward_runs) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('points, runs')
      .eq('id', auth.user.id)
      .single();
    await supabase
      .from('profiles')
      .update({
        points: (profile?.points ?? 0) + challenge.reward_points,
        runs: (profile?.runs ?? 0) + challenge.reward_runs,
      })
      .eq('id', auth.user.id);
  }
}

const REDEMPTION_AUTO_APPROVE_CEILING = 200;

/** Requests a Points redemption. Amounts under the ceiling auto-approve; the rest queue for admin review. */
export async function redeemPoints(amount: number, upiId: string): Promise<RedemptionRow> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not authenticated');

  const autoApproved = amount < REDEMPTION_AUTO_APPROVE_CEILING;
  const { data: request, error: reqErr } = await supabase
    .from('redemption_requests')
    .insert({ user_id: auth.user.id, amount, upi_id: upiId, status: autoApproved ? 'approved' : 'pending' })
    .select('*')
    .single();
  if (reqErr) throw reqErr;

  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', auth.user.id)
    .single();
  if (profErr) throw profErr;

  const { error: updErr } = await supabase
    .from('profiles')
    .update({ points: Math.max(0, (profile?.points ?? 0) - amount) })
    .eq('id', auth.user.id);
  if (updErr) throw updErr;

  return request;
}

export async function listMyRedemptions(): Promise<RedemptionRow[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase
    .from('redemption_requests')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('requested_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createReferral(referredMobile: string): Promise<ReferralRow> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('referrals')
    .insert({ referrer_id: auth.user.id, referred_mobile: referredMobile })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function listMyReferrals(): Promise<ReferralRow[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', auth.user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
