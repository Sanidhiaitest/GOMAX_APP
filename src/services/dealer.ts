import { supabase } from '../lib/supabase';
import type { Tables } from '../lib/database.types';

export type OrderRow = Tables<'orders'>;
export type OrderItemRow = Tables<'order_items'>;
export type LedgerRow = Tables<'ledger_transactions'>;

export type OrderWithItems = OrderRow & { items: OrderItemRow[] };

export async function listMyOrders(): Promise<OrderWithItems[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('dealer_id', auth.user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((o: any) => ({ ...o, items: o.order_items ?? [] }));
}

export async function getOrder(orderId: string): Promise<OrderWithItems | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const { order_items, ...order } = data as any;
  return { ...order, items: order_items ?? [] };
}

/** Places a new order for the signed-in dealer with the given cart lines. */
export async function placeOrder(
  items: { productId: string; name: string; qty: number; price: number }[]
): Promise<OrderWithItems> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not authenticated');

  const amount = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const orderNo = `GM-${Math.floor(10000 + Math.random() * 89999)}`;

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({ order_no: orderNo, dealer_id: auth.user.id, amount, status: 'Placed' })
    .select('*')
    .single();
  if (orderErr) throw orderErr;

  const { data: orderItems, error: itemsErr } = await supabase
    .from('order_items')
    .insert(
      items.map((i) => ({
        order_id: order.id,
        product_id: i.productId,
        name: i.name,
        qty: i.qty,
        price: i.price,
      }))
    )
    .select('*');
  if (itemsErr) throw itemsErr;

  return { ...order, items: orderItems ?? [] };
}

export async function listMyLedger(): Promise<LedgerRow[]> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data, error } = await supabase
    .from('ledger_transactions')
    .select('*')
    .eq('dealer_id', auth.user.id)
    .order('txn_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
