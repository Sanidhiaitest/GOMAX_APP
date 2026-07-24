import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, m3Type, spacing } from '../../theme';
import { GoMaxLogo } from '../../components/GoMaxLogo';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Splash'>;

// Exact gradient from Figma node 1:98: linear-gradient(159.8deg, #000000 1.89%, #002040 74.93%)
export function SplashScreen({ navigation }: Props) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => navigation.replace('MobileNumber'), 1800);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [navigation]);

  const goToAdminLogin = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    navigation.getParent()?.navigate('AdminLogin');
  };

  return (
    <LinearGradient
      colors={[colors.black, colors.gradientNavyDeep]}
      start={{ x: 0.18, y: 0 }}
      end={{ x: 0.82, y: 1 }}
      locations={[0.019, 0.75]}
      style={styles.container}
    >
      <GoMaxLogo variant="full-orange" width={260} />
      <Pressable style={styles.adminLink} onPress={goToAdminLogin} hitSlop={16}>
        <Text style={styles.adminLinkText}>Staff / Admin login</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  adminLink: { position: 'absolute', bottom: 40 },
  adminLinkText: { ...m3Type.labelLarge, fontSize: 12, color: 'rgba(255,255,255,0.35)' },
});
