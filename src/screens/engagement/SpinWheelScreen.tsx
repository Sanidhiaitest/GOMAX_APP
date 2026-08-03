import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import Reanimated, {
  Easing as ReanimatedEasing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Screen } from '../../components/Screen';
import { PressableScale, RewardBurst, UnlockReveal } from '../../components/animations';
import { Button } from '../../components/Button';
import { useApp } from '../../state/AppContext';
import { useSpinsUsedToday } from '../../hooks/useAppData';
import { spinWheel } from '../../services/spin';
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

// Full wheel, fully visible, centered in the space between the pill and the
// bottom of the screen — not cropped or bottom-anchored.
const SCREEN_WIDTH = Dimensions.get('window').width;
const SIZE = Math.round(Math.min(SCREEN_WIDTH * 0.82, 320));
const RING_WIDTH = 10;
const RADIUS = SIZE / 2;
const WHEEL_RADIUS = RADIUS - RING_WIDTH;
const SEG_ANGLE = 360 / SEGMENTS.length;
const HUB_SIZE = 56;

// --- "Mounted on a stand, under a light rig" dressing — fake dimensionality
// with layered 2D SVG/Reanimated rather than a real 3D engine (see the
// founder-brief note at the top of this screen's task for why: Three.js is
// web/WebGL-only, and a real expo-gl 3D wheel is a heavy lift for a
// decorative widget). All of the below is additive visual polish only — the
// segment values, spin mechanic, spin-limit copy, and result modal are
// untouched.

// Rim lights: small bulbs embedded mid-band in the metallic rim itself (not
// just outside the disc — outside it, they'd sit over the plain white
// screen background and a white/near-white bulb is invisible against white).
// Sitting on the rim band means they spin with the wheel, same as bulbs on a
// real carnival prize wheel's rim.
const RIM_LIGHT_COUNT = 12;
const RIM_LIGHT_RADIUS = RADIUS - RING_WIDTH / 2;

// Pedestal: a trapezoid "neck" + a base bar beneath the wheel.
const PEDESTAL_TOP_W = SIZE * 0.5;
const PEDESTAL_BOTTOM_W = SIZE * 0.74;
const PEDESTAL_BASE_W = SIZE * 0.88;
const PEDESTAL_TRAPEZOID_H = 32;
const PEDESTAL_BASE_H = 14;
const PEDESTAL_SVG_H = PEDESTAL_TRAPEZOID_H + PEDESTAL_BASE_H + 6;
const PEDESTAL_OVERLAP = 6; // pedestal sits slightly under the wheel's bottom edge

const COMPOSITION_WIDTH = SIZE + 48;
const COMPOSITION_HEIGHT = SIZE + PEDESTAL_SVG_H - PEDESTAL_OVERLAP;

// Ambient background particles: a handful of slow, low-opacity drifting
// specks behind the whole composition — always running while the screen is
// visible. Deliberately separate from `RewardBurst` (which is a one-shot
// on-win celebration) and deliberately simple/cheap: plain Reanimated Views
// looping transform + opacity, nothing more elaborate.
const AMBIENT_PARTICLE_COUNT = 8;
const AMBIENT_COLORS = [colors.orange500, colors.orange600, colors.navy700, colors.secondary500];

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

function pedestalTrapezoidPath(cx: number) {
  const topHalf = PEDESTAL_TOP_W / 2;
  const bottomHalf = PEDESTAL_BOTTOM_W / 2;
  return `M${cx - topHalf},0 L${cx + topHalf},0 L${cx + bottomHalf},${PEDESTAL_TRAPEZOID_H} L${cx - bottomHalf},${PEDESTAL_TRAPEZOID_H} Z`;
}

const AnimatedCircle = Reanimated.createAnimatedComponent(Circle);

// One rim-light bulb: a staggered, breathing opacity pulse — same
// useSharedValue + withRepeat(withTiming(...)) idiom as `GlowBorder`'s glow,
// just applied to an SVG circle's opacity instead of a View's style, and
// offset per-light via `withDelay` so they don't all pulse in lockstep.
function RimLight({ cx, cy, r, color, delay }: { cx: number; cy: number; r: number; color: string; delay: number }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 1300, easing: ReanimatedEasing.inOut(ReanimatedEasing.sin) }), -1, true)
    );
    return () => cancelAnimation(pulse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    opacity: 0.45 + pulse.value * 0.5,
  }));

  return <AnimatedCircle cx={cx} cy={cy} r={r} fill={color} animatedProps={animatedProps} />;
}

type AmbientParticleConfig = {
  leftPct: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
};

function AmbientParticle({ config, fieldHeight }: { config: AmbientParticleConfig; fieldHeight: number }) {
  const fall = useSharedValue(0);

  useEffect(() => {
    fall.value = withDelay(
      config.delay,
      withRepeat(withTiming(1, { duration: config.duration, easing: ReanimatedEasing.linear }), -1, false)
    );
    return () => cancelAnimation(fall);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => {
    const translateY = -16 + fall.value * (fieldHeight + 32);
    // Sin-shaped opacity means the particle fades to 0 right at the loop
    // boundary, so restarting from the top never pops/snaps visibly.
    const opacity = Math.sin(fall.value * Math.PI) * 0.35;
    return { transform: [{ translateY }], opacity };
  });

  return (
    <Reanimated.View
      style={[
        styles.ambientParticle,
        style,
        {
          left: `${config.leftPct}%`,
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: config.color,
        },
      ]}
    />
  );
}

function AmbientParticles({ fieldHeight }: { fieldHeight: number }) {
  const particles = useMemo<AmbientParticleConfig[]>(
    () =>
      Array.from({ length: AMBIENT_PARTICLE_COUNT }, (_, i) => ({
        leftPct: 8 + Math.random() * 84,
        size: 3 + Math.random() * 4,
        color: AMBIENT_COLORS[i % AMBIENT_COLORS.length],
        duration: 5200 + Math.random() * 3600,
        delay: Math.random() * 4000,
      })),
    []
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {particles.map((p, i) => (
        <AmbientParticle key={i} config={p} fieldHeight={fieldHeight} />
      ))}
    </View>
  );
}

export function SpinWheelScreen({ navigation }: Props) {
  const { refreshProfile } = useApp();
  const { data: spinsUsedToday, reload: reloadSpinsUsed } = useSpinsUsedToday();
  const rotation = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ label: string; runs: number } | null>(null);
  const [burstTrigger, setBurstTrigger] = useState(0);
  const currentRotation = useRef(0);

  const spinsLeft = Math.max(0, DAILY_SPIN_LIMIT - spinsUsedToday);
  const canSpin = !spinning && spinsLeft > 0;

  const onSpin = async () => {
    if (!canSpin) return;
    setSpinning(true);
    setError('');
    try {
      const res = await spinWheel();
      if (!res.success) {
        setSpinning(false);
        if (res.error === 'daily_limit_reached') {
          await reloadSpinsUsed();
        } else {
          setError('Could not spin right now. Try again.');
        }
        return;
      }

      // Land on a segment matching the server's chosen prize so the wheel
      // animation reflects the real (server-decided) outcome.
      const winIndex = SEGMENTS.findIndex((s) => s.label === res.prizeLabel && s.runs === res.runsAwarded);
      const resolvedIndex = winIndex >= 0 ? winIndex : 0;
      const segmentCenter = resolvedIndex * SEG_ANGLE + SEG_ANGLE / 2;
      const extraSpins = 5 * 360;
      const target = currentRotation.current + extraSpins + (360 - (segmentCenter % 360));

      Animated.timing(rotation, {
        toValue: target,
        duration: 3200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(async () => {
        currentRotation.current = target % 360;
        if (res.runsAwarded > 0) {
          setBurstTrigger((n) => n + 1);
          successHaptic();
        } else {
          softHaptic();
        }
        setResult({ label: res.prizeLabel, runs: res.runsAwarded });
        setSpinning(false);
        await Promise.all([refreshProfile(), reloadSpinsUsed()]);
      });
    } catch (e) {
      setSpinning(false);
      setError(e instanceof Error ? e.message : 'Could not spin right now. Try again.');
    }
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
        <View style={[styles.wheelComposition, { width: COMPOSITION_WIDTH, height: COMPOSITION_HEIGHT }]}>
          <AmbientParticles fieldHeight={COMPOSITION_HEIGHT} />

          <View style={styles.wheelWrap}>
            <View style={styles.pointer} />
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                <Defs>
                  {/* Metallic/chrome rim: multi-stop gradient (light highlight →
                      mid orange → darker shadow edge) derived from the existing
                      orange scale, instead of a flat fill. */}
                  <RadialGradient id="rimGrad" cx="35%" cy="30%" r="75%">
                    <Stop offset="0" stopColor={colors.orange50} />
                    <Stop offset="0.55" stopColor={colors.orange500} />
                    <Stop offset="1" stopColor={colors.orange600} />
                  </RadialGradient>
                </Defs>
                <Circle cx={RADIUS} cy={RADIUS} r={RADIUS - 1} fill="url(#rimGrad)" stroke={colors.orange600} strokeWidth={1} />
                {/* Thin highlight + shadow lines fake a beveled edge on the rim. */}
                <Circle cx={RADIUS} cy={RADIUS} r={RADIUS - 2.5} fill="none" stroke={colors.orange50} strokeWidth={1.2} opacity={0.55} />
                <Circle cx={RADIUS} cy={RADIUS} r={WHEEL_RADIUS + 1} fill="none" stroke={colors.orange600} strokeWidth={1.4} opacity={0.5} />
                {/* Rim lights: small bulbs embedded in the metallic rim band
                    itself, so they read against the rim's orange tones
                    instead of vanishing against the white screen background. */}
                {Array.from({ length: RIM_LIGHT_COUNT }, (_, i) => {
                  const pos = polar(RADIUS, RADIUS, RIM_LIGHT_RADIUS, i * (360 / RIM_LIGHT_COUNT));
                  return <RimLight key={i} cx={pos.x} cy={pos.y} r={2.6} color={colors.white} delay={(i * 1400) / RIM_LIGHT_COUNT} />;
                })}
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
                  const iconPos = polar(RADIUS, RADIUS, WHEEL_RADIUS * 0.7, angle);
                  const labelPos = polar(RADIUS, RADIUS, WHEEL_RADIUS * 0.45, angle);
                  return (
                    <React.Fragment key={`seg-content-${i}`}>
                      <SvgText x={iconPos.x} y={iconPos.y} fontSize={16} textAnchor="middle">
                        {seg.icon}
                      </SvgText>
                      <SvgText
                        x={labelPos.x}
                        y={labelPos.y}
                        fill={colors.white}
                        fontSize={seg.label === 'Again' ? 12 : 17}
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
            <PressableScale onPress={onSpin} disabled={!canSpin} style={[styles.hub, !canSpin && styles.hubDisabled]}>
              <Ionicons name="sync" size={22} color={colors.white} />
            </PressableScale>
          </View>

          <View style={styles.pedestalWrap}>
            <Svg width={SIZE} height={PEDESTAL_SVG_H} viewBox={`0 0 ${SIZE} ${PEDESTAL_SVG_H}`}>
              <Defs>
                <LinearGradient id="pedestalGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colors.orange500} />
                  <Stop offset="1" stopColor={colors.orange600} />
                </LinearGradient>
                <LinearGradient id="pedestalBaseGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={colors.navy800} />
                  <Stop offset="1" stopColor={colors.navy700} />
                </LinearGradient>
              </Defs>
              <Path d={pedestalTrapezoidPath(SIZE / 2)} fill="url(#pedestalGrad)" />
              <Rect
                x={(SIZE - PEDESTAL_BASE_W) / 2}
                y={PEDESTAL_TRAPEZOID_H + 4}
                width={PEDESTAL_BASE_W}
                height={PEDESTAL_BASE_H}
                rx={7}
                fill="url(#pedestalBaseGrad)"
              />
            </Svg>
          </View>
        </View>

        <Text style={styles.tapHint}>{canSpin ? 'Tap the wheel to spin' : 'New spins tomorrow'}</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  wheelSection: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  wheelComposition: { alignItems: 'center' },
  wheelWrap: { alignItems: 'center', justifyContent: 'center' },
  pedestalWrap: { marginTop: -PEDESTAL_OVERLAP },
  ambientParticle: { position: 'absolute', top: 0 },
  pointer: {
    position: 'absolute',
    top: -9,
    zIndex: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.orange600,
  },
  hub: {
    position: 'absolute',
    width: HUB_SIZE,
    height: HUB_SIZE,
    borderRadius: radius.pill,
    backgroundColor: colors.orange500,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  hubDisabled: { opacity: 0.5 },
  tapHint: { ...m3Type.labelMedium, color: colors.neutral400, textAlign: 'center' },
  errorText: { ...m3Type.labelMedium, color: colors.danger, textAlign: 'center', marginTop: spacing.sm },
  resultBackdrop: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  resultCard: { width: '100%', backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xxl, alignItems: 'center', gap: spacing.sm, position: 'relative', overflow: 'hidden' },
  resultEmoji: { fontSize: 48 },
  resultTitle: { ...m3Type.headlineMedium, color: colors.navy800 },
  resultSubtitle: { ...m3Type.labelLarge, color: colors.neutral500, marginBottom: spacing.lg },
});
