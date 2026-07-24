import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SalesmanTabParamList } from './types';
import { BottomNav } from '../components/BottomNav';
import { SalesmanHomeScreen } from '../screens/home/SalesmanHomeScreen';
import { DealersListScreen } from '../screens/salesman/DealersListScreen';
import { DcrScreen } from '../screens/salesman/DcrScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<SalesmanTabParamList>();

// Field-force nav — target dashboard as home, beat plan/dealers, and daily
// call reporting. No personal scan-to-earn wallet.
export function SalesmanTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <BottomNav {...props} />}>
      <Tab.Screen name="Home" component={SalesmanHomeScreen} />
      <Tab.Screen name="Dealers" component={DealersListScreen} />
      <Tab.Screen name="Dcr" component={DcrScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
