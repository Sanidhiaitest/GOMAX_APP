import React, { useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Screen } from '../../components/Screen';
import { PressableScale, RewardBurst, UnlockReveal } from '../../components/animations';
import { Button } from '../../components/Button';
import { useApp } from '../../state/AppContext';
import { RootStackParamList } from '../../navigation/types';
import { softHaptic, successHaptic } from '../../utils/haptics';

type Props = NativeStackScreenProps<RootStackParamList, 'SpinWheel'>;

// Layout follows the founder's reference screenshot (back+label header, big
// title, "spins remaining" pill, edge-to-edge bottom-anchored wheel, tap
// hint) — recolored in GoMax's own softened orange/navy palette. No tab row:
// only Spin & Win is a real, built feature here, so the screen only shows
// what a mason can actually do. Copy stays mostly English with a couple of
// Hindi words for local flavor, consistent with the rest of the app.
const SEGMENTS = [
  { label: '100', icon: '⭐', runs: 100 },
  { label: '20', icon: '🪙', runs: 20 },
  { label: '50', icon: '💰', runs: 50 },
  { label: '10', icon: '🪙', runs: 10 },
  { label: 'Again', icon: '🔄', runs: 0 },
  { label: '40', icon: '💰', runs: 40 },
  { label: '20', icon: '🪙', runs: 20 },
  { label: '80', icon: '💎', runs: 80 },
];

const DAILY_SPIN_LIMIT = 3;

// Bottom-anchored, edge-to-edge wheel per the founder's reference: the wheel
// is wider than the screen and centered below it, so only its top arc peeks
// up from the bottom edge with the spin hub sitting right at the seam —
// rather than a small wheel floating mid-screen.
const SCREEN_WIDTH = Dimensions.get('window').width;
const SIZE = Math.round(SCREEN_WIDTH * 1.55);
const RING_WIDTH = 12;
const RADIUS = SIZE / 2;
const WHEEL_RADIUS = RADIUS - RING_WIDTH;
const SEG_ANGLE = 360 / SEGMENTS.length;
const HUB_SIZE = 60;
const POINTER_CLEARANCE = 26;
const WHEEL_TOP = HUB_SIZE / 2 + POINTER_CLEARANCE;
const VISIBLE_HEIGHT = WHEEL_TOP + RADIUS;
const WHEEL_LEFT = (SCREEN_WIDTH - SIZE) / 2;

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
          <Text style={styles.backButtonText}>Earn Runs</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Spin &amp; Win</Text>
      <Text style={styles.subtitle}>Spin daily to win bonus Runs</Text>

      <View style={styles.spinPill}>
        <Text style={styles.spinPillText}>
          {spinsLeft > 0 ? `${spinsLeft} spin${spinsLeft > 1 ? 's' : ''} left today` : 'No spins left — come back tomorrow'}
        </Text>
        <View style={styles.spinPillIcon}>
          <Ionicons name="information" size={11} color={colors.white} />
        </View>
      </View>

      <View style={styles.wheelSection}>
        <Text style={styles.tapHint}>{canSpin ? 'Tap the wheel to spin' : 'New spins tomorrow'}</Text>

        <View style={styles.wheelClip}>
          <View style={styles.pointer} />
          <Animated.View style={[styles.wheelAbs, { transform: [{ rotate: spin }] }]}>
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
                const angle = i * SEG_ANGLE + SEG_ANGLE / 2;
                const iconPos = polar(RADIUS, RADIUS, WHEEL_RADIUS * 0.72, angle);
                const labelPos = polar(RADIUS, RADIUS, WHEEL_RADIUS * 0.52, angle);
                return (
                  <React.Fragment key={`seg-content-${i}`}>
                    <SvgText x={iconPos.x} y={iconPos.y} fontSize={20} textAnchor="middle">
                      {seg.icon}
                    </SvgText>
                    <SvgText
                      x={labelPos.x}
                      y={labelPos.y}
                      fill={colors.white}
                      fontSize={seg.label === 'Again' ? 14 : 20}
                      fontWeight="800"
                      textAnchor="middle"
                    >
                      {seg.label}
                    </SvgText>
                  </React.Fragment>
                );
              })}
            </Svg>
          </Animated.View>
        </View>

        <PressableScale onPress={onSpin} disabled={!canSpin} style={[styles.hub, !canSpin && styles.hubDisabled]}>
          <Ionicons name="sync" size={24} color={colors.white} />
        </PressableScale>
      </View>

      <Modal visible={!!result} transparent animationType="fade">
        <View style={styles.resultBackdrop}>
          <View style={styles.resultCard}>
            <RewardBurst trigger={burstTrigger} colorsSet={[colors.orange500, colors.navy700, colors.orange600, colors.white]} />
            <UnlockReveal visible={!!result} glow={!!result && result.runs > 0} glowColor={colors.orange500}>
              <Text style={styles.resultEmoji}>{result && result.runs > 0 ? '🎉' : '😅'}</Text>
              <Text style={styles.resultTitle}>{result && result.runs > 0 ? `+${result.runs} Runs!` : 'Try again tomorrow'}</Text>
            </UnlockReveal>
            {result && result.runs > 0 ? (
              <Text style={styles.resultSubtitle}>Added to your Runs balance</Text>
            ) : (
              <Text style={styles.resultSubtitle}>Better luck next spin!</Text>
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
  wheelSection: { alignItems: 'center', marginTop: 'auto' },
  wheelClip: { width: '100%', height: VISIBLE_HEIGHT, overflow: 'hidden' },
  wheelAbs: { position: 'absolute', top: WHEEL_TOP - RADIUS, left: WHEEL_LEFT },
  pointer: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -13,
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
    width: HUB_SIZE,
    height: HUB_SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.orange500,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    marginTop: -HUB_SIZE / 2,
  },
  hubDisabled: { opacity: 0.5 },
  tapHint: { ...m3Type.labelMedium, color: colors.neutral400, textAlign: 'center', marginBottom: spacing.md },
  resultBackdrop: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  resultCard: { width: '100%', backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xxl, alignItems: 'center', gap: spacing.sm, position: 'relative', overflow: 'hidden' },
  resultEmoji: { fontSize: 48 },
  resultTitle: { ...m3Type.headlineMedium, color: colors.navy800 },
  resultSubtitle: { ...m3Type.labelLarge, color: colors.neutral500, marginBottom: spacing.lg },
});
