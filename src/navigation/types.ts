import { NavigatorScreenParams } from '@react-navigation/native';

export type OnboardingStackParamList = {
  Splash: undefined;
  MobileNumber: undefined;
  Otp: undefined;
  RoleSelect: undefined;
  BasicDetails: undefined;
  Birthday: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Products: undefined;
  Scan: undefined;
  Redeem: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Kyc: undefined;
  SpinWheel: undefined;
  Referral: undefined;
  ScratchCards: undefined;
  Challenges: undefined;
  OrdersList: undefined;
  OrderDetail: { orderId: string };
  Ledger: undefined;
  OrderPlacement: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
