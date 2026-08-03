import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { getUserLedgerByMobile, UserLedgerSummary } from '../../services/admin';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function AdminLedgerSearchScreen() {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [ledger, setLedger] = useState<UserLedgerSummary | null>(null);

  const onSearch = async () => {
    if (mobile.length !== 10) return;
    setLoading(true);
    setNotFound(false);
    setLedger(null);
    try {
      const result = await getUserLedgerByMobile(mobile);
      if (!result) setNotFound(true);
      else setLedger(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Text style={styles.title}>Ledger Search</Text>
        <Text style={styles.subtitle}>Full history for dispute resolution</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter mobile number"
          placeholderTextColor={colors.neutral400}
          keyboardType="number-pad"
          maxLength={10}
          value={mobile}
          onChangeText={(t) => setMobile(t.replace(/[^0-9]/g, ''))}
        />
        <Button label={loading ? '…' : 'Search'} onPress={onSearch} disabled={mobile.length !== 10 || loading} icon={null} fullWidth={false} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? <ActivityIndicator color={colors.primary700} style={{ marginTop: spacing.xxl }} /> : null}

        {notFound ? (
          <View style={styles.empty}>
            <Ionicons name="person-remove-outline" size={40} color={colors.neutral400} />
            <Text style={styles.emptyText}>No account found with this mobile number</Text>
          </View>
        ) : null}

        {ledger ? (
          <>
            <Card style={styles.profileCard}>
              <Text style={styles.profileName}>{ledger.profile.full_name || 'GoMax User'}</Text>
              <Text style={styles.profileMeta}>{ledger.profile.role} · {ledger.profile.city || '—'} · +91 {ledger.profile.mobile_number}</Text>
              <View style={styles.balanceRow}>
                <View style={styles.balanceChip}>
                  <Text style={styles.balanceLabel}>POINTS</Text>
                  <Text style={styles.balanceValue}>{ledger.profile.points}</Text>
                </View>
                <View style={styles.balanceChip}>
                  <Text style={styles.balanceLabel}>RUNS</Text>
                  <Text style={styles.balanceValue}>{ledger.profile.runs}</Text>
                </View>
              </View>
            </Card>

            <Section title={`SCANS (${ledger.scans.length})`}>
              {ledger.scans.length === 0 ? (
                <Text style={styles.emptyInline}>No scans yet</Text>
              ) : (
                ledger.scans.map((s) => (
                  <Card key={s.id} style={styles.ledgerRow}>
                    <Text style={styles.ledgerLabel}>Coupon scan</Text>
                    <Text style={styles.ledgerMeta}>{new Date(s.created_at).toLocaleString()}</Text>
                    <Text style={styles.ledgerAmount}>+{s.points_awarded} pts</Text>
                  </Card>
                ))
              )}
            </Section>

            <Section title={`COMMISSION EARNED (${ledger.commissionEarned.length})`}>
              {ledger.commissionEarned.length === 0 ? (
                <Text style={styles.emptyInline}>No commission yet</Text>
              ) : (
                ledger.commissionEarned.map((c) => (
                  <Card key={c.id} style={styles.ledgerRow}>
                    <Text style={styles.ledgerLabel}>Level {c.level} commission</Text>
                    <Text style={styles.ledgerMeta}>{new Date(c.created_at).toLocaleString()}</Text>
                    <Text style={styles.ledgerAmount}>+{Number(c.amount).toFixed(2)} pts</Text>
                  </Card>
                ))
              )}
            </Section>

            <Section title={`POINTS LEDGER (${ledger.pointsLedger.length})`}>
              {ledger.pointsLedger.length === 0 ? (
                <Text style={styles.emptyInline}>No entries yet</Text>
              ) : (
                ledger.pointsLedger.map((p) => (
                  <Card key={p.id} style={styles.ledgerRow}>
                    <Text style={styles.ledgerLabel}>{p.entry_type.replace('_', ' ')}</Text>
                    <Text style={styles.ledgerMeta}>{new Date(p.created_at).toLocaleString()}</Text>
                    <Text style={[styles.ledgerAmount, Number(p.amount) < 0 && styles.ledgerAmountNegative]}>
                      {Number(p.amount) >= 0 ? '+' : ''}{Number(p.amount).toFixed(2)}
                    </Text>
                  </Card>
                ))
              )}
            </Section>

            <Section title={`RUNS LEDGER (${ledger.runsLedger.length})`}>
              {ledger.runsLedger.length === 0 ? (
                <Text style={styles.emptyInline}>No entries yet</Text>
              ) : (
                ledger.runsLedger.map((r) => (
                  <Card key={r.id} style={styles.ledgerRow}>
                    <Text style={styles.ledgerLabel}>{r.entry_type.replace('_', ' ')}</Text>
                    <Text style={styles.ledgerMeta}>{new Date(r.created_at).toLocaleString()}</Text>
                    <Text style={[styles.ledgerAmount, Number(r.amount) < 0 && styles.ledgerAmountNegative]}>
                      {Number(r.amount) >= 0 ? '+' : ''}{Number(r.amount)}
                    </Text>
                  </Card>
                ))
              )}
            </Section>

            <Section title={`REDEMPTION REQUESTS (${ledger.redemptions.length})`}>
              {ledger.redemptions.length === 0 ? (
                <Text style={styles.emptyInline}>None yet</Text>
              ) : (
                ledger.redemptions.map((r) => (
                  <Card key={r.id} style={styles.ledgerRow}>
                    <Text style={styles.ledgerLabel}>₹{Number(r.amount).toLocaleString('en-IN')}</Text>
                    <Text style={styles.ledgerMeta}>{new Date(r.requested_at).toLocaleString()}</Text>
                    <Pill
                      label={r.status}
                      tone={r.status === 'rejected' ? 'danger' : r.status === 'pending' ? 'warning' : 'success'}
                      size="sm"
                    />
                  </Card>
                ))
              )}
            </Section>

            <Section title={`GIFT CLAIMS (${ledger.giftClaims.length})`}>
              {ledger.giftClaims.length === 0 ? (
                <Text style={styles.emptyInline}>None yet</Text>
              ) : (
                ledger.giftClaims.map((g) => (
                  <Card key={g.id} style={styles.ledgerRow}>
                    <Text style={styles.ledgerLabel}>{g.gift?.name ?? 'Gift'}</Text>
                    <Text style={styles.ledgerMeta}>{g.runs_spent} Runs · {new Date(g.requested_at).toLocaleDateString()}</Text>
                    <Pill label={g.status} tone={g.status === 'delivered' ? 'success' : g.status === 'shipped' ? 'info' : 'warning'} size="sm" />
                  </Card>
                ))
              )}
            </Section>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md },
  title: { ...m3Type.titleLarge, color: colors.textPrimary },
  subtitle: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, marginTop: 2 },
  searchRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl, marginBottom: spacing.lg, alignItems: 'center' },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    ...m3Type.titleMediumSemiBold,
    fontSize: 14,
    color: colors.neutral950,
  },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxxl },
  emptyText: { ...m3Type.labelLarge, color: colors.neutral600, textAlign: 'center' },
  emptyInline: { ...m3Type.labelMedium, color: colors.neutral500 },
  profileCard: { gap: spacing.sm },
  profileName: { ...m3Type.titleLarge, color: colors.textPrimary },
  profileMeta: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, textTransform: 'capitalize' },
  balanceRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  balanceChip: { flex: 1, backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: spacing.md },
  balanceLabel: { ...m3Type.labelSmall, color: colors.neutral500, letterSpacing: 0.6 },
  balanceValue: { ...m3Type.headlineMedium, fontSize: 20, color: colors.textPrimary, marginTop: 2 },
  sectionTitle: { ...m3Type.labelSmall, color: colors.neutral500, letterSpacing: 0.6 },
  ledgerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  ledgerLabel: { ...m3Type.titleMedium, fontSize: 13, color: colors.textPrimary, flex: 1, textTransform: 'capitalize' },
  ledgerMeta: { ...m3Type.labelMedium, fontSize: 11, color: colors.neutral500 },
  ledgerAmount: { ...m3Type.titleMediumSemiBold, fontSize: 13, color: colors.success },
  ledgerAmountNegative: { color: colors.danger },
});
