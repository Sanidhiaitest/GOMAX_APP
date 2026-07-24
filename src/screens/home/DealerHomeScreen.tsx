import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { useApp } from '../../state/AppContext';
import { dealerLedger, recentOrders, scanNotifications, OrderStatus } from '../../data/dealerMock';
import { RootStackParamList } from '../../navigation/types';

const STATUS_META: Record<OrderStatus, { tone: 'neutral' | 'warning' | 'info' | 'success'; icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap }> = {
  Placed: { tone: 'neutral', icon: 'ellipse-outline' },
  Billed: { tone: 'warning', icon: 'receipt-outline' },
  'In transit': { tone: 'info', icon: 'car-outline' },
  Delivered: { tone: 'success', icon: 'checkmark-circle' },
};

export function DealerHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { fullName, city, dealerBusiness, dealerVerificationStatus } = useApp();
  const utilisation = Math.round((dealerLedger.outstanding / dealerLedger.creditLimit) * 100);

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Namaste, {fullName || 'Dealer'}</Text>
        <Text style={styles.subGreeting}>{dealerBusiness.shopName || city || 'Your shop'} · Dealer account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {dealerVerificationStatus === 'pending' ? (
          <Card style={styles.verificationBanner}>
            <View style={styles.verificationIcon}>
              <Ionicons name="time-outline" size={20} color={colors.orange600} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.verificationTitle}>Verification pending</Text>
              <Text style={styles.verificationText}>Salesman visit required</Text>
            </View>
            <Pill label="Pending" tone="warning" icon="hourglass-outline" size="sm" />
          </Card>
        ) : null}

        <Pressable onPress={() => navigation.navigate('Ledger')}>
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
        </Pressable>

        <Pressable style={styles.newOrderCta} onPress={() => navigation.navigate('OrderPlacement')}>
          <Ionicons name="add-circle-outline" size={22} color={colors.white} />
          <Text style={styles.newOrderCtaText}>Place New Order</Text>
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Scan notifications</Text>
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
          <Pressable onPress={() => navigation.navigate('OrdersList')}>
            <Text style={styles.sectionLink}>See all</Text>
          </Pressable>
        </View>
        <View style={{ gap: spacing.md }}>
          {recentOrders.slice(0, 3).map((o) => (
            <Pressable key={o.id} onPress={() => navigation.navigate('OrderDetail', { orderId: o.id })}>
              <Card style={styles.orderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderNo}>{o.orderNo}</Text>
                  <Text style={styles.orderDate}>{o.date}</Text>
                </View>
                <Text style={styles.orderAmount}>₹{o.amount.toLocaleString('en-IN')}</Text>
                <Pill label={o.status} tone={STATUS_META[o.status].tone} icon={STATUS_META[o.status].icon} size="sm" />
              </Card>
            </Pressable>
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
  verificationBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.orange50, borderColor: colors.orange100 },
  verificationIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationTitle: { ...typography.bodyMedium, color: colors.textPrimary },
  verificationText: { ...typography.caption, color: colors.orange600, marginTop: 1 },
  newOrderCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.orange500,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
  },
  newOrderCtaText: { ...typography.button, color: colors.white },
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
});
