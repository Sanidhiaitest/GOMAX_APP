import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AdminTabParamList } from './types';
import { BottomNav } from '../components/BottomNav';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminDealerApprovalsScreen } from '../screens/admin/AdminDealerApprovalsScreen';
import { AdminRedemptionsScreen } from '../screens/admin/AdminRedemptionsScreen';
import { AdminApplicatorsScreen } from '../screens/admin/AdminApplicatorsScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();

export function AdminTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <BottomNav {...props} />}>
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="DealerApprovals" component={AdminDealerApprovalsScreen} />
      <Tab.Screen name="Redemptions" component={AdminRedemptionsScreen} />
      <Tab.Screen name="Applicators" component={AdminApplicatorsScreen} />
    </Tab.Navigator>
  );
}
