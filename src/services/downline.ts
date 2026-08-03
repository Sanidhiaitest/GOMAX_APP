import { supabase } from '../lib/supabase';

export type DownlineMember = {
  id: string;
  fullName: string;
  role: string;
  joinedAt: string;
  commissionGenerated: number;
  businessVolume: number;
  isDirectReport: boolean;
};

/** Every person in the signed-in user's downline (unlimited depth), with how
 * much commission each individually has generated for the signed-in user,
 * and their total business volume (₹ value scanned by them + their own sub-team).
 * `isDirectReport` marks first-level referrals — sum only these for a
 * team-wide total, since each one's businessVolume already rolls up everyone below them. */
export async function getMyDownline(): Promise<DownlineMember[]> {
  const { data: auth } = await supabase.auth.getUser();
  const { data, error } = await supabase.rpc('get_my_downline');
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name || 'GoMax User',
    role: row.role,
    joinedAt: row.created_at,
    commissionGenerated: Number(row.commission_generated),
    businessVolume: Number(row.business_volume),
    isDirectReport: row.referrer_id === auth.user?.id,
  }));
}
