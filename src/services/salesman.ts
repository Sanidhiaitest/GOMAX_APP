import { supabase } from '../lib/supabase';
import type { Tables, TablesUpdate } from '../lib/database.types';

export type BeatPlanRow = Tables<'beat_plan'>;
export type DcrRow = Tables<'dcr_entries'>;

/** Sum of this salesman's order amounts since the 1st of the current month. */
export async function getMyMonthlyAchieved(): Promise<number> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return 0;
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from('orders')
    .select('amount')
    .eq('salesman_id', auth.user.id)
    .gte('created_at', startOfMonth.toISOString());
  if (error) throw error;
  return (data ?? []).reduce((sum, o) => sum + Number(o.amount), 0);
}

export async function listMyBeatPlan(visitDate?: string): Promise<BeatPlanRow[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  let query = supabase.from('beat_plan').select('*').eq('salesman_id', auth.user.id);
  if (visitDate) query = query.eq('visit_date', visitDate);
  const { data, error } = await query.order('area', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function updateBeatStop(id: string, patch: TablesUpdate<'beat_plan'>): Promise<BeatPlanRow> {
  const { data, error } = await supabase.from('beat_plan').update(patch).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

export async function listTodaysDcrEntries(): Promise<DcrRow[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from('dcr_entries')
    .select('*')
    .eq('salesman_id', auth.user.id)
    .gte('entry_time', startOfDay.toISOString())
    .order('entry_time', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addDcrEntry(entry: {
  dealerName: string;
  outcome: DcrRow['outcome'];
  notes?: string;
}): Promise<DcrRow> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('dcr_entries')
    .insert({ salesman_id: auth.user.id, dealer_name: entry.dealerName, outcome: entry.outcome, notes: entry.notes })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
