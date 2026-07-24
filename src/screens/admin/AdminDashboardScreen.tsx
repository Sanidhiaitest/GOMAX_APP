import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { StatTile } from '../../components/StatTile';
import { useApp } from '../../state/AppContext';
import { fraudFlags, kpiSummary, otherApplicators, otherDealerApplications } from '../../data/adminMock';
import { AdminTabParamList, RootStackParamList } from '../../navigation/types';

type Nav = BottomTabNavigationProp<AdminTabParamList> & NativeStackNavigationProp<RootStackParamList>;

export function AdminDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { role, dealerVerificationStatus, redemptionRequests, adminLogout } = useApp();

  const pendingDealerCount = otherDealerApplications.length + (role === 'dealer' && dealerVerificationStatus === 'pending' ? 1 : 0);
  const pendingRedemptionCount = redemptionRequests.filter((r) => r.status === 'pending').length;
  const activeApplicators = otherApplicators.length + (role === 'mason' ? 1 : 0);

  const onLogout = () => {
    adminLogout();
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
  };

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>GoMax HQ</Text>
          <Text style={styles.subtitle}>Live across Mason, Dealer & Salesman apps</Text>
        </View>
        <Pressable
          onPress={onLogout}
          style={styles.logoutButton}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <Ionicons name="log-out-outline" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statGrid}>
          <StatTile icon="people-outline" value={String(activeApplicators)} label="Active applicators" />
          <StatTile icon="scan-outline" value={String(kpiSummary.scansToday)} label="Scans today" iconColor={colors.secondary500} iconBg={colors.secondary50} />
        </View>
        <View style={styles.statGrid}>
          <StatTile
            icon="storefront-outline"
            value={String(pendingDealerCount)}
            label="Dealer approvals due"
            iconColor={colors.warning}
            iconBg="#fff4e0"
          />
          <StatTile
            icon="cash-outline"
            value={String(pendingRedemptionCount)}
            label="Redemptions due"
            iconColor={colors.warning}
            iconBg="#fff4e0"
          />
        </View>

        <Text style={styles.sectionTitle}>Needs your attention</Text>
        <View style={{ gap: spacing.md }}>
          <Pressable onPress={() => navigation.navigate('DealerApprovals')}>
            <Card style={styles.attentionRow}>
              <View style={[styles.attentionIcon, { backgroundColor: '#fff4e0' }]}>
                <Ionicons name="storefront-outline" size={20} color={colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.attentionTitle}>Dealer applications</Text>
                <Text style={styles.attentionSubtitle}>Field verification + credit check pending</Text>
              </View>
              <Pill label={String(pendingDealerCount)} tone="warning" size="sm" />
            </Card>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Redemptions')}>
            <Card style={styles.attentionRow}>
              <View style={[styles.attentionIcon, { backgroundColor: colors.orange50 }]}>
                <Ionicons name="cash-outline" size={20} color={colors.primary700} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.attentionTitle}>Redemption requests</Text>
                <Text style={styles.attentionSubtitle}>≥200 pts — 4hr SLA</Text>
              </View>
              <Pill label={String(pendingRedemptionCount)} tone="primary" size="sm" />
            </Card>
          </Pressable>

          <Card style={styles.attentionRow}>
            <View style={[styles.attentionIcon, { backgroundColor: '#fdeaea' }]}>
              <Ionicons name="warning-outline" size={20} color={colors.danger} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.attentionTitle}>Fraud flags</Text>
              <Text style={styles.attentionSubtitle}>{fraudFlags[0]?.title}</Text>
            </View>
            <Pill label={String(fraudFlags.length)} tone="danger" size="sm" />
          </Card>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  logoutButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...m3Type.headlineMedium, fontSize: 22, color: colors.textPrimary },
  subtitle: { ...m3Type.labelLarge, color: colors.neutral500, marginTop: 2 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  statGrid: { flexDirection: 'row', gap: spacing.md },
  sectionTitle: { ...m3Type.titleMediumSemiBold, color: colors.textPrimary, marginTop: spacing.sm },
  attentionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  attentionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attentionTitle: { ...m3Type.titleMedium, fontSize: 14, color: colors.textPrimary },
  attentionSubtitle: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, marginTop: 2 },
});
