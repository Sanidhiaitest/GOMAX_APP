import React, { useEffect, useMemo, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme';

type Particle = {
  angle: number;
  distance: number;
  rotate: number;
  color: string;
  size: number;
  square: boolean;
  delay: number;
};

const DEFAULT_COLORS = [colors.orange500, colors.orange600, colors.secondary500, colors.success, colors.white];

function makeParticles(count: number, colorsSet: string[]): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    // Spread evenly around the circle with a little jitter so it doesn't
    // read as a mechanical pinwheel, plus a spread of distances/delays so
    // the burst has depth rather than every piece arriving together —
    // loosely modeled on how particle-system emitters (D3/Three.js force &
    // particle demos) vary per-particle velocity, not just direction.
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    return {
      angle,
      distance: 70 + Math.random() * 90,
      rotate: Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1),
      color: colorsSet[i % colorsSet.length],
      size: 5 + Math.random() * 6,
      square: Math.random() > 0.55,
      delay: Math.random() * 0.18,
    };
  });
}

function BurstParticle({ progress, p }: { progress: SharedValue<number>; p: Particle }) {
  const style = useAnimatedStyle(() => {
    const span = 1 - p.delay;
    const t = span > 0 ? Math.min(1, Math.max(0, (progress.value - p.delay) / span)) : 1;
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic — snappy launch, soft settle
    const gravity = t * t * 46; // gentle downward drift once the burst opens up, like falling confetti
    const tx = Math.cos(p.angle) * p.distance * eased;
    const ty = Math.sin(p.angle) * p.distance * eased + gravity;
    const opacity = t <= 0 ? 0 : 1 - Math.pow(t, 2.4);
    const scale = t <= 0 ? 0 : Math.min(1, t * 3);
    return {
      opacity,
      transform: [{ translateX: tx }, { translateY: ty }, { rotate: `${p.rotate * eased}deg` }, { scale }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        style,
        {
          backgroundColor: p.color,
          width: p.size,
          height: p.size,
          borderRadius: p.square ? 1.5 : p.size / 2,
        },
      ]}
    />
  );
}

type Props = {
  /** Bump this number (e.g. Date.now() or a counter) each time you want a burst to fire. */
  trigger: number;
  count?: number;
  colorsSet?: string[];
  duration?: number;
  style?: StyleProp<ViewStyle>;
};

// A contained confetti/particle burst for "unlock" moments — spin wheel win,
// scratch card reveal, challenge claimed, redemption success. Renders
// absolutely-positioned over whatever it's placed inside (wrap it in a
// `position: relative` container sized to where you want the burst centered),
// and unmounts itself once the animation finishes so it never blocks input.
export function RewardBurst({ trigger, count = 22, colorsSet = DEFAULT_COLORS, duration = 1100, style }: Props) {
  const progress = useSharedValue(0);
  const [visible, setVisible] = useState(false);
  const particles = useMemo(() => makeParticles(count, colorsSet), [count, colorsSet]);

  useEffect(() => {
    if (!trigger) return;
    setVisible(true);
    progress.value = 0;
    progress.value = withTiming(1, { duration, easing: Easing.out(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(setVisible)(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center, style]}>
      {particles.map((p, i) => (
        <BurstParticle key={i} progress={progress} p={p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  particle: { position: 'absolute' },
});
