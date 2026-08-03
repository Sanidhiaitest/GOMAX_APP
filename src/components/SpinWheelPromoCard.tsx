import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../theme';
import { PressableScale } from './animations';
import { RootStackParamList } from '../navigation/types';

type Props = { style?: StyleProp<ViewStyle> };

// Self-contained promo-carousel card for the real Spin Wheel feature. This is
// NOT the interactive wheel itself (that's SpinWheelScreen, owned by a
// separate parallel effort) — just a compact decorative preview graphic
// (a small gradient disc with a few emoji accents orbiting it) that taps
// through to the real 'SpinWheel' route.
export function SpinWheelPromoCard({ style }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <PressableScale style={style} onPress={() => navigation.navigate('SpinWheel')}>
      <LinearGradient
        colors={[colors.orange500, colors.navy800]}
        start={{ x: 0.05, y: 0.1 }}
        end={{ x: 0.95, y: 1 }}
        style={styles.card}
      >
        <View style={styles.expandBadge}>
          <Ionicons name="expand-outline" size={13} color={colors.white} />
        </View>

        <View style={styles.discWrap}>
          <View style={styles.disc}>
            <Ionicons name="sync-circle" size={30} color={colors.white} />
          </View>
          <Text style={[styles.accent, styles.accentTop]}>🎁</Text>
          <Text style={[styles.accent, styles.accentLeft]}>⭐</Text>
          <Text style={[styles.accent, styles.accentRight]}>💎</Text>
        </View>

        <View style={styles.copy}>
          <Text style={styles.title}>Spin &amp; Win</Text>
          <Text style={styles.subtitle}>Daily free spins for bonus Runs</Text>
        </View>
      </LinearGradient>
    </PressableScale>
  );
}

const DISC_SIZE = 56;

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    minHeight: 152,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    overflow: 'hidden',
  },
  expandBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discWrap: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    width: DISC_SIZE,
    height: DISC_SIZE,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accent: { position: 'absolute', fontSize: 18 },
  accentTop: { top: -2 },
  accentLeft: { left: -4, bottom: 8 },
  accentRight: { right: -6, bottom: 8 },
  copy: { flex: 1, gap: 2 },
  title: { ...typography.h3, color: colors.white },
  subtitle: { ...typography.caption, color: 'rgba(255,255,255,0.85)' },
});
