export type OnboardingStackParamList = {
  Splash: undefined;
  MobileNumber: undefined;
  Otp: undefined;
  RoleSelect: undefined;
  // Mason path
  BasicDetails: undefined;
  Birthday: undefined;
  // Dealer path
  DealerBusinessDetails: undefined;
  DealerPendingApproval: undefined;
  // Salesman path
  SalesmanCode: undefined;
};

export type MasonTabParamList = {
  Home: undefined;
  Products: undefined;
  Scan: undefined;
  Redeem: undefined;
  Profile: undefined;
};

export type DealerTabParamList = {
  Home: undefined;
  Orders: undefined;
  Ledger: undefined;
  Profile: undefined;
};

export type SalesmanTabParamList = {
  Home: undefined;
  Dealers: undefined;
  Dcr: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  Kyc: undefined;
  SpinWheel: undefined;
  Referral: undefined;
  ScratchCards: undefined;
  Challenges: undefined;
  OrdersList: undefined;
  OrderDetail: { orderId: string };
  Ledger: undefined;
  OrderPlacement: undefined;
  DealerDetail: { dealerId: string };
  Dcr: undefined;
  DealersList: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
