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

export const recentOrders = [
  { id: 'o1', orderNo: 'GM-10234', amount: 28500, status: 'Delivered' as const, date: '18 Jul' },
  { id: 'o2', orderNo: 'GM-10221', amount: 15200, status: 'In transit' as const, date: '15 Jul' },
  { id: 'o3', orderNo: 'GM-10199', amount: 9800, status: 'Billed' as const, date: '9 Jul' },
];
