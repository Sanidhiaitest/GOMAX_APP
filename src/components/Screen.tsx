import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors } from '../theme';

type Props = {
  children: React.ReactNode;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  edges?: Edge[];
};

export function Screen({ children, backgroundColor = colors.surface, style, edges }: Props) {
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor }, style]}
      edges={edges ?? ['top', 'left', 'right']}
    >
      <View style={styles.flex}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
});
