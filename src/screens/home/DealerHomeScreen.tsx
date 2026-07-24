import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { useApp } from '../../state/AppContext';
import { dealerLedger, recentOrders, scanNotifications } from '../../data/dealerMock';

const STATUS_COLOR: Record<string, string> = {
  Delivered: colors.success,
  'In transit': colors.warning,
  Billed: colors.textSecondary,
};

export function DealerHomeScreen() {
  const { fullName, city } = useApp();
  const utilisation = Math.round((dealerLedger.outstanding / dealerLedger.creditLimit) * 100);

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Namaste, {fullName || 'Dealer'}</Text>
        <Text style={styles.subGreeting}>{city || 'Your shop'} · Dealer account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.ledgerCard}>
          <Text style={styles.ledgerLabel}>OUTSTANDING BALANCE</Text>
          <Text style={styles.ledgerValue}>₹{dealerLedger.outstanding.toLocaleString('en-IN')}</Text>
          <View style={styles.ledgerBarTrack}>
            <View style={[styles.ledgerBarFill, { width: `${utilisation}%` }]} />
          </View>
          <Text style={styles.ledgerHint}>
            {utilisation}% of ₹{dealerLedger.creditLimit.toLocaleString('en-IN')} limit used · Due {dealerLedger.dueDate}
          </Text>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Scan notifications</Text>
          <Text style={styles.sectionLink}>See all</Text>
        </View>
        <View style={{ gap: spacing.md }}>
          {scanNotifications.map((n) => (
            <Card key={n.id} style={styles.notifRow}>
              <View style={styles.notifIcon}>
                <Ionicons name="qr-code-outline" size={18} color={colors.orange600} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>
                  <Text style={styles.notifBold}>{n.mason}</Text> scanned {n.product}
                </Text>
                <Text style={styles.notifTime}>{n.time}</Text>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent orders</Text>
          <Text style={styles.sectionLink}>See all</Text>
        </View>
        <View style={{ gap: spacing.md }}>
          {recentOrders.map((o) => (
            <Card key={o.id} style={styles.orderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderNo}>{o.orderNo}</Text>
                <Text style={styles.orderDate}>{o.date}</Text>
              </View>
              <Text style={styles.orderAmount}>₹{o.amount.toLocaleString('en-IN')}</Text>
              <Text style={[styles.orderStatus, { color: STATUS_COLOR[o.status] }]}>{o.status}</Text>
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
  subGreeting: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  content: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  ledgerCard: { backgroundColor: colors.navy900, borderColor: colors.navy900 },
  ledgerLabel: { ...typography.label, color: colors.orange500 },
  ledgerValue: { ...typography.h1, color: colors.white, marginTop: spacing.xs },
  ledgerBarTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  ledgerBarFill: { height: '100%', backgroundColor: colors.orange500 },
  ledgerHint: { ...typography.caption, color: 'rgba(255,255,255,0.7)', marginTop: spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  sectionTitle: { ...typography.h3, color: colors.textPrimary },
  sectionLink: { ...typography.caption, color: colors.orange500 },
  notifRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  notifIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.orange50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: { ...typography.caption, color: colors.textPrimary },
  notifBold: { fontWeight: '700' },
  notifTime: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  orderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  orderNo: { ...typography.bodyMedium, color: colors.textPrimary },
  orderDate: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  orderAmount: { ...typography.bodyMedium, color: colors.textPrimary, marginRight: spacing.sm },
  orderStatus: { ...typography.caption, fontWeight: '600' },
});
