import { supabase } from '../lib/supabase';
import type { Tables } from '../lib/database.types';

export type PointsLedgerRow = Tables<'points_ledger'>;
export type RedemptionRequestRow = Tables<'points_redemption_requests'>;
export type CommissionLedgerRow = Tables<'commission_ledger'>;

export const MIN_REDEMPTION_POINTS = 500;
export const MAX_REDEMPTION_POINTS_PER_REQUEST = 5000;
export const MAX_REDEMPTION_POINTS_PER_MONTH = 15000;

export type RedeemResult =
  | { success: true; requestId: string }
  | { success: false; error: 'amount_out_of_range' | 'insufficient_balance' | 'monthly_limit_exceeded' | string; remainingThisMonth?: number };

/** Requests a Points redemption. Server enforces ₹500 min / ₹5,000 per request / ₹15,000 per calendar month. */
export async function requestRedemption(amount: number): Promise<RedeemResult> {
  const { data, error } = await supabase.rpc('request_points_redemption', { p_amount: amount });
  if (error) throw error;
  const payload = data as {
    success: boolean;
    error?: string;
    request_id?: string;
    remaining_this_month?: number;
  };
  if (!payload.success) {
    return { success: false, error: payload.error ?? 'unknown_error', remainingThisMonth: payload.remaining_this_month };
  }
  return { success: true, requestId: payload.request_id ?? '' };
}

export async function listMyRedemptions(): Promise<RedemptionRequestRow[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase
    .from('points_redemption_requests')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('requested_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export type RunsLedgerRow = Tables<'runs_ledger'>;

export async function listMyPointsLedger(): Promise<PointsLedgerRow[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase
    .from('points_ledger')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** The 4-level commission trail this user has earned from people below them in the referral chain. */
export async function listMyCommissionEarnings(): Promise<CommissionLedgerRow[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase
    .from('commission_ledger')
    .select('*')
    .eq('recipient_id', auth.user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listMyRunsLedger(): Promise<RunsLedgerRow[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase
    .from('runs_ledger')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export type MyTier = {
  lifetimePoints: number;
  tierName: string;
  perkDescription: string | null;
  nextTierName: string | null;
  nextTierThreshold: number | null;
  pointsToNextTier: number | null;
};

/** Real tier based on lifetime Points earned (not current balance — redeeming doesn't demote you). */
export async function getMyTier(): Promise<MyTier> {
  const { data, error } = await supabase.rpc('get_my_tier');
  if (error) throw error;
  const payload = data as {
    lifetime_points: number;
    tier_name: string;
    perk_description: string | null;
    next_tier_name: string | null;
    next_tier_threshold: number | null;
    points_to_next_tier: number | null;
  };
  return {
    lifetimePoints: Number(payload.lifetime_points),
    tierName: payload.tier_name,
    perkDescription: payload.perk_description,
    nextTierName: payload.next_tier_name,
    nextTierThreshold: payload.next_tier_threshold != null ? Number(payload.next_tier_threshold) : null,
    pointsToNextTier: payload.points_to_next_tier != null ? Number(payload.points_to_next_tier) : null,
  };
}

/** How much has already been redeemed this calendar month (against the ₹15,000 cap). */
export async function getRedeemedThisMonth(): Promise<number> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return 0;
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from('points_redemption_requests')
    .select('amount')
    .eq('user_id', auth.user.id)
    .in('status', ['pending', 'approved', 'paid'])
    .gte('requested_at', startOfMonth.toISOString());
  if (error) throw error;
  return (data ?? []).reduce((sum, r) => sum + Number(r.amount), 0);
}
