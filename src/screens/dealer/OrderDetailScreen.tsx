import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { recentOrders, STATUS_STEPS } from '../../data/dealerMock';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

export function OrderDetailScreen({ navigation, route }: Props) {
  const order = recentOrders.find((o) => o.id === route.params.orderId);

  if (!order) {
    return (
      <Screen backgroundColor={colors.surfaceMuted}>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.neutral400} />
          <Text style={styles.notFoundText}>Order not found</Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.notFoundLink}>Go back</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{order.orderNo}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.timeline}>
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStepIndex;
              return (
                <View key={step} style={styles.timelineRow}>
                  <View style={styles.timelineIconWrap}>
                    <View style={[styles.timelineDot, done && styles.timelineDotDone]}>
                      {done ? <Ionicons name="checkmark" size={12} color={colors.white} /> : null}
                    </View>
                    {i < STATUS_STEPS.length - 1 ? (
                      <View style={[styles.timelineLine, i < currentStepIndex && styles.timelineLineDone]} />
                    ) : null}
                  </View>
                  <Text style={[styles.timelineLabel, done && styles.timelineLabelDone]}>{step}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={{ gap: spacing.md, marginTop: spacing.sm }}>
            {order.items.map((item) => (
              <View key={item.name} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQty}>Qty {item.qty} × ₹{item.price}</Text>
                </View>
                <Text style={styles.itemAmount}>₹{(item.qty * item.price).toLocaleString('en-IN')}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.itemRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>₹{order.amount.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...m3Type.titleLarge, color: colors.textPrimary },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  sectionTitle: { ...m3Type.titleMediumSemiBold, color: colors.textPrimary },
  timeline: { marginTop: spacing.lg },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, minHeight: 44 },
  timelineIconWrap: { alignItems: 'center' },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.neutral200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotDone: { backgroundColor: colors.success },
  timelineLine: { width: 2, flex: 1, backgroundColor: colors.neutral200, marginVertical: 2 },
  timelineLineDone: { backgroundColor: colors.success },
  timelineLabel: { ...m3Type.labelLarge, color: colors.neutral500, marginTop: 3 },
  timelineLabelDone: { color: colors.textPrimary, fontWeight: '600' },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemName: { ...m3Type.titleMedium, fontSize: 14, color: colors.textPrimary },
  itemQty: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, marginTop: 2 },
  itemAmount: { ...m3Type.titleMedium, fontSize: 14, color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border },
  totalLabel: { ...m3Type.titleMediumSemiBold, color: colors.textPrimary },
  totalAmount: { ...m3Type.titleMediumSemiBold, color: colors.primary700 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  notFoundText: { ...m3Type.titleMedium, color: colors.textSecondary },
  notFoundLink: { ...m3Type.labelLarge, color: colors.primary700 },
});
