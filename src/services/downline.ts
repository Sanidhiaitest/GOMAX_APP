import { supabase } from '../lib/supabase';

export type DownlineMember = {
  id: string;
  fullName: string;
  role: string;
  joinedAt: string;
  commissionGenerated: number;
};

/** Every person in the signed-in user's downline (unlimited depth), with how
 * much commission each individually has generated for the signed-in user. */
export async function getMyDownline(): Promise<DownlineMember[]> {
  const { data, error } = await supabase.rpc('get_my_downline');
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name || 'GoMax User',
    role: row.role,
    joinedAt: row.created_at,
    commissionGenerated: Number(row.commission_generated),
  }));
}
