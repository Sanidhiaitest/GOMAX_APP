import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, spacing } from '../../theme';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { useMyOrders } from '../../hooks/useSupabaseData';
import { RootStackParamList } from '../../navigation/types';

type OrderStatus = 'Placed' | 'Billed' | 'In transit' | 'Delivered';

const STATUS_META: Record<OrderStatus, { tone: 'neutral' | 'warning' | 'info' | 'success'; icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap }> = {
  Placed: { tone: 'neutral', icon: 'ellipse-outline' },
  Billed: { tone: 'warning', icon: 'receipt-outline' },
  'In transit': { tone: 'info', icon: 'car-outline' },
  Delivered: { tone: 'success', icon: 'checkmark-circle' },
};

export function OrdersListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: recentOrders } = useMyOrders();
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
        <Text style={styles.headerTitle}>Your Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={recentOrders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={40} color={colors.neutral400} />
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>Orders you place will show up here</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
            <Card style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderNo}>{item.order_no}</Text>
                <Text style={styles.orderDate}>
                  {new Date(item.order_date).toLocaleDateString()} · {item.items.length} item{item.items.length > 1 ? 's' : ''}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={styles.amount}>₹{Number(item.amount).toLocaleString('en-IN')}</Text>
                <Pill
                  label={item.status}
                  tone={STATUS_META[item.status as OrderStatus].tone}
                  icon={STATUS_META[item.status as OrderStatus].icon}
                  size="sm"
                />
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.neutral400} />
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...m3Type.titleLarge, color: colors.textPrimary },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  orderNo: { ...m3Type.titleMedium, fontSize: 15, color: colors.textPrimary },
  orderDate: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, marginTop: 2 },
  amount: { ...m3Type.titleMedium, fontSize: 15, color: colors.textPrimary },
  empty: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xxxl },
  emptyText: { ...m3Type.titleMedium, fontSize: 15, color: colors.neutral500 },
  emptySubtext: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral600 },
});
