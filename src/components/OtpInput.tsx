import React, { useRef } from 'react';
import { NativeSyntheticEvent, StyleSheet, TextInput, TextInputKeyPressEventData, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

type Props = {
  length?: number;
  value: string;
  onChange: (value: string) => void;
};

export function OtpInput({ length = 5, value, onChange }: Props) {
  const inputs = useRef<Array<TextInput | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const setDigit = (index: number, digit: string) => {
    const clean = digit.replace(/[^0-9]/g, '').slice(-1);
    const next = digits.slice();
    next[index] = clean;
    onChange(next.join(''));
    if (clean && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const onKeyPress = (index: number, e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            inputs.current[index] = ref;
          }}
          style={[styles.box, digit && styles.boxFilled]}
          keyboardType="number-pad"
          maxLength={1}
          value={digit}
          onChangeText={(t) => setDigit(index, t)}
          onKeyPress={(e) => onKeyPress(index, e)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  box: {
    width: 49,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.surfaceMuted,
    textAlign: 'center',
    ...typography.h2,
    color: colors.textPrimary,
  },
  boxFilled: { borderColor: colors.orange500, backgroundColor: colors.white },
});
