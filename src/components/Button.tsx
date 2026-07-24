import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { colors, fontFamily, radius, spacing, typography } from '../theme';
import { tapHaptic } from '../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = 'primary' | 'secondary' | 'ghost' | 'whatsapp' | 'neutralDisabled';

type Props = {
  label: string;
  onPress?: (e: GestureResponderEvent) => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap | null;
  fullWidth?: boolean;
  roboto?: boolean;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon = 'arrow-forward',
  fullWidth = true,
  roboto = false,
}: Props) {
  const isDisabled = disabled || loading || variant === 'neutralDisabled';
  const pressed = useSharedValue(0);

  const pressedStyle = useAnimatedStyle(() => ({
    opacity: 1 - pressed.value * 0.15,
    transform: [{ scale: 1 - pressed.value * 0.035 }],
  }));

  const onPressIn = () => {
    if (isDisabled) return;
    pressed.value = withSpring(1, { damping: 16, stiffness: 260, mass: 0.6 });
    tapHaptic();
  };
  const onPressOut = () => {
    pressed.value = withTiming(0, { duration: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={isDisabled}
      style={[
        styles.base,
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        disabled && variant !== 'neutralDisabled' && styles.disabled,
        pressedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? colors.orange500 : colors.white} />
      ) : (
        <View style={styles.content}>
          <Text style={[styles.label, roboto && styles.labelRoboto, labelStyles[variant]]}>{label}</Text>
          {icon ? (
            <Ionicons
              name={icon}
              size={18}
              color={variant === 'secondary' ? colors.orange500 : variant === 'neutralDisabled' ? colors.neutral950 : colors.white}
            />
          ) : null}
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    minHeight: 56,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { width: '100%' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { ...typography.button },
  labelRoboto: { fontFamily: fontFamily.robotoMedium },
  disabled: { opacity: 0.5 },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.orange500 },
  secondary: { backgroundColor: colors.orange50, borderWidth: 1, borderColor: colors.orange500 },
  ghost: { backgroundColor: 'transparent' },
  whatsapp: { backgroundColor: colors.whatsapp },
  neutralDisabled: { backgroundColor: 'rgba(29,27,32,0.1)' },
});

const labelStyles = StyleSheet.create({
  primary: { color: colors.white },
  secondary: { color: colors.orange600 },
  ghost: { color: colors.textPrimary },
  whatsapp: { color: colors.white },
  neutralDisabled: { color: 'rgba(29,27,32,0.38)' },
});
