import React from 'react';
import { GestureResponderEvent, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { tapHaptic } from '../../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** How far it shrinks on press-in — 0.96 is a subtle, premium press. */
  scaleTo?: number;
  /** Light haptic tap on press-in. Set false for dense repeated taps (e.g. steppers). */
  haptics?: boolean;
  disabled?: boolean;
};

// A drop-in Pressable replacement that adds a spring-based scale-down-on-press
// plus a light haptic tap — the "every tappable element feels responsive"
// primitive the rest of the animation system builds on. Kept intentionally
// tiny: no dynamic function-as-style support (that's resolved internally by
// RN's own Pressable and doesn't compose with a Reanimated-driven transform),
// callers pass a plain style and read `disabled` themselves if they need to
// dim it.
export function PressableScale({
  children,
  style,
  scaleTo = 0.96,
  haptics = true,
  disabled,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: GestureResponderEvent) => {
    scale.value = withSpring(scaleTo, { damping: 14, stiffness: 260, mass: 0.6 });
    if (haptics) tapHaptic();
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    scale.value = withSpring(1, { damping: 12, stiffness: 220, mass: 0.6 });
    onPressOut?.(e);
  };

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
