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
  status: 'pending' | 'visited' | 'skipped';
  outstanding: number;
};

export const beatPlan: BeatStop[] = [
  { id: 'b1', dealerName: 'Singh Hardware Store', area: 'Ranjit Avenue', status: 'visited', outstanding: 12500 },
  { id: 'b2', dealerName: 'Kumar Building Materials', area: 'Court Road', status: 'pending', outstanding: 42350 },
  { id: 'b3', dealerName: 'Sharma Traders', area: 'GT Road', status: 'pending', outstanding: 0 },
  { id: 'b4', dealerName: 'New Punjab Cement Co.', area: 'Batala Road', status: 'skipped', outstanding: 8100 },
];
