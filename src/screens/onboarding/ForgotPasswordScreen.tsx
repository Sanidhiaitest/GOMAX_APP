import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { Screen } from '../../components/Screen';
import * as authService from '../../services/auth';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ForgotPassword'>;

type Stage = 'enter_mobile' | 'reset';

export function ForgotPasswordScreen({ navigation }: Props) {
  const [stage, setStage] = useState<Stage>('enter_mobile');
  const [mobile, setMobile] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const [otpCode, setOtpCode] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const onRequestOtp = async () => {
    if (mobile.length !== 10) return;
    setLoading(true);
    setError('');
    try {
      const question = await authService.getSecurityQuestionForMobile(mobile);
      if (!question) {
        setError('No account found with this mobile number.');
        return;
      }
      setSecurityQuestion(question);
      const otp = await authService.requestPasswordResetOtp(mobile);
      setDevOtp(otp);
      setStage('reset');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const canReset =
    otpCode.length === 6 &&
    securityAnswer.trim().length > 0 &&
    newPassword.length >= 6 &&
    newPassword === confirmPassword &&
    !loading;

  const onReset = async () => {
    if (!canReset) return;
    setLoading(true);
    setError('');
    try {
      await authService.resetPasswordWithOtp(mobile, otpCode, securityAnswer, newPassword);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reset password. Check your OTP and answer.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <Screen>
        <View style={styles.doneWrap}>
          <Ionicons name="checkmark-circle" size={56} color={colors.success} />
          <Text style={styles.doneTitle}>Password reset!</Text>
          <Text style={styles.doneSubtitle}>You can now log in with your new password.</Text>
          <Button label="Back to login" onPress={() => navigation.navigate('Login')} roboto />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8} accessibilityRole="button" accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={22} color={colors.secondary700} />
          </Pressable>
          <Text style={styles.headerTitle}>Forgot password</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            {stage === 'enter_mobile'
              ? "Enter the mobile number on your account — you'll need your OTP and your security answer to reset your password."
              : 'Enter the OTP sent to your mobile, plus your security answer, to set a new password.'}
          </Text>

          <TextField
            label="MOBILE NUMBER"
            prefix="🇮🇳 +91"
            placeholder="XXXXX-XXXXX"
            keyboardType="number-pad"
            maxLength={10}
            value={mobile}
            editable={stage === 'enter_mobile'}
            onChangeText={(t) => setMobile(t.replace(/[^0-9]/g, ''))}
          />

          {stage === 'enter_mobile' ? (
            <View style={{ marginTop: spacing.xl }}>
              <Button label={loading ? 'Sending…' : 'Send OTP'} onPress={onRequestOtp} disabled={mobile.length !== 10 || loading} roboto />
            </View>
          ) : (
            <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
              {devOtp ? (
                <View style={styles.devOtpBanner}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.warningText} />
                  <Text style={styles.devOtpText}>
                    SMS delivery isn&apos;t configured yet — your OTP is <Text style={{ fontWeight: '700' }}>{devOtp}</Text>
                  </Text>
                </View>
              ) : null}

              <TextField label="OTP" placeholder="6-digit code" keyboardType="number-pad" maxLength={6} value={otpCode} onChangeText={setOtpCode} />

              <View>
                <Text style={styles.questionLabel}>{securityQuestion}</Text>
                <TextField placeholder="Your answer" value={securityAnswer} onChangeText={setSecurityAnswer} />
              </View>

              <TextField label="NEW PASSWORD" placeholder="At least 6 characters" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
              <TextField
                label="CONFIRM NEW PASSWORD"
                placeholder="Re-enter password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={confirmPassword.length > 0 && confirmPassword !== newPassword ? 'Passwords do not match' : undefined}
              />

              <Button label={loading ? 'Resetting…' : 'Reset password'} onPress={onReset} disabled={!canReset} roboto />
            </View>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: { ...m3Type.titleLarge, color: colors.secondary700 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  subtitle: { ...m3Type.labelLarge, color: colors.neutral500, marginBottom: spacing.sm },
  questionLabel: { ...m3Type.labelLarge, color: colors.labelGray, marginBottom: spacing.sm },
  devOtpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.orange50,
    borderWidth: 1,
    borderColor: colors.orange100,
    borderRadius: 12,
    padding: spacing.md,
  },
  devOtpText: { ...m3Type.labelMedium, color: colors.warningText, flex: 1 },
  errorText: { ...m3Type.labelMedium, color: colors.danger, textAlign: 'center' },
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.xxxl },
  doneTitle: { ...m3Type.titleLarge, color: colors.textPrimary },
  doneSubtitle: { ...m3Type.labelLarge, color: colors.neutral500, textAlign: 'center', marginBottom: spacing.lg },
});
