import React from 'react';
import { GestureResponderEvent, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

function tapHaptic() {
  if (Platform.OS === 'web') return;
  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}); } catch {}
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptics?: boolean;
  disabled?: boolean;
};

export function PressableScale({ children, style, scaleTo = 0.96, haptics = true, disabled, onPressIn, onPressOut, ...rest }: Props) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

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
    <AnimatedPressable {...rest} disabled={disabled} onPressIn={handlePressIn} onPressOut={handlePressOut} style={[style, animatedStyle]}>
      {children}
    </AnimatedPressable>
  );
}
