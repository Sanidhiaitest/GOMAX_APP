import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../../theme';
import { Button } from '../../components/Button';
import { OtpInput } from '../../components/OtpInput';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Otp'>;

const RESEND_SECONDS = 28;

export function OtpScreen({ navigation }: Props) {
  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const canSubmit = otp.length === 5 && !verifying;

  const onSubmit = () => {
    setVerifying(true);
    // No backend yet — mock verification delay.
    setTimeout(() => navigation.navigate('RoleSelect'), 900);
  };

  return (
    <View style={styles.flex}>
      <LinearGradient colors={[colors.navy900, colors.navy700]} style={styles.header}>
        <Ionicons name="business" size={72} color="rgba(255,255,255,0.18)" />
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.heading}>GoMax mein</Text>
        <Text style={styles.headingAccent}>Swagat Hai! 👋</Text>

        <View style={{ marginTop: spacing.xxl }}>
          <Text style={styles.label}>ENTER OTP MANUALLY</Text>
          <View style={{ marginTop: spacing.sm }}>
            <OtpInput value={otp} onChange={setOtp} />
          </View>
          <Text style={styles.resend}>
            {seconds > 0 ? `Resend OTP in 0:${String(seconds).padStart(2, '0')}` : 'Resend OTP'}
          </Text>
        </View>

        <View style={styles.spacer} />

        <Button
          label={verifying ? 'Verifying' : 'Verify & Continue'}
          onPress={onSubmit}
          disabled={!canSubmit}
          loading={verifying}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  header: { height: 260, alignItems: 'center', justifyContent: 'center' },
  card: {
    flex: 1,
    marginTop: -radius.xl,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
  },
  heading: { ...typography.h1, color: colors.orange500 },
  headingAccent: { ...typography.h1, color: colors.textPrimary },
  label: { ...typography.label, color: colors.textSecondary },
  resend: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.lg },
  spacer: { flex: 1 },
});
