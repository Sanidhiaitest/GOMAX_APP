import React from 'react';
import { useApp } from '../../state/AppContext';
import { MasonHomeScreen } from './MasonHomeScreen';
import { DealerHomeScreen } from './DealerHomeScreen';
import { SalesmanHomeScreen } from './SalesmanHomeScreen';

export function HomeScreen() {
  const { role } = useApp();

  if (role === 'dealer') return <DealerHomeScreen />;
  if (role === 'salesman') return <SalesmanHomeScreen />;
  return <MasonHomeScreen />;
}
