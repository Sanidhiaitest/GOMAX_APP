export type Challenge = {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  target: number;
  reward: string;
};

export const weeklyChallenges: Challenge[] = [
  { id: 'c1', title: 'Scan 10 bags this week', subtitle: 'Scan any 10 GoMax bags before Sunday', progress: 6, target: 10, reward: '+50 Runs' },
  { id: 'c2', title: '5-Day Scanning Streak', subtitle: 'Scan at least 1 bag every day for 5 days', progress: 3, target: 5, reward: '+30 Runs' },
  { id: 'c3', title: 'Refer a Friend', subtitle: 'Refer 1 new applicator who completes signup', progress: 0, target: 1, reward: '+70 Points' },
];

export type LeaderboardEntry = { rank: number; name: string; scans: number; isYou?: boolean };

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'Ramesh K.', scans: 48 },
  { rank: 2, name: 'Suresh P.', scans: 41 },
  { rank: 3, name: 'Vijay M.', scans: 37 },
  { rank: 4, name: 'You', scans: 31, isYou: true },
  { rank: 5, name: 'Anand R.', scans: 28 },
];

export type Badge = { id: string; title: string; subtitle: string; unlocked: boolean };

export const badges: Badge[] = [
  { id: 'b1', title: 'First Scan', subtitle: 'Scanned your first GoMax bag', unlocked: true },
  { id: 'b2', title: 'First 10 Scans', subtitle: 'Completed 10 scans', unlocked: true },
  { id: 'b3', title: '5-Day Streak', subtitle: 'Scanned 5 days in a row', unlocked: false },
  { id: 'b4', title: 'Team Player', subtitle: 'Referred an applicator', unlocked: false },
];
