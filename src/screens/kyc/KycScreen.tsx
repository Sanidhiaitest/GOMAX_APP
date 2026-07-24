import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { useApp } from '../../state/AppContext';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Kyc'>;

const STATUS_COPY: Record<string, { label: string; tone: 'neutral' | 'warning' | 'success'; icon: keyof typeof Ionicons.glyphMap }> = {
  unverified: { label: 'Not verified', tone: 'neutral', icon: 'alert-circle-outline' },
  pending: { label: 'Under review', tone: 'warning', icon: 'time-outline' },
  verified: { label: 'Verified', tone: 'success', icon: 'checkmark-circle' },
};

const STEPS = [
  { title: 'Scan Aadhaar QR code', subtitle: 'Offline QR only — no fingerprint or biometric required' },
  { title: 'Confirm your mobile number', subtitle: 'Should match the number linked to Aadhaar' },
  { title: 'Add your UPI ID', subtitle: 'Needed so we can send your Points as cash' },
];

export function KycScreen({ navigation }: Props) {
  const { kycStatus, setKycStatus } = useApp();
  const [scanning, setScanning] = useState(false);
  const status = STATUS_COPY[kycStatus];

  const startVerification = () => {
    setScanning(true);
    setKycStatus('pending');
    setTimeout(() => {
      setScanning(false);
      setKycStatus('verified');
    }, 1500);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Complete your KYC</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.statusCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusLabel}>KYC Status</Text>
          </View>
          <Pill label={status.label} tone={status.tone} icon={status.icon} />
        </Card>

        <Text style={styles.explainer}>
          Verified users get higher redemption limits and faster UPI payouts. Redemptions under ₹50
          work without KYC — full limits unlock once verified.
        </Text>

        <View style={styles.steps}>
          {STEPS.map((step, i) => (
            <View key={step.title} style={styles.step}>
              <View style={styles.stepIndex}>
                <Text style={styles.stepIndexText}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {kycStatus === 'verified' ? (
          <Button label="KYC Complete" icon="checkmark" onPress={() => navigation.goBack()} />
        ) : (
          <Button
            label={scanning ? 'Verifying…' : 'Scan Aadhaar QR to verify'}
            icon="qr-code-outline"
            onPress={startVerification}
            loading={scanning}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h3, color: colors.textPrimary },
  content: { paddingHorizontal: spacing.xxl, gap: spacing.xl, paddingBottom: spacing.xxxl },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  statusLabel: { ...typography.label, color: colors.textSecondary, textTransform: 'uppercase' },
  explainer: { ...typography.caption, color: colors.textSecondary },
  steps: { gap: spacing.lg },
  step: { flexDirection: 'row', gap: spacing.lg, alignItems: 'flex-start' },
  stepIndex: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.navy800,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndexText: { color: colors.white, ...typography.label, textTransform: 'none' },
  stepTitle: { ...typography.bodyMedium, color: colors.textPrimary },
  stepSubtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  footer: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xl, paddingTop: spacing.md },
});
