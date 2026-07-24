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
import { colors, fontFamily, radius, spacing, typography } from '../theme';

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

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        disabled && variant !== 'neutralDisabled' && styles.disabled,
        pressed && !isDisabled && styles.pressed,
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
    </Pressable>
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
  pressed: { opacity: 0.85 },
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
