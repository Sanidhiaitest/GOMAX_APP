import { supabase } from '../lib/supabase';

export type SpinResult =
  | { success: true; prizeLabel: string; runsAwarded: number; spinsLeft: number }
  | { success: false; error: 'daily_limit_reached' | 'no_prizes_configured' | string };

export async function spinWheel(): Promise<SpinResult> {
  const { data, error } = await supabase.rpc('spin_wheel');
  if (error) throw error;
  const payload = data as {
    success: boolean;
    error?: string;
    prize_label?: string;
    runs_awarded?: number;
    spins_left?: number;
  };
  if (!payload.success) return { success: false, error: payload.error ?? 'unknown_error' };
  return {
    success: true,
    prizeLabel: payload.prize_label ?? '',
    runsAwarded: payload.runs_awarded ?? 0,
    spinsLeft: payload.spins_left ?? 0,
  };
}

export async function getSpinsUsedToday(): Promise<number> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return 0;
  const { count, error } = await supabase
    .from('spin_wheel_spins')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', auth.user.id)
    .eq('spin_date', new Date().toISOString().slice(0, 10));
  if (error) throw error;
  return count ?? 0;
}
