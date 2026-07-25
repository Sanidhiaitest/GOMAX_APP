import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../theme';

type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'primary' | 'info';

type Props = {
  label: string;
  tone?: Tone;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'sm' | 'md';
};

// Every fg here holds >=4.5:1 contrast against its own bg (WCAG AA for text),
// verified against the actual hex values — not the raw success/warning/danger/
// primary700/neutral500 tokens, which read as low as 2.8:1 on these tints.
const TONE_STYLES: Record<Tone, { bg: string; fg: string }> = {
  success: { bg: '#e6f7ec', fg: colors.successText },
  warning: { bg: '#fff4e0', fg: colors.warningText },
  danger: { bg: '#fdeaea', fg: colors.dangerText },
  neutral: { bg: colors.surfaceMuted, fg: colors.neutral600 },
  primary: { bg: colors.primary50, fg: colors.orange600 },
  info: { bg: '#eaf1fb', fg: colors.secondary500 },
};

// A single reusable status chip so the app never falls back to plain
// colored text for state — every status reads as a shape + color at a
// glance, not a sentence to parse.
export function Pill({ label, tone = 'neutral', icon, size = 'md' }: Props) {
  const t = TONE_STYLES[tone];
  const isSmall = size === 'sm';
  return (
    <View style={[styles.base, { backgroundColor: t.bg }, isSmall && styles.baseSmall]}>
      {icon ? <Ionicons name={icon} size={isSmall ? 11 : 13} color={t.fg} /> : null}
      <Text style={[styles.label, isSmall && styles.labelSmall, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  baseSmall: { paddingHorizontal: spacing.sm, paddingVertical: 3 },
  label: { ...m3Type.labelLarge, fontSize: 12, fontWeight: '700' },
  labelSmall: { fontSize: 10.5 },
});
