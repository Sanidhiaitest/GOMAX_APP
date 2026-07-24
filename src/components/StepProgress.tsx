import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

type Props = {
  step: number;
  totalSteps: number;
  label: string;
};

export function StepProgress({ step, totalSteps, label }: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.track}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <View key={i} style={[styles.segment, i < step && styles.segmentDone]} />
        ))}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{step}</Text>
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', marginBottom: spacing.xxl },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 166,
  },
  segment: { flex: 1, height: 2, backgroundColor: colors.border },
  segmentDone: { backgroundColor: colors.navy800 },
  badge: {
    position: 'absolute',
    left: '50%',
    marginLeft: -14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.navy800,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.white, ...typography.label, textTransform: 'none' },
  label: { ...typography.label, color: colors.navy800, marginTop: spacing.sm, textTransform: 'none' },
});
