import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { OtpInput } from '../../components/OtpInput';
import { photos } from '../../assets/images';
import { useApp } from '../../state/AppContext';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Otp'>;

const RESEND_SECONDS = 28;

// Node 1:124 — same header gradient as MobileNumber, different photo
export function OtpScreen({ navigation }: Props) {
  const { verifyOtp, sendOtp, pendingMobileNumber, role, onboardingComplete } = useApp();
  const [otp, setOtp] = useState('');
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const canSubmit = otp.length === 5 && !verifying;

  const onSubmit = async () => {
    setVerifying(true);
    setError('');
    try {
      await verifyOtp(otp);
      // An existing user who already picked a role/finished onboarding skips
      // straight back into the app instead of re-running role selection.
      if (onboardingComplete) navigation.getParent()?.navigate('Main');
      else if (role) navigation.navigate('BasicDetails');
      else navigation.navigate('RoleSelect');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid OTP. Try again.');
    } finally {
      setVerifying(false);
    }
  };

  const onResend = async () => {
    if (seconds > 0 || !pendingMobileNumber) return;
    setSeconds(RESEND_SECONDS);
    try {
      await sendOtp(pendingMobileNumber);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not resend OTP.');
    }
  };

  return (
    <View style={styles.flex}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.black, colors.gradientNavyIndigo]}
        start={{ x: 0.18, y: 0 }}
        end={{ x: 0.82, y: 1 }}
        locations={[0.019, 0.75]}
        style={styles.header}
      >
        {/* PLACEHOLDER: photos.onboardingOtp — see assets/README.md */}
        {photos.onboardingOtp ? (
          <Image source={photos.onboardingOtp} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : null}
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.heading}>GoMax mein</Text>
        <Text style={styles.headingAccent}>Swagat Hai! 👋</Text>

        <View style={{ marginTop: 32 }}>
          <Text style={styles.label}>ENTER OTP MAUALLY</Text>
          <View style={{ marginTop: spacing.sm }}>
            <OtpInput value={otp} onChange={setOtp} />
          </View>
          <Pressable onPress={onResend} disabled={seconds > 0}>
            <Text style={styles.resend}>
              {seconds > 0 ? `Resend OTP in 0:${String(seconds).padStart(2, '0')}` : 'Resend OTP'}
            </Text>
          </Pressable>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.spacer} />

        <Button
          label={verifying ? 'Verifying' : 'Verify & Continue'}
          onPress={onSubmit}
          disabled={!canSubmit && !verifying}
          variant={verifying ? 'neutralDisabled' : 'primary'}
          icon={verifying ? null : 'arrow-forward'}
          roboto
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.black },
  header: { height: 360, overflow: 'hidden' },
  card: {
    flex: 1,
    marginTop: -radius.xl,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  heading: { ...m3Type.headlineLarge, color: colors.primary700 },
  headingAccent: { ...m3Type.headlineLarge, color: colors.black },
  label: { ...m3Type.labelLarge, color: colors.labelGray },
  resend: { ...m3Type.labelMedium, color: colors.neutral400, marginTop: spacing.lg },
  errorText: { ...m3Type.labelMedium, color: colors.danger, marginTop: spacing.sm },
  spacer: { flex: 1 },
});
