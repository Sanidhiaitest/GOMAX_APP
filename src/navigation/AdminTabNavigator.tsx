import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AdminTabParamList } from './types';
import { BottomNav } from '../components/BottomNav';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminRedemptionsScreen } from '../screens/admin/AdminRedemptionsScreen';
import { AdminGiftsScreen } from '../screens/admin/AdminGiftsScreen';
import { AdminApplicatorsScreen } from '../screens/admin/AdminApplicatorsScreen';
import { AdminLedgerSearchScreen } from '../screens/admin/AdminLedgerSearchScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();

export function AdminTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <BottomNav {...props} />}>
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Redemptions" component={AdminRedemptionsScreen} />
      <Tab.Screen name="Gifts" component={AdminGiftsScreen} />
      <Tab.Screen name="Applicators" component={AdminApplicatorsScreen} />
      <Tab.Screen name="LedgerSearch" component={AdminLedgerSearchScreen} />
    </Tab.Navigator>
  );
}
