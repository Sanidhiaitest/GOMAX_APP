import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { Screen } from '../../components/Screen';
import { useApp } from '../../state/AppContext';
import { MasonHomeScreen } from './MasonHomeScreen';
import { DealerHomeScreen } from './DealerHomeScreen';

export function HomeScreen() {
  const { role } = useApp();

  if (role === 'dealer') return <DealerHomeScreen />;
  if (role === 'salesman') return <SalesmanPlaceholder />;
  return <MasonHomeScreen />;
}

// Salesman app is explicitly Phase 2 in the Platform PRD — deferred until the
// mason + dealer P0 flows are live, so this is a placeholder only.
function SalesmanPlaceholder() {
  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.wrap}>
        <Ionicons name="construct-outline" size={40} color={colors.textMuted} />
        <Text style={styles.title}>Salesman app — Phase 2</Text>
        <Text style={styles.subtitle}>
          This role is fully spec&apos;d in the PRD but scheduled after the Mason + Dealer P0 launch.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxxl, gap: spacing.md },
  title: { ...typography.h3, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
