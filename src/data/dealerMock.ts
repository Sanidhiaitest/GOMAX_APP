export const dealerLedger = {
  outstanding: 42350,
  creditLimit: 150000,
  dueDate: '2 Aug 2026',
};

export const scanNotifications = [
  { id: 'n1', mason: 'Ram Kumar', product: 'GoMax Tile Adhesive 20kg', time: '12 min ago' },
  { id: 'n2', mason: 'Suresh Yadav', product: 'GoMax Waterproofing 5kg', time: '1 hr ago' },
  { id: 'n3', mason: 'Vijay Singh', product: 'GoMax Tile Adhesive 20kg', time: 'Yesterday' },
];

export type OrderStatus = 'Placed' | 'Billed' | 'In transit' | 'Delivered';

export type Order = {
  id: string;
  orderNo: string;
  amount: number;
  status: OrderStatus;
  date: string;
  items: { name: string; qty: number; price: number }[];
};

export const STATUS_STEPS: OrderStatus[] = ['Placed', 'Billed', 'In transit', 'Delivered'];

export const recentOrders: Order[] = [
  {
    id: 'o1',
    orderNo: 'GM-10234',
    amount: 28500,
    status: 'Delivered',
    date: '18 Jul',
    items: [
      { name: 'GoMax Tile Adhesive 20kg', qty: 50, price: 450 },
      { name: 'GoMax Waterproofing 5kg', qty: 20, price: 275 },
    ],
  },
  {
    id: 'o2',
    orderNo: 'GM-10221',
    amount: 15200,
    status: 'In transit',
    date: '15 Jul',
    items: [{ name: 'GoMax Wall Putty 40kg', qty: 40, price: 380 }],
  },
  {
    id: 'o3',
    orderNo: 'GM-10199',
    amount: 9800,
    status: 'Billed',
    date: '9 Jul',
    items: [{ name: 'GoMax Tile Adhesive 20kg', qty: 20, price: 490 }],
  },
  {
    id: 'o4',
    orderNo: 'GM-10180',
    amount: 5200,
    status: 'Placed',
    date: '3 Jul',
    items: [{ name: 'GoMax Waterproofing 5kg', qty: 18, price: 289 }],
  },
];

export type Product = { id: string; name: string; unit: string; price: number };

export const products: Product[] = [
  { id: 'p1', name: 'GoMax Tile Adhesive 20kg', unit: 'per bag', price: 450 },
  { id: 'p2', name: 'GoMax Waterproofing 5kg', unit: 'per bag', price: 275 },
  { id: 'p3', name: 'GoMax Wall Putty 40kg', unit: 'per bag', price: 380 },
  { id: 'p4', name: 'GoMax White Cement 5kg', unit: 'per bag', price: 210 },
  { id: 'p5', name: 'GoMax Block Jointing Mortar 20kg', unit: 'per bag', price: 340 },
];

export type LedgerEntry = {
  id: string;
  label: string;
  date: string;
  amount: number;
  type: 'debit' | 'credit';
};

export const ledgerTransactions: LedgerEntry[] = [
  { id: 'l1', label: 'Order GM-10234 billed', date: '18 Jul', amount: 28500, type: 'debit' },
  { id: 'l2', label: 'Payment received (UPI)', date: '16 Jul', amount: 20000, type: 'credit' },
  { id: 'l3', label: 'Order GM-10221 billed', date: '15 Jul', amount: 15200, type: 'debit' },
  { id: 'l4', label: 'Scheme credit — Monsoon Push', date: '12 Jul', amount: 3500, type: 'credit' },
  { id: 'l5', label: 'Order GM-10199 billed', date: '9 Jul', amount: 9800, type: 'debit' },
  { id: 'l6', label: 'Payment received (Cheque)', date: '5 Jul', amount: 15000, type: 'credit' },
];
