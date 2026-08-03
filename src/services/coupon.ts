import { supabase } from '../lib/supabase';
import type { Tables } from '../lib/database.types';

export type ScanTransactionRow = Tables<'scan_transactions'>;

export type ScanResult =
  | { success: true; pointsAwarded: number; scanId: string }
  | { success: false; error: 'invalid_code' | 'already_used' | 'not_an_applicator' | string };

/** Scans a coupon code: atomic burn + points credit + 4-level commission cascade, all server-side. */
export async function scanCoupon(code: string): Promise<ScanResult> {
  const { data, error } = await supabase.rpc('scan_coupon', { p_code: code.trim() });
  if (error) throw error;
  const payload = data as { success: boolean; error?: string; points_awarded?: number; scan_id?: string };
  if (!payload.success) {
    return { success: false, error: payload.error ?? 'unknown_error' };
  }
  return { success: true, pointsAwarded: payload.points_awarded ?? 0, scanId: payload.scan_id ?? '' };
}

export async function listMyScans(): Promise<ScanTransactionRow[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase
    .from('scan_transactions')
    .select('*')
    .eq('applicator_id', auth.user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
