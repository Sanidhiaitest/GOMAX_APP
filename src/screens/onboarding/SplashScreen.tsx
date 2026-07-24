import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../theme';
import { GoMaxLogo } from '../../components/GoMaxLogo';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Splash'>;

// Exact gradient from Figma node 1:98: linear-gradient(159.8deg, #000000 1.89%, #002040 74.93%)
export function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('MobileNumber'), 1400);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient
      colors={[colors.black, colors.gradientNavyDeep]}
      start={{ x: 0.18, y: 0 }}
      end={{ x: 0.82, y: 1 }}
      locations={[0.019, 0.75]}
      style={styles.container}
    >
      <GoMaxLogo variant="full-orange" width={260} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
