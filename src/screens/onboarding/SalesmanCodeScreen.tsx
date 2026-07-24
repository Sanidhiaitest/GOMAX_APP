import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { useApp } from '../../state/AppContext';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SalesmanCode'>;

// Salesmen are pre-provisioned employees (HQ creates their account), not
// open self-signups — so onboarding here is an activation step, not a
// profile-builder. No birthday/city/language personalization screens.
export function SalesmanCodeScreen({ navigation }: Props) {
  const { setEmployeeCode, completeOnboarding } = useApp();
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  const onVerify = () => {
    setVerifying(true);
    setEmployeeCode(code);
    setTimeout(() => {
      completeOnboarding();
      navigation.getParent()?.navigate('Main');
    }, 900);
  };

  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.icon}>
          <Ionicons name="briefcase-outline" size={40} color={colors.primary700} />
        </View>
        <Text style={styles.title}>Welcome aboard</Text>
        <Text style={styles.subtitle}>
          Enter the Employee ID or Distributor Code your manager gave you to activate your account and load your
          territory.
        </Text>

        <TextField
          label="Employee ID / Distributor Code"
          placeholder="e.g. GMX-SLM-4471"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.footer}>
        <Button
          label={verifying ? 'Verifying…' : 'Activate account'}
          onPress={onVerify}
          disabled={code.trim().length < 3 || verifying}
          loading={verifying}
          roboto
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl, gap: spacing.xl },
  icon: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.primary50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...m3Type.headlineMedium, color: colors.secondary700, textAlign: 'center' },
  subtitle: { ...m3Type.labelLarge, color: colors.neutral500, textAlign: 'center' },
  footer: { paddingHorizontal: spacing.xl, paddingVertical: spacing.xl },
});
