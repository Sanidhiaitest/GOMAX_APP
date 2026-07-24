import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { colors, fontFamily } from '../theme';

type Props = {
  size?: number;
  showWordmark?: boolean;
  wordmarkColor?: string;
};

export function GoMaxLogo({ size = 96, showWordmark = true, wordmarkColor = colors.orange500 }: Props) {
  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size * 0.9} viewBox="0 0 100 90">
        <Polygon points="50,4 96,86 4,86" fill={colors.orange500} />
        <Polygon points="50,4 74,46 26,46" fill={colors.orange100} opacity={0.85} />
      </Svg>
      {showWordmark ? (
        <Text style={[styles.wordmark, { color: wordmarkColor, fontSize: size * 0.34 }]}>GoMax</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  wordmark: { fontFamily: fontFamily.headingBold, marginTop: 8 },
});
