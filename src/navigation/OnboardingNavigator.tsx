import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from './types';
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { MobileNumberScreen } from '../screens/onboarding/MobileNumberScreen';
import { OtpScreen } from '../screens/onboarding/OtpScreen';
import { RoleSelectScreen } from '../screens/onboarding/RoleSelectScreen';
import { BasicDetailsScreen } from '../screens/onboarding/BasicDetailsScreen';
import { BirthdayScreen } from '../screens/onboarding/BirthdayScreen';
import { DealerBusinessDetailsScreen } from '../screens/onboarding/DealerBusinessDetailsScreen';
import { DealerPendingApprovalScreen } from '../screens/onboarding/DealerPendingApprovalScreen';
import { SalesmanCodeScreen } from '../screens/onboarding/SalesmanCodeScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="MobileNumber" component={MobileNumberScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      {/* Mason path */}
      <Stack.Screen name="BasicDetails" component={BasicDetailsScreen} />
      <Stack.Screen name="Birthday" component={BirthdayScreen} />
      {/* Dealer path */}
      <Stack.Screen name="DealerBusinessDetails" component={DealerBusinessDetailsScreen} />
      <Stack.Screen name="DealerPendingApproval" component={DealerPendingApprovalScreen} />
      {/* Salesman path */}
      <Stack.Screen name="SalesmanCode" component={SalesmanCodeScreen} />
    </Stack.Navigator>
  );
}
