import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { Screen } from '../../components/Screen';

// Product catalogue is P1 in the Platform PRD — this is a placeholder so the
// bottom nav (which matches the Figma tab bar) is complete end-to-end.
export function ProductsScreen() {
  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.wrap}>
        <Ionicons name="cube-outline" size={40} color={colors.textMuted} />
        <Text style={styles.title}>Product Catalogue</Text>
        <Text style={styles.subtitle}>Coming soon — this is a P1 feature after the core P0 loop ships.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxxl, gap: spacing.md },
  title: { ...typography.h3, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
