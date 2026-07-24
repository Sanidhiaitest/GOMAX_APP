import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { useApp } from '../../state/AppContext';
import { beatPlan, salesmanTarget, streak, BeatStop } from '../../data/salesmanMock';

const STATUS_META: Record<BeatStop['status'], { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  visited: { label: 'Visited', color: colors.success, icon: 'checkmark-circle' },
  pending: { label: 'Pending', color: colors.warning, icon: 'time-outline' },
  skipped: { label: 'Skipped', color: colors.textMuted, icon: 'close-circle-outline' },
};

const QUICK_ACTIONS: { key: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'order', label: 'New Order', icon: 'receipt-outline' },
  { key: 'dcr', label: 'Daily Report', icon: 'document-text-outline' },
  { key: 'onboard', label: 'Onboard Dealer', icon: 'person-add-outline' },
  { key: 'collections', label: 'Collections', icon: 'cash-outline' },
];

export function SalesmanHomeScreen() {
  const { fullName } = useApp();
  const pct = Math.min(100, Math.round((salesmanTarget.achieved / salesmanTarget.target) * 100));

  const onQuickAction = (label: string) => {
    Alert.alert(label, 'Salesman app is Phase 2 in the PRD — this action will connect once that build starts.');
  };

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Namaste, {fullName || 'Salesman'}</Text>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={12} color={colors.orange500} />
          <Text style={styles.streakText}>{streak.label}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.targetCard}>
          <Text style={styles.targetLabel}>THIS MONTH&apos;S TARGET</Text>
          <Text style={styles.targetValue}>
            ₹{salesmanTarget.achieved.toLocaleString('en-IN')}
            <Text style={styles.targetOf}> / ₹{salesmanTarget.target.toLocaleString('en-IN')}</Text>
          </Text>
          <View style={styles.targetBarTrack}>
            <View style={[styles.targetBarFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.targetHint}>{pct}% achieved · {salesmanTarget.daysLeft} days left</Text>
        </Card>

        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.grid}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable key={action.key} style={styles.gridItem} onPress={() => onQuickAction(action.label)}>
              <Ionicons name={action.icon} size={22} color={colors.navy700} />
              <Text style={styles.gridLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Today&apos;s beat plan</Text>
          <Text style={styles.sectionLink}>
            {beatPlan.filter((s) => s.status === 'visited').length}/{beatPlan.length} done
          </Text>
        </View>
        <View style={{ gap: spacing.md }}>
          {beatPlan.map((stop) => {
            const meta = STATUS_META[stop.status];
            return (
              <Card key={stop.id} style={styles.stopRow}>
                <Ionicons name={meta.icon} size={22} color={meta.color} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.stopName}>{stop.dealerName}</Text>
                  <Text style={styles.stopArea}>{stop.area}</Text>
                </View>
                <View style={styles.stopRight}>
                  <Text style={[styles.stopStatus, { color: meta.color }]}>{meta.label}</Text>
                  {stop.outstanding > 0 ? (
                    <Text style={styles.stopOutstanding}>₹{stop.outstanding.toLocaleString('en-IN')} due</Text>
                  ) : null}
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xxl, paddingTop: spacing.md, paddingBottom: spacing.lg },
  greeting: { ...typography.h2, color: colors.textPrimary },
  streakBadge: {
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
  streakText: { ...typography.caption, color: colors.orange600, fontWeight: '600' },
  content: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  targetCard: { backgroundColor: colors.navy900, borderColor: colors.navy900 },
  targetLabel: { ...typography.label, color: colors.orange500 },
  targetValue: { ...typography.h1, color: colors.white, marginTop: spacing.xs },
  targetOf: { ...typography.h3, color: 'rgba(255,255,255,0.5)' },
  targetBarTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  targetBarFill: { height: '100%', backgroundColor: colors.orange500 },
  targetHint: { ...typography.caption, color: 'rgba(255,255,255,0.7)', marginTop: spacing.sm },
  sectionTitle: { ...typography.h3, color: colors.textPrimary, marginTop: spacing.sm },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  sectionLink: { ...typography.caption, color: colors.orange600, fontWeight: '600' },
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
  stopRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stopName: { ...typography.bodyMedium, color: colors.textPrimary },
  stopArea: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  stopRight: { alignItems: 'flex-end' },
  stopStatus: { ...typography.caption, fontWeight: '600' },
  stopOutstanding: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
});
