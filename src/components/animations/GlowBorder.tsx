import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius } from '../../theme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Outer corner radius of the whole card. */
  cornerRadius?: number;
  /** Thickness of the glowing ring. */
  borderWidth?: number;
  /** Gradient stops that sweep around the ring — pick 2-4 brand colors. */
  colorsSet?: readonly [string, string, ...string[]];
  /** Fill color for the inset content area — should match the card's own background. */
  backgroundColor?: string;
  /** Milliseconds for one full sweep. */
  speed?: number;
  /** Set false to freeze the animation (e.g. off-screen tabs) without unmounting. */
  active?: boolean;
};

// A "premium CTA" wrapper: a slow-rotating gradient sweep plus a soft
// breathing glow, clipped to a rounded rect so only a ring shows around the
// content — React Native has no conic-gradient primitive, so this
// reimplements the familiar "BorderBeam" / animated-gradient-border pattern
// (seen on 21st.dev-style component galleries and CRED/Duolingo-style reward
// screens) using an oversized rotating LinearGradient plus a Reanimated
// opacity/scale pulse, entirely with transform + opacity — which is the
// subset of styles Reanimated animates reliably on both native and web.
export function GlowBorder({
  children,
  style,
  cornerRadius = radius.lg,
  borderWidth = 2,
  colorsSet,
  backgroundColor = colors.white,
  speed = 3400,
  active = true,
}: Props) {
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      cancelAnimation(rotation);
      cancelAnimation(pulse);
      return;
    }
    rotation.value = withRepeat(withTiming(360, { duration: speed, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => {
      cancelAnimation(rotation);
      cancelAnimation(pulse);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, speed]);

  const beamStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.32 + pulse.value * 0.3,
    transform: [{ scale: 1 + pulse.value * 0.02 }],
  }));

  const gradientColors = colorsSet ?? ([colors.orange500, colors.secondary500, colors.orange600, colors.orange500] as const);

  return (
    <View style={[{ borderRadius: cornerRadius }, styles.clip, style]}>
      {/* soft warm wash — only ever visible in the ring gap, gives the "glow" */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, glowStyle, { backgroundColor: colors.orange500 }]} />

      {/* rotating gradient sweep — gives the "moving" beam. Fixed, generously
          oversized so it fully covers any card/button this wraps without
          needing an onLayout measurement pass. */}
      <Animated.View pointerEvents="none" style={[styles.beamWrap, beamStyle]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.beamGradient}
        />
      </Animated.View>

      {/* inset mask — matches the card's own surface so only the ring shows */}
      <View
        style={[
          styles.inset,
          { margin: borderWidth, borderRadius: Math.max(cornerRadius - borderWidth, 0), backgroundColor },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  beamWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -450,
    marginTop: -450,
    width: 900,
    height: 900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beamGradient: { width: 900, height: 900 },
  inset: { flex: 1, overflow: 'hidden' },
});
