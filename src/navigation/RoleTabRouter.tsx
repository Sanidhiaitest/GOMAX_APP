import React from 'react';
import { useApp } from '../state/AppContext';
import { MasonTabNavigator } from './MasonTabNavigator';
import { DealerTabNavigator } from './DealerTabNavigator';
import { SalesmanTabNavigator } from './SalesmanTabNavigator';

// Each role gets its own tab set (see assets/README.md-adjacent comments in
// the individual *TabNavigator files for why) — this just picks the right
// one based on the role chosen at onboarding.
export function RoleTabRouter() {
  const { role } = useApp();

  if (role === 'dealer') return <DealerTabNavigator />;
  if (role === 'salesman') return <SalesmanTabNavigator />;
  return <MasonTabNavigator />;
}
