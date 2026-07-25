import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { GlowBorder, PressableScale } from '../../components/animations';
import { useApp } from '../../state/AppContext';
import { MasonTabParamList, RootStackParamList } from '../../navigation/types';

type Nav = BottomTabNavigationProp<MasonTabParamList> & NativeStackNavigationProp<RootStackParamList>;

const QUICK_ACTIONS: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'spin', label: 'Spin Wheel', icon: 'sync-circle-outline' },
  { key: 'scratch', label: 'Scratch Card', icon: 'ticket-outline' },
  { key: 'challenges', label: 'Challenges', icon: 'trophy-outline' },
  { key: 'refer', label: 'Refer Friends', icon: 'people-outline' },
];

export function MasonHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { fullName, points, runs, loyaltyTier, kycStatus, scanHistory } = useApp();

  const onQuickAction = (key: string) => {
    if (key === 'spin') return navigation.navigate('SpinWheel');
    if (key === 'refer') return navigation.navigate('Referral');
    if (key === 'scratch') return navigation.navigate('ScratchCards');
    if (key === 'challenges') return navigation.navigate('Challenges');
  };

  return (
    <Screen backgroundColor={colors.surfaceMuted} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Namaste, {fullName || 'Ramesh Kumar'}</Text>
          <View style={styles.tierBadge}>
            <Ionicons name="star" size={12} color={colors.orange500} />
            <Text style={styles.tierText}>{loyaltyTier} Tier</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceRow}>
          <Card style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>POINTS</Text>
            <Text style={styles.balanceValue}>{points}</Text>
            <Text style={styles.balanceHint}>≈ ₹{(points * 0.165).toFixed(2)} cash value</Text>
          </Card>
          <Card style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>RUNS</Text>
            <Text style={styles.balanceValue}>{runs}</Text>
            <Text style={styles.balanceHint}>For the gifts catalogue</Text>
          </Card>
        </View>

        {kycStatus !== 'verified' ? (
          <Pressable onPress={() => navigation.navigate('Kyc')}>
            <Card style={styles.kycBanner}>
              <View style={styles.kycIcon}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.orange600} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.kycTitle}>Complete KYC</Text>
                <Text style={styles.kycText}>Unlock full limits</Text>
              </View>
              <Pill label="Verify" tone="warning" icon="arrow-forward" size="sm" />
            </Card>
          </Pressable>
        ) : null}

        <GlowBorder cornerRadius={radius.md} borderWidth={2} backgroundColor={colors.surfaceMuted} speed={3800}>
          <PressableScale style={styles.scanCta} onPress={() => navigation.navigate('Scan')}>
            <Ionicons name="qr-code-outline" size={22} color={colors.white} />
            <Text style={styles.scanCtaText}>Scan a Product</Text>
          </PressableScale>
        </GlowBorder>

        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.grid}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable key={action.key} style={styles.gridItem} onPress={() => onQuickAction(action.key)}>
              <Ionicons name={action.icon} size={22} color={colors.navy700} />
              <Text style={styles.gridLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recent activity</Text>
        <View style={{ gap: spacing.md }}>
          {scanHistory.map((item) => (
            <Card key={item.id} style={styles.activityRow}>
              <View style={styles.activityIcon}>
                <Ionicons name="cube-outline" size={18} color={colors.navy700} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.activityTitle}>{item.productName}</Text>
                <Text style={styles.activityTime}>{item.scannedAt}</Text>
              </View>
              <Text style={styles.activityPoints}>+{item.points} pts</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xxl, paddingTop: spacing.md, paddingBottom: spacing.lg },
  greeting: { ...typography.h2, color: colors.textPrimary },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.orange50,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  tierText: { ...typography.caption, color: colors.orange600, fontWeight: '600' },
  content: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  balanceRow: { flexDirection: 'row', gap: spacing.md },
  balanceCard: { flex: 1 },
  balanceLabel: { ...typography.label, color: colors.orange500 },
  balanceValue: { ...typography.h1, color: colors.textPrimary, marginTop: spacing.xs },
  balanceHint: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  kycBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.orange50,
    borderColor: colors.orange100,
  },
  kycIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kycTitle: { ...typography.bodyMedium, color: colors.textPrimary },
  kycText: { ...typography.caption, color: colors.orange600, marginTop: 1 },
  scanCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.orange500,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
  },
  scanCtaText: { ...typography.button, color: colors.white },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  gridItem: {
    width: '47%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  gridLabel: { ...typography.bodyMedium, color: colors.textPrimary },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: { ...typography.bodyMedium, color: colors.textPrimary },
  activityTime: { ...typography.caption, color: colors.textSecondary },
  activityPoints: { ...typography.bodyMedium, color: colors.successText },
});
