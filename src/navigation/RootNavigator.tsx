import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { ChallengesScreen } from '../screens/engagement/ChallengesScreen';
import { ScratchCardScreen } from '../screens/engagement/ScratchCardScreen';
import { SpinWheelScreen } from '../screens/engagement/SpinWheelScreen';
import { TeamScreen } from '../screens/team/TeamScreen';
import { LedgerScreen } from '../screens/ledger/LedgerScreen';
import { AdminLoginScreen } from '../screens/admin/AdminLoginScreen';
import { AdminTabNavigator } from './AdminTabNavigator';
import { DesignSystemScreen } from '../screens/dev/DesignSystemScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="Challenges" component={ChallengesScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="ScratchCards" component={ScratchCardScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="SpinWheel" component={SpinWheelScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Team" component={TeamScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Ledger" component={LedgerScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
      <Stack.Screen name="AdminMain" component={AdminTabNavigator} />
      <Stack.Screen name="DesignSystem" component={DesignSystemScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
