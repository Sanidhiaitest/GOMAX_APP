import React, { useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { GlowBorder, PressableScale, RewardBurst, UnlockReveal } from '../../components/animations';
import { useApp } from '../../state/AppContext';
import { RootStackParamList } from '../../navigation/types';
import { softHaptic, successHaptic } from '../../utils/haptics';

type Props = NativeStackScreenProps<RootStackParamList, 'SpinWheel'>;

// Layout follows the founder's reference screenshot (back+label header,
// segmented tab row, big title, "spins remaining" pill, wheel, tap hint) —
// but recolored in GoMax's own softened orange/navy palette instead of the
// reference's purple/gold, and copy switched to the same Hinglish voice
// already used on Wallet ("Apni kamai dekho", "Paise Nikalo") since masons
// are the audience here. Only "Spin & Jeeto" is a real, built screen — the
// other two tabs are visual-only placeholders per the "don't build things we
// can't launch yet" rule; tapping them just gives a soft haptic, no dead nav.
const TABS = ['Video Dekho', 'Spin & Jeeto', 'Shop Karo'] as const;

const SEGMENTS = [
  { label: '100', runs: 100 },
  { label: '20', runs: 20 },
  { label: '50', runs: 50 },
  { label: '10', runs: 10 },
  { label: 'Fir Try', runs: 0 },
  { label: '40', runs: 40 },
  { label: '20', runs: 20 },
  { label: '80', runs: 80 },
];

const DAILY_SPIN_LIMIT = 3;
const SIZE = 300;
const RING_WIDTH = 10;
const RADIUS = SIZE / 2;
const WHEEL_RADIUS = RADIUS - RING_WIDTH;
const SEG_ANGLE = 360 / SEGMENTS.length;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function segmentPath(index: number, r: number) {
  const start = polar(RADIUS, RADIUS, r, index * SEG_ANGLE);
  const end = polar(RADIUS, RADIUS, r, (index + 1) * SEG_ANGLE);
  const largeArc = SEG_ANGLE > 180 ? 1 : 0;
  return `M${RADIUS},${RADIUS} L${start.x},${start.y} A${r},${r} 0 ${largeArc} 1 ${end.x},${end.y} Z`;
}

export function SpinWheelScreen({ navigation }: Props) {
  const { addRuns } = useApp();
  const rotation = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(DAILY_SPIN_LIMIT);
  const [result, setResult] = useState<{ label: string; runs: number } | null>(null);
  const [burstTrigger, setBurstTrigger] = useState(0);
  const currentRotation = useRef(0);

  const canSpin = !spinning && spinsLeft > 0;

  const onSpin = () => {
    if (!canSpin) return;
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
      setSpinsLeft((n) => Math.max(0, n - 1));
    });
  };

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '1deg'] });

  return (
    <Screen backgroundColor={colors.white} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={8}>
          <Ionicons name="chevron-back" size={20} color={colors.navy800} />
          <Text style={styles.backButtonText}>Inaam Kamao</Text>
        </Pressable>
      </View>

      <View style={styles.tabTrough}>
        {TABS.map((tab) => {
          const active = tab === 'Spin & Jeeto';
          return (
            <Pressable
              key={tab}
              style={[styles.tabPill, active && styles.tabPillActive]}
              onPress={() => !active && softHaptic()}
            >
              <Text style={[styles.tabPillText, active && styles.tabPillTextActive]}>{tab}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.title}>Ghumao aur Jeeto!</Text>
      <Text style={styles.subtitle}>Har din free spin — Runs jeeto</Text>

      <View style={styles.spinPill}>
        <Text style={styles.spinPillText}>
          {spinsLeft > 0 ? `Aaj ${spinsLeft} spin baaki hain` : 'Aaj ke spin khatam — kal phir aana'}
        </Text>
        <View style={styles.spinPillIcon}>
          <Ionicons name="information" size={11} color={colors.white} />
        </View>
      </View>

      <View style={styles.wheelWrap}>
        <View style={styles.pointer} />
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <Circle cx={RADIUS} cy={RADIUS} r={RADIUS - 1} fill={colors.orange500} />
            {SEGMENTS.map((seg, i) => (
              <Path
                key={i}
                d={segmentPath(i, WHEEL_RADIUS)}
                fill={i % 2 === 0 ? colors.navy800 : colors.navy700}
                stroke={colors.orange500}
                strokeWidth={1.5}
              />
            ))}
            {SEGMENTS.map((seg, i) => {
              const mid = polar(RADIUS, RADIUS, WHEEL_RADIUS * 0.6, i * SEG_ANGLE + SEG_ANGLE / 2);
              return (
                <SvgText
                  key={`label-${i}`}
                  x={mid.x}
                  y={mid.y}
                  fill={colors.white}
                  fontSize={seg.label === 'Fir Try' ? 12 : 18}
                  fontWeight="800"
                  textAnchor="middle"
                >
                  {seg.label}
                </SvgText>
              );
            })}
          </Svg>
        </Animated.View>
        <PressableScale onPress={onSpin} disabled={!canSpin} style={[styles.hub, !canSpin && styles.hubDisabled]}>
          <Ionicons name="sync" size={22} color={colors.white} />
        </PressableScale>
      </View>

      <Text style={styles.tapHint}>{canSpin ? 'Wheel par tap karo' : 'Spin kal phir milega'}</Text>

      <View style={styles.footer}>
        {canSpin ? (
          <GlowBorder
            cornerRadius={radius.pill}
            borderWidth={2}
            backgroundColor={colors.white}
            colorsSet={[colors.orange500, colors.navy700, colors.orange600, colors.orange500]}
          >
            <Button label="🎯 Spin Karo" onPress={onSpin} disabled={!canSpin} loading={spinning} icon={null} />
          </GlowBorder>
        ) : null}
      </View>

      <Modal visible={!!result} transparent animationType="fade">
        <View style={styles.resultBackdrop}>
          <View style={styles.resultCard}>
            <RewardBurst trigger={burstTrigger} colorsSet={[colors.orange500, colors.navy700, colors.orange600, colors.white]} />
            <UnlockReveal visible={!!result} glow={!!result && result.runs > 0} glowColor={colors.orange500}>
              <Text style={styles.resultEmoji}>{result && result.runs > 0 ? '🎉' : '😅'}</Text>
              <Text style={styles.resultTitle}>{result && result.runs > 0 ? `+${result.runs} Runs Mile!` : 'Agli baar zaroor!'}</Text>
            </UnlockReveal>
            {result && result.runs > 0 ? (
              <Text style={styles.resultSubtitle}>Aapke Runs balance mein add ho gaya</Text>
            ) : (
              <Text style={styles.resultSubtitle}>Kal phir try karo!</Text>
            )}
            <Button label="Shabaash!" onPress={() => setResult(null)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 2, height: 40 },
  backButtonText: { ...m3Type.titleMedium, fontSize: 15, color: colors.navy800 },
  tabTrough: {
    flexDirection: 'row',
    backgroundColor: colors.orange100,
    borderRadius: radius.pill,
    padding: 4,
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  tabPill: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: radius.pill },
  tabPillActive: { backgroundColor: colors.primary700 },
  tabPillText: { ...m3Type.labelLarge, fontSize: 11.5, color: colors.navy700, fontWeight: '700' },
  tabPillTextActive: { color: colors.white },
  title: { ...m3Type.headlineMedium, fontSize: 26, fontWeight: '800', color: colors.navy800, textAlign: 'center', marginTop: spacing.xl },
  subtitle: { ...m3Type.labelLarge, color: colors.neutral500, textAlign: 'center', marginTop: 4 },
  spinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'center',
    backgroundColor: colors.orange100,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.lg,
  },
  spinPillText: { ...m3Type.labelLarge, fontSize: 12.5, color: colors.orange600, fontWeight: '700' },
  spinPillIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.orange500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelWrap: { alignItems: 'center', justifyContent: 'center', marginTop: spacing.xxl },
  pointer: {
    position: 'absolute',
    top: -10,
    zIndex: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 13,
    borderRightWidth: 13,
    borderTopWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.orange600,
  },
  hub: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.orange500,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  hubDisabled: { opacity: 0.5 },
  tapHint: { ...m3Type.labelMedium, color: colors.neutral400, textAlign: 'center', marginTop: spacing.md },
  footer: { paddingHorizontal: spacing.xl, marginTop: 'auto', paddingBottom: spacing.xl },
  resultBackdrop: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  resultCard: { width: '100%', backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xxl, alignItems: 'center', gap: spacing.sm, position: 'relative', overflow: 'hidden' },
  resultEmoji: { fontSize: 48 },
  resultTitle: { ...m3Type.headlineMedium, color: colors.navy800 },
  resultSubtitle: { ...m3Type.labelLarge, color: colors.neutral500, marginBottom: spacing.lg },
});
