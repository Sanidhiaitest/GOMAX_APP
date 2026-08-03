import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { OnboardingNavigator } from './OnboardingNavigator';
import { RoleTabRouter } from './RoleTabRouter';
import { KycScreen } from '../screens/kyc/KycScreen';
import { SpinWheelScreen } from '../screens/engagement/SpinWheelScreen';
import { ReferralScreen } from '../screens/engagement/ReferralScreen';
import { ScratchCardScreen } from '../screens/engagement/ScratchCardScreen';
import { ChallengesScreen } from '../screens/engagement/ChallengesScreen';
import { OrdersListScreen } from '../screens/dealer/OrdersListScreen';
import { OrderDetailScreen } from '../screens/dealer/OrderDetailScreen';
import { LedgerScreen } from '../screens/dealer/LedgerScreen';
import { OrderPlacementScreen } from '../screens/dealer/OrderPlacementScreen';
import { DealerDetailScreen } from '../screens/salesman/DealerDetailScreen';
import { DcrScreen } from '../screens/salesman/DcrScreen';
import { DealersListScreen } from '../screens/salesman/DealersListScreen';
import { AdminLoginScreen } from '../screens/admin/AdminLoginScreen';
import { AdminTabNavigator } from './AdminTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Main">
      <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      <Stack.Screen name="Main" component={RoleTabRouter} />
      <Stack.Screen name="Kyc" component={KycScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="SpinWheel" component={SpinWheelScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Referral" component={ReferralScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="ScratchCards" component={ScratchCardScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Challenges" component={ChallengesScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="OrdersList" component={OrdersListScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="Ledger" component={LedgerScreen} />
      <Stack.Screen name="OrderPlacement" component={OrderPlacementScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="DealerDetail" component={DealerDetailScreen} />
      <Stack.Screen name="Dcr" component={DcrScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="DealersList" component={DealersListScreen} />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
      <Stack.Screen name="AdminMain" component={AdminTabNavigator} />
    </Stack.Navigator>
  );
}
