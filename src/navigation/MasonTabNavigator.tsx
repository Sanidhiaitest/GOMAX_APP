import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MasonTabParamList } from './types';
import { BottomNav } from '../components/BottomNav';
import { MasonHomeScreen } from '../screens/home/MasonHomeScreen';
import { ProductsScreen } from '../screens/products/ProductsScreen';
import { ScanScreen } from '../screens/scan/ScanScreen';
import { WalletScreen } from '../screens/wallet/WalletScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MasonTabParamList>();

// Gamified scan-to-earn nav — Points/Runs wallet + central Scan action.
export function MasonTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <BottomNav {...props} />}>
      <Tab.Screen name="Home" component={MasonHomeScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Redeem" component={WalletScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
