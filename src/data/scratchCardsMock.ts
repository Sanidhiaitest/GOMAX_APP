export type ScratchCard = {
  id: string;
  title: string;
  subtitle: string;
  expiresIn: string;
  reward: number;
  scratched: boolean;
};

export const initialScratchCards: ScratchCard[] = [
  { id: 'sc1', title: 'Daily Spin', subtitle: '1 free scratch every day', expiresIn: 'Expires in 6 hrs', reward: 15, scratched: false },
  { id: 'sc2', title: '50 Scans Milestone', subtitle: 'Unlocked at 50 scans', expiresIn: 'Expires in 7 days', reward: 50, scratched: false },
  { id: 'sc3', title: 'Monday Surprise', subtitle: 'Weekly bonus card', expiresIn: 'Expires in 2 days', reward: 25, scratched: false },
  { id: 'sc4', title: 'Birthday Gift', subtitle: 'A little something from GoMax', expiresIn: 'Expires in 30 days', reward: 100, scratched: false },
];
