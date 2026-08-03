import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { listMyPointsLedger, listMyRunsLedger, PointsLedgerRow, RunsLedgerRow } from '../../services/wallet';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Ledger'>;

type Tab = 'points' | 'runs';

const ENTRY_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  scan_credit: 'qr-code-outline',
  commission_credit: 'trending-up-outline',
  redemption_debit: 'arrow-down-circle-outline',
  challenge_credit: 'trophy-outline',
  spin_credit: 'sync-circle-outline',
  scratch_credit: 'ticket-outline',
  gift_redemption_debit: 'gift-outline',
  adjustment: 'construct-outline',
};

const ENTRY_LABEL: Record<string, string> = {
  scan_credit: 'Coupon scan',
  commission_credit: 'Commission earned',
  redemption_debit: 'Redemption request',
  challenge_credit: 'Challenge reward',
  spin_credit: 'Spin wheel',
  scratch_credit: 'Scratch card',
  gift_redemption_debit: 'Gift redeemed',
  adjustment: 'Adjustment',
};

export function LedgerScreen({ navigation }: Props) {
  const [tab, setTab] = useState<Tab>('points');
  const [pointsLedger, setPointsLedger] = useState<PointsLedgerRow[]>([]);
  const [runsLedger, setRunsLedger] = useState<RunsLedgerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listMyPointsLedger(), listMyRunsLedger()])
      .then(([points, runs]) => {
        if (!cancelled) {
          setPointsLedger(points);
          setRunsLedger(runs);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const entries = tab === 'points' ? pointsLedger : runsLedger;

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Full Ledger</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabRow}>
        <Pressable style={[styles.tab, tab === 'points' && styles.tabActive]} onPress={() => setTab('points')}>
          <Text style={[styles.tabText, tab === 'points' && styles.tabTextActive]}>Points</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'runs' && styles.tabActive]} onPress={() => setTab('runs')}>
          <Text style={[styles.tabText, tab === 'runs' && styles.tabTextActive]}>Runs</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!loading && entries.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={40} color={colors.neutral400} />
            <Text style={styles.emptyText}>No {tab === 'points' ? 'Points' : 'Runs'} activity yet</Text>
          </View>
        ) : (
          entries.map((entry) => {
            const amount = Number(entry.amount);
            const isNegative = amount < 0;
            return (
              <Card key={entry.id} style={styles.row}>
                <View style={[styles.icon, isNegative && styles.iconNegative]}>
                  <Ionicons name={ENTRY_ICON[entry.entry_type] ?? 'ellipse-outline'} size={18} color={isNegative ? colors.danger : colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.entryLabel}>{ENTRY_LABEL[entry.entry_type] ?? entry.entry_type}</Text>
                  <Text style={styles.entryTime}>{new Date(entry.created_at).toLocaleString()}</Text>
                </View>
                <Text style={[styles.amount, isNegative && styles.amountNegative]}>
                  {isNegative ? '' : '+'}{tab === 'points' ? amount.toFixed(2) : amount}
                </Text>
              </Card>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { ...m3Type.titleLarge, color: colors.textPrimary },
  tabRow: { flexDirection: 'row', paddingHorizontal: spacing.xl, gap: spacing.sm, marginTop: spacing.md, marginBottom: spacing.md },
  tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.pill, alignItems: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary700, borderColor: colors.primary700 },
  tabText: { ...m3Type.labelLarge, fontSize: 13, color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.md },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxxl },
  emptyText: { ...m3Type.labelLarge, color: colors.neutral600 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(20,200,124,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconNegative: { backgroundColor: 'rgba(220,38,38,0.1)' },
  entryLabel: { ...m3Type.titleMedium, fontSize: 13, color: colors.textPrimary },
  entryTime: { ...m3Type.labelMedium, fontSize: 11, color: colors.neutral500, marginTop: 2 },
  amount: { ...m3Type.titleMediumSemiBold, fontSize: 13, color: colors.success },
  amountNegative: { color: colors.danger },
});
