import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { useApp } from '../../state/AppContext';

export function AdminRedemptionsScreen() {
  const { redemptionRequests, decideRedemption } = useApp();
  const pending = redemptionRequests.filter((r) => r.status === 'pending');
  const resolved = redemptionRequests.filter((r) => r.status !== 'pending');

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Text style={styles.title}>Redemptions</Text>
        <Text style={styles.subtitle}>≥200 pts needs review · 4hr SLA</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {redemptionRequests.length === 0 ? (
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
                    <Text style={styles.name}>{req.applicantName}</Text>
                    <Text style={styles.meta}>{req.upiId} · {req.requestedAt}</Text>
                  </View>
                  <Text style={styles.amount}>{req.amount} pts</Text>
                </View>
                <View style={styles.actionRow}>
                  <View style={{ flex: 1 }}>
                    <Button label="Approve" icon="checkmark" onPress={() => decideRedemption(req.id, 'approved')} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button label="Reject" icon="close" variant="secondary" onPress={() => decideRedemption(req.id, 'rejected')} />
                  </View>
                </View>
              </Card>
            ))}

            {resolved.length > 0 ? <Text style={styles.sectionTitle}>Resolved</Text> : null}
            {resolved.map((req) => (
              <Card key={req.id} style={styles.rowTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{req.applicantName}</Text>
                  <Text style={styles.meta}>{req.amount} pts · {req.upiId}</Text>
                </View>
                <Pill
                  label={req.status === 'approved' ? 'Approved' : 'Rejected'}
                  tone={req.status === 'approved' ? 'success' : 'danger'}
                  size="sm"
                />
              </Card>
            ))}
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
