import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { SelectModal } from '../../components/SelectModal';
import { Screen } from '../../components/Screen';
import { useApp } from '../../state/AppContext';
import { getReferrerRoleByCode } from '../../services/profile';
import { SECURITY_QUESTIONS, SignupRole } from '../../services/auth';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Signup'>;

const ROLE_META: Record<SignupRole, { title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap }> = {
  dealer: { title: 'Dealer', subtitle: 'Top of my own referral chain', icon: 'business-outline' },
  contractor: { title: 'Contractor', subtitle: 'I bring on Applicators', icon: 'construct-outline' },
  applicator: { title: 'Applicator', subtitle: 'I scan bags & earn Points', icon: 'qr-code-outline' },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function SignupScreen({ navigation }: Props) {
  const { signUp } = useApp();

  const [noReferral, setNoReferral] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [checkingReferral, setCheckingReferral] = useState(false);
  const [referralError, setReferralError] = useState('');
  const [allowedRoles, setAllowedRoles] = useState<SignupRole[] | null>(null);
  const [role, setRole] = useState<SignupRole | null>(null);

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [upiId, setUpiId] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState<string>('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [questionModal, setQuestionModal] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onToggleNoReferral = (value: boolean) => {
    setNoReferral(value);
    setReferralCode('');
    setReferralError('');
    if (value) {
      setAllowedRoles(['dealer']);
      setRole('dealer');
    } else {
      setAllowedRoles(null);
      setRole(null);
    }
  };

  const onVerifyReferral = async () => {
    if (!referralCode.trim()) return;
    setCheckingReferral(true);
    setReferralError('');
    setAllowedRoles(null);
    setRole(null);
    try {
      const referrerRole = await getReferrerRoleByCode(referralCode.trim());
      if (!referrerRole) {
        setReferralError('Referral code not found. Double-check with whoever gave it to you.');
        return;
      }
      const roles: SignupRole[] =
        referrerRole === 'dealer' ? ['contractor', 'applicator'] : referrerRole === 'contractor' ? ['applicator'] : ['applicator'];
      setAllowedRoles(roles);
      setRole(roles.length === 1 ? roles[0] : null);
    } catch (e) {
      setReferralError(e instanceof Error ? e.message : 'Could not verify referral code');
    } finally {
      setCheckingReferral(false);
    }
  };

  const hasBankDetails = bankAccountNumber.length > 0 && bankIfsc.length > 0;
  const hasPayoutMethod = hasBankDetails || upiId.length > 0;

  const canSubmit =
    !!role &&
    mobile.length === 10 &&
    password.length >= 6 &&
    password === confirmPassword &&
    fullName.trim().length > 0 &&
    city.trim().length > 0 &&
    hasPayoutMethod &&
    !!securityQuestion &&
    securityAnswer.trim().length > 0 &&
    !submitting;

  const onSubmit = async () => {
    if (!role || !securityQuestion) return;
    setSubmitting(true);
    setError('');
    try {
      await signUp({
        mobileNumber: mobile,
        password,
        role,
        fullName,
        city,
        address,
        bankAccountNumber,
        bankIfsc,
        upiId,
        securityQuestion: securityQuestion as (typeof SECURITY_QUESTIONS)[number],
        securityAnswer,
        referralCode: noReferral ? '' : referralCode.trim(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signup failed. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={colors.secondary700} />
          </Pressable>
          <Text style={styles.headerTitle}>Create account</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Section title="REFERRAL">
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>I don&apos;t have a referral code (new Dealer)</Text>
              <Switch value={noReferral} onValueChange={onToggleNoReferral} trackColor={{ true: colors.primary700 }} />
            </View>
            {!noReferral ? (
              <>
                <View style={styles.referralRow}>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label="REFERRAL CODE"
                      placeholder="GOMAX-XXXXXX"
                      autoCapitalize="characters"
                      value={referralCode}
                      onChangeText={setReferralCode}
                    />
                  </View>
                  <Pressable
                    style={[styles.verifyButton, (!referralCode || checkingReferral) && styles.verifyButtonDisabled]}
                    disabled={!referralCode || checkingReferral}
                    onPress={onVerifyReferral}
                  >
                    <Text style={styles.verifyButtonText}>{checkingReferral ? '…' : 'Verify'}</Text>
                  </Pressable>
                </View>
                {referralError ? <Text style={styles.errorText}>{referralError}</Text> : null}
                {allowedRoles ? <Text style={styles.hintText}>Referral verified — pick your role below.</Text> : null}
              </>
            ) : null}
          </Section>

          {allowedRoles && allowedRoles.length > 0 ? (
            <Section title="WHO ARE YOU?">
              <View style={{ gap: spacing.md }}>
                {allowedRoles.map((r) => {
                  const meta = ROLE_META[r];
                  const isSelected = role === r;
                  return (
                    <Pressable
                      key={r}
                      onPress={() => setRole(r)}
                      style={[styles.roleCard, isSelected ? styles.roleCardSelected : styles.roleCardDefault]}
                    >
                      <View style={[styles.roleIcon, isSelected && styles.roleIconSelected]}>
                        <Ionicons name={meta.icon} size={22} color={isSelected ? colors.white : colors.neutral500} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.roleTitle, isSelected && styles.roleTitleSelected]}>{meta.title}</Text>
                        <Text style={styles.roleSubtitle}>{meta.subtitle}</Text>
                      </View>
                      {isSelected ? <Ionicons name="checkmark-circle" size={20} color={colors.primary700} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </Section>
          ) : null}

          <Section title="LOGIN DETAILS">
            <View style={{ gap: spacing.lg }}>
              <TextField
                label="MOBILE NUMBER"
                prefix="🇮🇳 +91"
                placeholder="XXXXX-XXXXX"
                keyboardType="number-pad"
                maxLength={10}
                value={mobile}
                onChangeText={(t) => setMobile(t.replace(/[^0-9]/g, ''))}
              />
              <TextField label="PASSWORD" placeholder="At least 6 characters" secureTextEntry value={password} onChangeText={setPassword} />
              <TextField
                label="CONFIRM PASSWORD"
                placeholder="Re-enter password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                error={confirmPassword.length > 0 && confirmPassword !== password ? 'Passwords do not match' : undefined}
              />
            </View>
          </Section>

          <Section title="PERSONAL DETAILS">
            <View style={{ gap: spacing.lg }}>
              <TextField label="FULL NAME" placeholder="Your full name" value={fullName} onChangeText={setFullName} />
              <TextField label="CITY" placeholder="Your city" value={city} onChangeText={setCity} />
              <TextField label="ADDRESS" placeholder="Your address" value={address} onChangeText={setAddress} />
            </View>
          </Section>

          <Section title="PAYOUT DETAILS">
            <Text style={styles.hintText}>Points are paid out here — add bank details, UPI, or both.</Text>
            <View style={{ gap: spacing.lg, marginTop: spacing.md }}>
              <TextField label="BANK ACCOUNT NUMBER" placeholder="Optional" keyboardType="number-pad" value={bankAccountNumber} onChangeText={setBankAccountNumber} />
              <TextField label="IFSC CODE" placeholder="Optional" autoCapitalize="characters" value={bankIfsc} onChangeText={setBankIfsc} />
              <TextField label="UPI ID" placeholder="yourname@upi" autoCapitalize="none" value={upiId} onChangeText={setUpiId} />
            </View>
          </Section>

          <Section title="SECURITY QUESTION">
            <Text style={styles.hintText}>Used to reset your password if you forget it.</Text>
            <View style={{ marginTop: spacing.md, gap: spacing.lg }}>
              <Pressable style={styles.selectField} onPress={() => setQuestionModal(true)}>
                <Text style={[styles.selectFieldText, !securityQuestion && styles.placeholder]}>
                  {securityQuestion || 'Select a security question'}
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.neutral500} />
              </Pressable>
              <TextField label="YOUR ANSWER" placeholder="Answer" value={securityAnswer} onChangeText={setSecurityAnswer} />
            </View>
          </Section>

          <View style={{ marginTop: spacing.lg }}>
            <Button label={submitting ? 'Creating account…' : 'Create account'} onPress={onSubmit} disabled={!canSubmit} roboto />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
            <Text style={styles.footerLink}>
              Already have an account? <Text style={styles.footerLinkAccent}>Log in</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <SelectModal
        visible={questionModal}
        title="Select a security question"
        options={[...SECURITY_QUESTIONS]}
        selected={securityQuestion}
        onSelect={setSecurityQuestion}
        onClose={() => setQuestionModal(false)}
      />
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
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.xl },
  section: { gap: spacing.sm },
  sectionTitle: { ...m3Type.labelSmall, color: colors.neutral500, letterSpacing: 0.6 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  switchLabel: { ...m3Type.labelLarge, fontSize: 13, color: colors.textPrimary, flex: 1 },
  referralRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  verifyButton: {
    height: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.primary700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonDisabled: { opacity: 0.4 },
  verifyButtonText: { ...m3Type.labelLarge, color: colors.white, fontWeight: '600' },
  hintText: { ...m3Type.labelMedium, color: colors.neutral500 },
  errorText: { ...m3Type.labelMedium, color: colors.danger, marginTop: spacing.xs },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderRadius: 14,
  },
  roleCardSelected: { borderColor: colors.primary700, backgroundColor: colors.primary50 },
  roleCardDefault: { borderColor: colors.neutral200, backgroundColor: colors.white },
  roleIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconSelected: { backgroundColor: colors.primary700 },
  roleTitle: { ...m3Type.titleMediumSemiBold, color: colors.neutral600 },
  roleTitleSelected: { color: colors.secondary700 },
  roleSubtitle: { ...m3Type.labelSmall, color: colors.neutral400, marginTop: 2 },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: colors.surfaceMuted,
    borderRadius: 8,
    height: 44,
    paddingHorizontal: spacing.lg,
  },
  selectFieldText: { ...m3Type.titleMediumSemiBold, fontSize: 14, color: colors.neutral950 },
  placeholder: { color: colors.neutral400, fontWeight: '400' },
  footerLink: { ...m3Type.labelSmall, color: colors.black, textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.xl },
  footerLinkAccent: { color: colors.primary700 },
});
