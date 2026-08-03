import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { useAllRedemptions } from '../../hooks/useAppData';
import { decideRedemption } from '../../services/admin';

const STATUS_META: Record<string, { label: string; tone: 'success' | 'danger' }> = {
  approved: { label: 'Approved', tone: 'success' },
  paid: { label: 'Paid', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'danger' },
};

export function AdminRedemptionsScreen() {
  const { data: redemptions, reload } = useAllRedemptions();
  const pending = redemptions.filter((r) => r.status === 'pending');
  const resolved = redemptions.filter((r) => r.status !== 'pending');

  const onDecide = async (id: string, decision: 'approved' | 'rejected') => {
    const { tds } = await decideRedemption(id, decision);
    if (tds?.tds_applicable) {
      Alert.alert(
        'Tax deducted (Govt. rule)',
        `This person crossed ₹20,000 in payouts this financial year, so ${tds.tds_rate === 0.1 ? '10%' : '20%'} tax (₹${tds.tds_amount?.toLocaleString('en-IN')}) applies under Section 194R.${tds.pan_on_file ? '' : ' No PAN on file — rate is 20% instead of 10%. Ask them to add their PAN to save them money next time.'}`
      );
    }
    await reload();
  };

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Text style={styles.title}>Redemptions</Text>
        <Text style={styles.subtitle}>₹500–₹5,000 per request · ₹15,000/month cap</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {redemptions.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="cash-outline" size={40} color={colors.neutral400} />
            <Text style={styles.emptyText}>No redemption requests yet</Text>
          </View>
        ) : (
          <>
            {pending.map((req) => (
              <Card key={req.id} style={styles.card}>
                <View style={styles.rowTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{req.user?.full_name || 'GoMax User'}</Text>
                    <Text style={styles.meta}>
                      {req.upi_id || 'Bank transfer'} · {new Date(req.requested_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.amount}>₹{Number(req.amount).toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.actionRow}>
                  <View style={{ flex: 1 }}>
                    <Button label="Approve" icon="checkmark" onPress={() => onDecide(req.id, 'approved')} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button label="Reject" icon="close" variant="secondary" onPress={() => onDecide(req.id, 'rejected')} />
                  </View>
                </View>
              </Card>
            ))}

            {resolved.length > 0 ? <Text style={styles.sectionTitle}>Resolved</Text> : null}
            {resolved.map((req) => {
              const meta = STATUS_META[req.status] ?? STATUS_META.rejected;
              return (
                <Card key={req.id} style={styles.rowTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{req.user?.full_name || 'GoMax User'}</Text>
                    <Text style={styles.meta}>₹{Number(req.amount).toLocaleString('en-IN')} · {req.upi_id || 'Bank transfer'}</Text>
                  </View>
                  <Pill label={meta.label} tone={meta.tone} size="sm" />
                </Card>
              );
            })}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.lg },
  title: { ...m3Type.titleLarge, color: colors.textPrimary },
  subtitle: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, marginTop: 2 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.md },
  card: { gap: spacing.md },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  name: { ...m3Type.titleMedium, fontSize: 14, color: colors.textPrimary },
  meta: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, marginTop: 2 },
  amount: { ...m3Type.titleMediumSemiBold, color: colors.primary700 },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  sectionTitle: { ...m3Type.titleMediumSemiBold, color: colors.textPrimary, marginTop: spacing.sm },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxxl },
  emptyText: { ...m3Type.labelLarge, color: colors.neutral600 },
});
