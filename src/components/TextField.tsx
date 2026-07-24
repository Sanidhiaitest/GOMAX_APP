import React, { useState } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../theme';

type Props = TextInputProps & {
  label?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  rightIconAccessibilityLabel?: string;
  prefix?: string;
  error?: string;
  /** 'outline' = white/primary-focus field (Figma text inputs). 'filled' = gray dropdown-style field. */
  variant?: 'outline' | 'filled';
  containerStyle?: StyleProp<ViewStyle>;
};

export function TextField({
  label,
  leftIcon,
  rightIcon,
  onRightIconPress,
  rightIconAccessibilityLabel,
  prefix,
  error,
  variant = 'outline',
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);
  const isFilled = variant === 'filled';

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          isFilled ? styles.fieldFilled : styles.fieldOutline,
          focused && !isFilled && styles.fieldFocused,
          !!error && styles.fieldError,
        ]}
      >
        {leftIcon ? (
          <Ionicons name={leftIcon} size={18} color={colors.neutral500} style={styles.icon} />
        ) : null}
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.neutral400}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightIcon ? (
          onRightIconPress ? (
            <Pressable
              onPress={onRightIconPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel={rightIconAccessibilityLabel ?? 'Field action'}
            >
              <Ionicons name={rightIcon} size={18} color={colors.neutral500} style={styles.icon} />
            </Pressable>
          ) : (
            <Ionicons name={rightIcon} size={18} color={colors.neutral500} style={styles.icon} />
          )
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  label: {
    ...m3Type.labelLarge,
    color: colors.labelGray,
    marginBottom: spacing.sm,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    height: 44,
  },
  fieldOutline: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.surfaceMuted,
  },
  fieldFilled: {
    backgroundColor: '#f4f4f5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.neutral200,
  },
  fieldFocused: { borderColor: colors.primary700, backgroundColor: colors.primary50 },
  fieldError: { borderColor: colors.danger },
  icon: { marginHorizontal: spacing.xs },
  prefix: { ...m3Type.titleMedium, color: colors.neutral950, marginRight: spacing.sm },
  input: { flex: 1, ...m3Type.titleMediumSemiBold, color: colors.neutral950, padding: 0 },
  error: { ...m3Type.labelMedium, color: colors.danger, marginTop: spacing.xs },
});
