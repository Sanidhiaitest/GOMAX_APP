export const salesmanTarget = {
  achieved: 182000,
  target: 250000,
  daysLeft: 6,
};

export const streak = { days: 12, label: '12-day beat streak' };

export type BeatStop = {
  id: string;
  dealerName: string;
  area: string;
  address: string;
  phone: string;
  status: 'pending' | 'visited' | 'skipped';
  outstanding: number;
  creditLimit: number;
  lastVisit: string;
  lastOrderAmount: number;
};

export const beatPlan: BeatStop[] = [
  {
    id: 'b1',
    dealerName: 'Singh Hardware Store',
    area: 'Ranjit Avenue',
    address: '12 Ranjit Avenue Market, Amritsar',
    phone: '98765 43210',
    status: 'visited',
    outstanding: 12500,
    creditLimit: 80000,
    lastVisit: 'Today, 10:30 AM',
    lastOrderAmount: 18500,
  },
  {
    id: 'b2',
    dealerName: 'Kumar Building Materials',
    area: 'Court Road',
    address: '45 Court Road, Amritsar',
    phone: '98123 45678',
    status: 'pending',
    outstanding: 42350,
    creditLimit: 150000,
    lastVisit: '6 days ago',
    lastOrderAmount: 28500,
  },
  {
    id: 'b3',
    dealerName: 'Sharma Traders',
    area: 'GT Road',
    address: '78 GT Road, Amritsar',
    phone: '99887 66554',
    status: 'pending',
    outstanding: 0,
    creditLimit: 50000,
    lastVisit: '2 weeks ago',
    lastOrderAmount: 9200,
  },
  {
    id: 'b4',
    dealerName: 'New Punjab Cement Co.',
    area: 'Batala Road',
    address: '23 Batala Road, Amritsar',
    phone: '97654 32109',
    status: 'skipped',
    outstanding: 8100,
    creditLimit: 60000,
    lastVisit: '3 days ago',
    lastOrderAmount: 12000,
  },
];

export type DcrEntry = {
  id: string;
  dealerName: string;
  time: string;
  outcome: 'Order taken' | 'Payment collected' | 'No order' | 'Dealer closed';
  notes: string;
};

export const todaysDcrEntries: DcrEntry[] = [
  { id: 'd1', dealerName: 'Singh Hardware Store', time: '10:30 AM', outcome: 'Order taken', notes: 'Ordered 40 bags tile adhesive, promised payment by Friday' },
];
