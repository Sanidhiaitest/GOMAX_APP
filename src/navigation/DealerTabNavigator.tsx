import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DealerTabParamList } from './types';
import { BottomNav } from '../components/BottomNav';
import { DealerHomeScreen } from '../screens/home/DealerHomeScreen';
import { OrdersListScreen } from '../screens/dealer/OrdersListScreen';
import { LedgerScreen } from '../screens/dealer/LedgerScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<DealerTabParamList>();

// Dealers deal in credit/ledger, not a personal points wallet — per PRD
// glossary, the scheme rate is never shown to dealers and scan rewards go
// to the applicator, not the shop. No central Scan action here.
export function DealerTabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <BottomNav {...props} />}>
      <Tab.Screen name="Home" component={DealerHomeScreen} />
      <Tab.Screen name="Orders" component={OrdersListScreen} />
      <Tab.Screen name="Ledger" component={LedgerScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
