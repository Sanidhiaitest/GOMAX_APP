import { supabase } from '../lib/supabase';
import type { Tables, TablesUpdate } from '../lib/database.types';

export type Profile = Tables<'profiles'>;
export type DealerBusinessRow = Tables<'dealer_business_details'>;

export async function getMyProfile(): Promise<Profile | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', auth.user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateMyProfile(patch: TablesUpdate<'profiles'>): Promise<Profile> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', auth.user.id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function getMyDealerBusiness(): Promise<DealerBusinessRow | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from('dealer_business_details')
    .select('*')
    .eq('dealer_id', auth.user.id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertMyDealerBusiness(
  patch: Omit<TablesUpdate<'dealer_business_details'>, 'dealer_id'>
): Promise<DealerBusinessRow> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('dealer_business_details')
    .upsert({ ...patch, dealer_id: auth.user.id }, { onConflict: 'dealer_id' })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
