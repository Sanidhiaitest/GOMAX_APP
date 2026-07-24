import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';

type Props = TextInputProps & {
  label?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  prefix?: string;
  error?: string;
};

export function TextField({
  label,
  leftIcon,
  rightIcon,
  onRightIconPress,
  prefix,
  error,
  style,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          !!error && styles.fieldError,
        ]}
      >
        {leftIcon ? (
          <Ionicons name={leftIcon} size={18} color={colors.textSecondary} style={styles.icon} />
        ) : null}
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
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
          <Ionicons
            name={rightIcon}
            size={18}
            color={colors.textSecondary}
            style={styles.icon}
            onPress={onRightIconPress}
          />
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  label: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surfaceMuted,
    paddingHorizontal: spacing.lg,
    height: 52,
  },
  fieldFocused: { borderColor: colors.borderFocus, backgroundColor: colors.white },
  fieldError: { borderColor: colors.danger },
  icon: { marginHorizontal: spacing.xs },
  prefix: { ...typography.bodyMedium, color: colors.textPrimary, marginRight: spacing.sm },
  input: { flex: 1, ...typography.bodyMedium, color: colors.textPrimary, padding: 0 },
  error: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
});
