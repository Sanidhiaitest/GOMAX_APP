import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { Screen } from '../../components/Screen';
import { bootstrapAdminAccount } from '../../services/auth';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'AdminSetup'>;

export function AdminSetupScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const canSubmit =
    fullName.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email) &&
    password.length >= 6 &&
    password === confirmPassword &&
    !submitting;

  const onSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await bootstrapAdminAccount(email.trim(), password, fullName.trim());
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create admin account.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <Screen>
        <View style={styles.doneWrap}>
          <Ionicons name="shield-checkmark" size={56} color={colors.success} />
          <Text style={styles.doneTitle}>Admin account created</Text>
          <Text style={styles.doneSubtitle}>Sign in from Staff / Admin login with this email and password.</Text>
          <Button label="Go to Admin login" onPress={() => navigation.replace('Login')} roboto />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={colors.secondary700} />
          </Pressable>
          <Text style={styles.headerTitle}>Set up Admin account</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            One-time setup — this creates the first Admin account for GoMax. Once it exists, this screen locks itself out.
          </Text>

          <TextField label="FULL NAME" placeholder="Your name" value={fullName} onChangeText={setFullName} />
          <TextField label="EMAIL" placeholder="admin@example.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <TextField label="PASSWORD" placeholder="At least 6 characters" secureTextEntry value={password} onChangeText={setPassword} />
          <TextField
            label="CONFIRM PASSWORD"
            placeholder="Re-enter password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={confirmPassword.length > 0 && confirmPassword !== password ? 'Passwords do not match' : undefined}
          />

          <View style={{ marginTop: spacing.lg }}>
            <Button label={submitting ? 'Creating…' : 'Create admin account'} onPress={onSubmit} disabled={!canSubmit} roboto />
          </View>
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
  subtitle: { ...m3Type.labelLarge, color: colors.neutral500 },
  errorText: { ...m3Type.labelMedium, color: colors.danger, textAlign: 'center' },
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.xxxl },
  doneTitle: { ...m3Type.titleLarge, color: colors.textPrimary },
  doneSubtitle: { ...m3Type.labelLarge, color: colors.neutral500, textAlign: 'center', marginBottom: spacing.lg },
});
