import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme';

type Props = {
  visible: boolean;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Adds a soft radial-ish glow flash behind the content as it appears. */
  glow?: boolean;
  glowColor?: string;
};

// A satisfying scale + fade (+ optional glow flash) reveal for a prize or
// reward appearing — the spin wheel's result, a scratch card's back face,
// a claimed challenge badge. Driven by a spring so it overshoots slightly
// and settles, rather than a linear/robotic fade.
export function UnlockReveal({ visible, children, style, glow = false, glowColor = colors.orange500 }: Props) {
  const progress = useSharedValue(visible ? 1 : 0);
  const glowPulse = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      progress.value = withSpring(1, { damping: 9, stiffness: 120, mass: 0.9 });
      if (glow) {
        glowPulse.value = 0;
        glowPulse.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
      }
    } else {
      progress.value = withTiming(0, { duration: 160 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, glow]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, Math.min(1, progress.value)),
    transform: [{ scale: 0.5 + progress.value * 0.5 }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: (1 - glowPulse.value) * 0.5,
    transform: [{ scale: 0.6 + glowPulse.value * 0.9 }],
  }));

  return (
    <Animated.View style={[styles.wrap, style]}>
      {glow ? (
        <Animated.View pointerEvents="none" style={[styles.glow, glowStyle, { backgroundColor: glowColor }]} />
      ) : null}
      <Animated.View style={contentStyle}>{children}</Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
});
