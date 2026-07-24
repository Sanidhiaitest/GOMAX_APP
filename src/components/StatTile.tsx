import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../theme';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  iconColor?: string;
  iconBg?: string;
};

// Icon + big number + one short label — no sentences. Used across
// dashboards (Admin KPIs, Salesman target, Referral stats) so scanning a
// screen of numbers never requires reading paragraphs.
export function StatTile({ icon, value, label, iconColor = colors.primary700, iconBg = colors.primary50 }: Props) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'flex-start',
    gap: 6,
    minWidth: 0,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { ...m3Type.headlineMedium, fontSize: 20, color: colors.textPrimary },
  label: { ...m3Type.labelMedium, fontSize: 11, color: colors.neutral500 },
});
