import { supabase } from '../lib/supabase';
import type { Tables } from '../lib/database.types';

export type GiftRow = Tables<'gift_catalogue'>;
export type GiftRedemptionRow = Tables<'gift_redemptions'>;

export async function listGiftCatalogue(): Promise<GiftRow[]> {
  const { data, error } = await supabase
    .from('gift_catalogue')
    .select('*')
    .eq('active', true)
    .order('runs_cost', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export type RedeemGiftResult =
  | { success: true; redemptionId: string }
  | { success: false; error: 'gift_not_found' | 'out_of_stock' | 'insufficient_runs' | string };

/** Spends Runs on a catalogue gift. Server checks stock + balance atomically. */
export async function redeemGift(giftId: string): Promise<RedeemGiftResult> {
  const { data, error } = await supabase.rpc('redeem_gift', { p_gift_id: giftId });
  if (error) throw error;
  const payload = data as { success: boolean; error?: string; redemption_id?: string };
  if (!payload.success) return { success: false, error: payload.error ?? 'unknown_error' };
  return { success: true, redemptionId: payload.redemption_id ?? '' };
}

export async function listMyGiftRedemptions(): Promise<(GiftRedemptionRow & { gift: GiftRow | null })[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase
    .from('gift_redemptions')
    .select('*, gift_catalogue(*)')
    .eq('user_id', auth.user.id)
    .order('requested_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({ ...row, gift: row.gift_catalogue ?? null }));
}
