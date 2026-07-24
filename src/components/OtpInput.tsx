import React, { useRef } from 'react';
import { NativeSyntheticEvent, StyleSheet, TextInput, TextInputKeyPressEventData, View } from 'react-native';
import { colors, m3Type } from '../theme';

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
          style={styles.box}
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
    width: 55,
    height: 62,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.inputBorder,
    textAlign: 'center',
    ...m3Type.titleLarge,
    color: colors.neutral950,
  },
});
