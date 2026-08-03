export type OnboardingStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  AdminSetup: undefined;
};

// One shared tab set for Dealer / Contractor / Applicator — content inside
// each tab adapts by role (e.g. Scan is Applicator-only), rather than
// forking into three near-identical navigators.
export type MainTabParamList = {
  Home: undefined;
  Scan: undefined;
  Wallet: undefined;
  Gifts: undefined;
  Profile: undefined;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  Redemptions: undefined;
  Gifts: undefined;
  Directory: undefined;
  LedgerSearch: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  Challenges: undefined;
  ScratchCards: undefined;
  SpinWheel: undefined;
  Team: undefined;
  Ledger: undefined;
  AdminLogin: undefined;
  AdminMain: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
