import React, { useMemo, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { GlowBorder, RewardBurst, UnlockReveal } from '../../components/animations';
import { useApp } from '../../state/AppContext';
import { RootStackParamList } from '../../navigation/types';
import { softHaptic, successHaptic } from '../../utils/haptics';

type Props = NativeStackScreenProps<RootStackParamList, 'SpinWheel'>;

const SEGMENTS = [
  { label: '10 Runs', runs: 10, color: colors.secondary700 },
  { label: '25 Runs', runs: 25, color: colors.primary700 },
  { label: 'Try Again', runs: 0, color: colors.secondary500 },
  { label: '50 Runs', runs: 50, color: colors.primary600 },
  { label: '20 Runs', runs: 20, color: colors.secondary700 },
  { label: 'JACKPOT', runs: 100, color: colors.primary700 },
];

const SIZE = 280;
const RADIUS = SIZE / 2;
const SEG_ANGLE = 360 / SEGMENTS.length;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function segmentPath(index: number) {
  const start = polar(RADIUS, RADIUS, RADIUS, index * SEG_ANGLE);
  const end = polar(RADIUS, RADIUS, RADIUS, (index + 1) * SEG_ANGLE);
  const largeArc = SEG_ANGLE > 180 ? 1 : 0;
  return `M${RADIUS},${RADIUS} L${start.x},${start.y} A${RADIUS},${RADIUS} 0 ${largeArc} 1 ${end.x},${end.y} Z`;
}

const STREAK_DAYS = 4;

export function SpinWheelScreen({ navigation }: Props) {
  const { addRuns } = useApp();
  const rotation = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ label: string; runs: number } | null>(null);
  const [burstTrigger, setBurstTrigger] = useState(0);
  const currentRotation = useRef(0);

  const onSpin = () => {
    if (spinning) return;
    setSpinning(true);
    const winIndex = Math.floor(Math.random() * SEGMENTS.length);
    const segmentCenter = winIndex * SEG_ANGLE + SEG_ANGLE / 2;
    const extraSpins = 5 * 360;
    const target = currentRotation.current + extraSpins + (360 - (segmentCenter % 360));

    Animated.timing(rotation, {
      toValue: target,
      duration: 3200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      currentRotation.current = target % 360;
      const won = SEGMENTS[winIndex];
      if (won.runs > 0) {
        addRuns(won.runs);
        setBurstTrigger((n) => n + 1);
        successHaptic();
      } else {
        softHaptic();
      }
      setResult({ label: won.label, runs: won.runs });
      setSpinning(false);
    });
  };

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1deg'],
  });

  return (
    <Screen backgroundColor={colors.secondary800} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Daily Spin</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.subtitle}>1 free spin every day — win Runs!</Text>

      <View style={styles.wheelWrap}>
        <View style={styles.pointer} />
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <Circle cx={RADIUS} cy={RADIUS} r={RADIUS} fill={colors.secondary700} />
            {SEGMENTS.map((seg, i) => (
              <Path key={i} d={segmentPath(i)} fill={seg.color} stroke={colors.secondary800} strokeWidth={2} />
            ))}
            {SEGMENTS.map((seg, i) => {
              const mid = polar(RADIUS, RADIUS, RADIUS * 0.62, i * SEG_ANGLE + SEG_ANGLE / 2);
              return (
                <SvgText
                  key={`label-${i}`}
                  x={mid.x}
                  y={mid.y}
                  fill={colors.white}
                  fontSize={13}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {seg.label}
                </SvgText>
              );
            })}
            <Circle cx={RADIUS} cy={RADIUS} r={22} fill={colors.white} />
          </Svg>
        </Animated.View>
        <View style={styles.hub}>
          <Ionicons name="sync" size={18} color={colors.primary700} />
        </View>
      </View>

      <View style={styles.streakRow}>
        {Array.from({ length: 7 }, (_, i) => (
          <View key={i} style={[styles.streakDot, i < STREAK_DAYS && styles.streakDotDone]} />
        ))}
      </View>

      <View style={styles.footer}>
        <GlowBorder cornerRadius={radius.lg} borderWidth={2} backgroundColor={colors.secondary800} active={!spinning}>
          <Button
            label={spinning ? 'Spinning…' : '🎯 SPIN'}
            onPress={onSpin}
            disabled={spinning}
            loading={spinning}
            icon={null}
          />
        </GlowBorder>
        <Text style={styles.footerHint}>Spin resets in Scratch card with your reward</Text>
      </View>

      <Modal visible={!!result} transparent animationType="fade">
        <View style={styles.resultBackdrop}>
          <View style={styles.resultCard}>
            <RewardBurst trigger={burstTrigger} />
            <UnlockReveal visible={!!result} glow={!!result && result.runs > 0}>
              <Text style={styles.resultEmoji}>{result && result.runs > 0 ? '🎉' : '😅'}</Text>
              <Text style={styles.resultTitle}>{result?.label}</Text>
            </UnlockReveal>
            {result && result.runs > 0 ? (
              <Text style={styles.resultSubtitle}>Added to your Runs balance</Text>
            ) : (
              <Text style={styles.resultSubtitle}>Better luck tomorrow!</Text>
            )}
            <Button label="Nice!" onPress={() => setResult(null)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...m3Type.titleLarge, color: colors.white },
  subtitle: { ...m3Type.labelLarge, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginTop: spacing.sm },
  wheelWrap: { alignItems: 'center', justifyContent: 'center', marginTop: spacing.xxxl },
  pointer: {
    position: 'absolute',
    top: -6,
    zIndex: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.primary600,
  },
  hub: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.xxl },
  streakDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  streakDotDone: { backgroundColor: colors.primary600 },
  footer: { paddingHorizontal: spacing.xl, marginTop: 'auto', paddingBottom: spacing.xl, gap: spacing.md },
  footerHint: { ...m3Type.labelMedium, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  resultBackdrop: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  resultCard: { width: '100%', backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xxl, alignItems: 'center', gap: spacing.sm, position: 'relative', overflow: 'hidden' },
  resultEmoji: { fontSize: 48 },
  resultTitle: { ...m3Type.headlineMedium, color: colors.secondary700 },
  resultSubtitle: { ...m3Type.labelLarge, color: colors.neutral500, marginBottom: spacing.lg },
});
