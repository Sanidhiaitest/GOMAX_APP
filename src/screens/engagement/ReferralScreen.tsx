import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { useApp } from '../../state/AppContext';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Referral'>;

const REFERRAL_CODE = 'GOMAX-RAM47X';
const SHARE_MESSAGE = `Mera GoMax code use karo aur milega bonus Points!\n\n${REFERRAL_CODE}\n\nhttps://gomax.app/r/${REFERRAL_CODE}`;

const STATS = [
  { label: 'Referred', value: '4' },
  { label: 'Joined', value: '2' },
  { label: 'Points earned', value: '90' },
];

const STEPS = [
  { icon: 'share-social-outline' as const, title: 'Share your code', subtitle: 'Send your code to a fellow applicator on WhatsApp' },
  { icon: 'person-add-outline' as const, title: 'Friend signs up', subtitle: 'They enter your code while creating their GoMax account' },
  { icon: 'gift-outline' as const, title: 'Both of you earn', subtitle: 'You get 30 pts, they get 70 pts on their first scan' },
];

// Freeform design (P1) — user gave creative latitude here; referral-card shape
// inspired by the "Give Claude, get more Claude" reference they shared.
// Single-level only per the PRD's Prize Chits Act, 1978 compliance note.
export function ReferralScreen({ navigation }: Props) {
  const { addRuns } = useApp();
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await Clipboard.setStringAsync(REFERRAL_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const onShareWhatsApp = () => {
    const url = `whatsapp://send?text=${encodeURIComponent(SHARE_MESSAGE)}`;
    Linking.openURL(url).catch(() => {
      // WhatsApp not installed — no-op fallback for this mock flow.
    });
  };

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="people" size={28} color={colors.primary700} />
          </View>
          <Text style={styles.heroTitle}>Dost ko bulao, Points kamao!</Text>
          <Text style={styles.heroSubtitle}>Share your code — earn Points for every friend who joins</Text>

          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{REFERRAL_CODE}</Text>
            <Pressable style={styles.copyButton} onPress={onCopy}>
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color={colors.white} />
              <Text style={styles.copyButtonText}>{copied ? 'Copied' : 'Copy'}</Text>
            </Pressable>
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <Button label="Share on WhatsApp" onPress={onShareWhatsApp} variant="whatsapp" icon="logo-whatsapp" />
          </View>
        </Card>

        <View style={styles.statsRow}>
          {STATS.map((stat) => (
            <Card key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Card>
          ))}
        </View>

        <Text style={styles.sectionTitle}>How it works</Text>
        <View style={{ gap: spacing.lg }}>
          {STEPS.map((step, i) => (
            <View key={step.title} style={styles.step}>
              <View style={styles.stepIcon}>
                <Ionicons name={step.icon} size={20} color={colors.primary700} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.legalNote}>
          One reward per friend — referral bonuses apply to direct sign-ups only.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...m3Type.titleLarge, color: colors.textPrimary },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.xl },
  heroCard: { alignItems: 'center' },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.orange50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: { ...m3Type.titleMediumSemiBold, color: colors.textPrimary, textAlign: 'center' },
  heroSubtitle: { ...m3Type.labelLarge, color: colors.neutral500, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.lg },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  codeText: { ...m3Type.titleMediumSemiBold, color: colors.secondary700, letterSpacing: 1 },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary700,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  copyButtonText: { ...m3Type.labelLarge, fontSize: 13, color: colors.white },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, alignItems: 'center' },
  statValue: { ...m3Type.headlineMedium, fontSize: 24, color: colors.secondary700 },
  statLabel: { ...m3Type.labelMedium, color: colors.neutral500, marginTop: 2 },
  sectionTitle: { ...m3Type.titleMediumSemiBold, color: colors.textPrimary },
  step: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.orange50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: { ...m3Type.titleMedium, fontSize: 15, color: colors.textPrimary },
  stepSubtitle: { ...m3Type.labelLarge, fontSize: 13, color: colors.neutral500, marginTop: 2 },
  legalNote: { ...m3Type.labelMedium, color: colors.neutral400, textAlign: 'center' },
});
