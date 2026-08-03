import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { GlowBorder, PressableScale } from '../../components/animations';
import { useApp } from '../../state/AppContext';
import { useMyScans, useMyCommissionEarnings } from '../../hooks/useAppData';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';

type Nav = BottomTabNavigationProp<MainTabParamList> & NativeStackNavigationProp<RootStackParamList>;

const QUICK_ACTIONS: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'spin', label: 'Spin Wheel', icon: 'sync-circle-outline' },
  { key: 'scratch', label: 'Scratch Card', icon: 'ticket-outline' },
  { key: 'challenges', label: 'Challenges', icon: 'trophy-outline' },
  { key: 'gifts', label: 'Gift Catalogue', icon: 'gift-outline' },
];

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { role, fullName, points, runs, referralCode } = useApp();
  const isApplicator = role === 'applicator';
  const { data: scanHistory } = useMyScans();
  const { data: commissionEarnings } = useMyCommissionEarnings();

  const onQuickAction = (key: string) => {
    if (key === 'spin') return navigation.navigate('SpinWheel');
    if (key === 'scratch') return navigation.navigate('ScratchCards');
    if (key === 'challenges') return navigation.navigate('Challenges');
    if (key === 'gifts') return navigation.navigate('Gifts');
  };

  const totalCommission = commissionEarnings.reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <Screen backgroundColor={colors.surfaceMuted} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Namaste, {fullName || 'GoMax User'}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="star" size={12} color={colors.orange500} />
            <Text style={styles.roleText}>{role ? role.charAt(0).toUpperCase() + role.slice(1) : ''}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceRow}>
          <Card style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>POINTS</Text>
            <Text style={styles.balanceValue}>{points}</Text>
            <Text style={styles.balanceHint}>₹{points.toLocaleString('en-IN')} redeemable</Text>
          </Card>
          <Card style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>RUNS</Text>
            <Text style={styles.balanceValue}>{runs}</Text>
            <Text style={styles.balanceHint}>For the gifts catalogue</Text>
          </Card>
        </View>

        {!isApplicator ? (
          <Card style={styles.teamCard}>
            <View style={styles.teamIcon}>
              <Ionicons name="people-outline" size={20} color={colors.navy700} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.teamTitle}>Your team&apos;s commission</Text>
              <Text style={styles.teamText}>₹{totalCommission.toLocaleString('en-IN')} earned from your downline&apos;s scans</Text>
            </View>
          </Card>
        ) : null}

        <Card style={styles.referralCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.referralLabel}>YOUR REFERRAL CODE</Text>
            <Text style={styles.referralValue}>{referralCode || '—'}</Text>
          </View>
          <Ionicons name="share-social-outline" size={20} color={colors.navy700} />
        </Card>

        {isApplicator ? (
          <GlowBorder cornerRadius={radius.md} borderWidth={2} backgroundColor={colors.surfaceMuted} speed={3800}>
            <PressableScale style={styles.scanCta} onPress={() => navigation.navigate('Scan')}>
              <Ionicons name="qr-code-outline" size={22} color={colors.white} />
              <Text style={styles.scanCtaText}>Scan a Coupon</Text>
            </PressableScale>
          </GlowBorder>
        ) : null}

        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.grid}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable key={action.key} style={styles.gridItem} onPress={() => onQuickAction(action.key)}>
              <Ionicons name={action.icon} size={22} color={colors.navy700} />
              <Text style={styles.gridLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        {isApplicator ? (
          <>
            <Text style={styles.sectionTitle}>Recent scans</Text>
            {scanHistory.length === 0 ? (
              <Text style={styles.emptyText}>No scans yet — scan a coupon to start earning.</Text>
            ) : (
              <View style={{ gap: spacing.md }}>
                {scanHistory.slice(0, 5).map((item) => (
                  <Card key={item.id} style={styles.activityRow}>
                    <View style={styles.activityIcon}>
                      <Ionicons name="qr-code-outline" size={18} color={colors.navy700} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityTitle}>Coupon scanned</Text>
                      <Text style={styles.activityTime}>{new Date(item.created_at).toLocaleString()}</Text>
                    </View>
                    <Text style={styles.activityPoints}>+{item.points_awarded} pts</Text>
                  </Card>
                ))}
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Recent commission</Text>
            {commissionEarnings.length === 0 ? (
              <Text style={styles.emptyText}>No commission yet — earnings from your downline&apos;s scans show up here.</Text>
            ) : (
              <View style={{ gap: spacing.md }}>
                {commissionEarnings.slice(0, 5).map((item) => (
                  <Card key={item.id} style={styles.activityRow}>
                    <View style={styles.activityIcon}>
                      <Ionicons name="trending-up-outline" size={18} color={colors.navy700} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityTitle}>Level {item.level} commission</Text>
                      <Text style={styles.activityTime}>{new Date(item.created_at).toLocaleString()}</Text>
                    </View>
                    <Text style={styles.activityPoints}>+{Number(item.amount).toFixed(2)} pts</Text>
                  </Card>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xxl, paddingTop: spacing.md, paddingBottom: spacing.lg },
  greeting: { ...typography.h2, color: colors.textPrimary },
  roleBadge: {
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
  roleText: { ...typography.caption, color: colors.orange600, fontWeight: '600' },
  content: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  balanceRow: { flexDirection: 'row', gap: spacing.md },
  balanceCard: { flex: 1 },
  balanceLabel: { ...typography.label, color: colors.orange500 },
  balanceValue: { ...typography.h1, color: colors.textPrimary, marginTop: spacing.xs },
  balanceHint: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  teamCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  teamIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamTitle: { ...typography.bodyMedium, color: colors.textPrimary },
  teamText: { ...typography.caption, color: colors.textSecondary, marginTop: 1 },
  referralCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.orange50, borderColor: colors.orange100 },
  referralLabel: { ...typography.label, color: colors.orange600 },
  referralValue: { ...typography.h3, color: colors.textPrimary, marginTop: 2 },
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
  emptyText: { ...typography.caption, color: colors.textSecondary },
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
