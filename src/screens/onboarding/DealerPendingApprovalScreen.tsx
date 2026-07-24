import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { useApp } from '../../state/AppContext';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'DealerPendingApproval'>;

const STEPS = [
  { label: 'Application submitted', done: true },
  { label: 'Field verification by your salesman', done: false },
  { label: 'Credit check', done: false },
  { label: 'Account activated', done: false },
];

// Matches the admin workflow states in the Distributor spec: new dealer
// application -> field verification -> credit check -> activation. This is
// a real (human) step, not a timer — the dealer can use the app in a
// limited/pending state in the meantime.
export function DealerPendingApprovalScreen({ navigation }: Props) {
  const { completeOnboarding } = useApp();

  const finish = () => {
    completeOnboarding();
    navigation.getParent()?.navigate('Main');
  };

  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.icon}>
          <Ionicons name="time-outline" size={40} color={colors.primary700} />
        </View>
        <Text style={styles.title}>Application submitted!</Text>
        <Text style={styles.subtitle}>
          Your salesman will visit your shop to verify details and set up your credit line. This usually takes 2-3
          business days.
        </Text>

        <View style={styles.steps}>
          {STEPS.map((step, i) => (
            <View key={step.label} style={styles.stepRow}>
              <View style={[styles.stepDot, step.done && styles.stepDotDone]}>
                {step.done ? <Ionicons name="checkmark" size={12} color={colors.white} /> : null}
              </View>
              <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>{step.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Continue to app" onPress={finish} roboto />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl },
  icon: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: colors.primary50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: { ...m3Type.headlineMedium, color: colors.secondary700, textAlign: 'center' },
  subtitle: { ...m3Type.labelLarge, color: colors.neutral500, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xxl },
  steps: { width: '100%', gap: spacing.lg },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepDot: { width: 22, height: 22, borderRadius: radius.pill, backgroundColor: colors.neutral200, alignItems: 'center', justifyContent: 'center' },
  stepDotDone: { backgroundColor: colors.success },
  stepLabel: { ...m3Type.titleMedium, fontSize: 14, color: colors.neutral400 },
  stepLabelDone: { color: colors.textPrimary, fontWeight: '600' },
  footer: { paddingHorizontal: spacing.xl, paddingVertical: spacing.xl },
});
