import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { KycScreen } from '../screens/kyc/KycScreen';
import { SpinWheelScreen } from '../screens/engagement/SpinWheelScreen';
import { ReferralScreen } from '../screens/engagement/ReferralScreen';
import { ScratchCardScreen } from '../screens/engagement/ScratchCardScreen';
import { ChallengesScreen } from '../screens/engagement/ChallengesScreen';
import { OrdersListScreen } from '../screens/dealer/OrdersListScreen';
import { OrderDetailScreen } from '../screens/dealer/OrderDetailScreen';
import { LedgerScreen } from '../screens/dealer/LedgerScreen';
import { OrderPlacementScreen } from '../screens/dealer/OrderPlacementScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="Kyc" component={KycScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="SpinWheel" component={SpinWheelScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Referral" component={ReferralScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="ScratchCards" component={ScratchCardScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Challenges" component={ChallengesScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="OrdersList" component={OrdersListScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="Ledger" component={LedgerScreen} />
      <Stack.Screen name="OrderPlacement" component={OrderPlacementScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
