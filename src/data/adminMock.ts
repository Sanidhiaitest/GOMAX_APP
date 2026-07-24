// Static directory padding so the Admin views don't look empty with only
// the one live mock user — the live user (mason/dealer/salesman state from
// AppContext) is merged in alongside these at render time where relevant.
export const otherApplicators = [
  { id: 'a1', name: 'Suresh Yadav', city: 'Amritsar', tier: 'Kaarigar', scansThisMonth: 34, pointsBalance: 610 },
  { id: 'a2', name: 'Vijay Singh', city: 'Ludhiana', tier: 'Ustaad', scansThisMonth: 61, pointsBalance: 1240 },
  { id: 'a3', name: 'Anand Rao', city: 'Chandigarh', tier: 'Naya Saathi', scansThisMonth: 8, pointsBalance: 95 },
  { id: 'a4', name: 'Mahesh Kumar', city: 'Amritsar', tier: 'Kaarigar', scansThisMonth: 22, pointsBalance: 480 },
];

export const otherDealerApplications = [
  { id: 'da1', shopName: 'Bansal Traders', city: 'Ludhiana', submittedAgo: '1 day ago', status: 'pending' as const },
  { id: 'da2', shopName: 'Modern Hardware', city: 'Jalandhar', submittedAgo: '3 days ago', status: 'pending' as const },
];

export const fraudFlags = [
  { id: 'f1', title: 'Duplicate QR scan detected', detail: 'Same code scanned twice within 40 seconds', severity: 'high' as const },
  { id: 'f2', title: 'Mock-location flag', detail: 'GPS jump of 180km between consecutive scans', severity: 'medium' as const },
];

export const kpiSummary = {
  scansToday: 214,
  gmvThisMonth: 1842000,
};
