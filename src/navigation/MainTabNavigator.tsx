import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { BottomNav } from '../components/BottomNav';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ScanScreen } from '../screens/scan/ScanScreen';
import { WalletScreen } from '../screens/wallet/WalletScreen';
import { GiftCatalogueScreen } from '../screens/gifts/GiftCatalogueScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// One shared tab bar for Dealer / Contractor / Applicator — each screen
// adapts its own content by role (e.g. Scan is Applicator-only).
export function MainTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <BottomNav {...props} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Gifts" component={GiftCatalogueScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
