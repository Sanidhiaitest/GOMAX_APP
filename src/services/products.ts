import { supabase } from '../lib/supabase';
import type { Tables } from '../lib/database.types';

export type ProductRow = Tables<'products'>;

export async function listProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('category', { ascending: true });
  if (error) throw error;
  return data ?? [];
}
