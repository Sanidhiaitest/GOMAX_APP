import { supabase } from '../lib/supabase';
import type { Tables } from '../lib/database.types';

export type ChallengeRow = Tables<'challenges'>;
export type ChallengeProgressRow = Tables<'challenge_progress'>;
export type BadgeRow = Tables<'badges'>;
export type UserBadgeRow = Tables<'user_badges'>;
export type ScratchCardRow = Tables<'scratch_cards'>;
export type UserScratchCardRow = Tables<'user_scratch_cards'>;

export async function listChallenges(): Promise<ChallengeRow[]> {
  const { data, error } = await supabase.from('challenges').select('*').eq('active', true);
  if (error) throw error;
  return data ?? [];
}

export async function listMyChallengeProgress(): Promise<ChallengeProgressRow[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase.from('challenge_progress').select('*').eq('user_id', auth.user.id);
  if (error) throw error;
  return data ?? [];
}

/** Marks a challenge complete and credits its Runs reward, atomically, via the claim_challenge() RPC. */
export async function claimChallenge(challengeId: string) {
  const { data, error } = await supabase.rpc('claim_challenge', { p_challenge_id: challengeId });
  if (error) throw error;
  const payload = data as { success: boolean; error?: string; runs_awarded?: number };
  if (!payload.success) throw new Error(payload.error ?? 'Could not claim challenge');
  return payload;
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
    await supabase.from('user_scratch_cards').insert(missing.map((t) => ({ user_id: auth.user!.id, card_id: t.id })));
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

/** Reveals a scratch card and credits its Runs reward, atomically, via the reveal_scratch_card() RPC. */
export async function scratchCard(userCardId: string) {
  const { data, error } = await supabase.rpc('reveal_scratch_card', { p_user_card_id: userCardId });
  if (error) throw error;
  const payload = data as { success: boolean; error?: string; runs_awarded?: number };
  if (!payload.success) throw new Error(payload.error ?? 'Could not reveal card');
  return payload;
}

export async function listLeaderboard(limit = 10) {
  const { data: auth } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, points')
    .eq('role', 'applicator')
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
