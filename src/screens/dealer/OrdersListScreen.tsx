import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, spacing } from '../../theme';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { recentOrders, OrderStatus } from '../../data/dealerMock';
import { RootStackParamList } from '../../navigation/types';

const STATUS_META: Record<OrderStatus, { tone: 'neutral' | 'warning' | 'info' | 'success'; icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap }> = {
  Placed: { tone: 'neutral', icon: 'ellipse-outline' },
  Billed: { tone: 'warning', icon: 'receipt-outline' },
  'In transit': { tone: 'info', icon: 'car-outline' },
  Delivered: { tone: 'success', icon: 'checkmark-circle' },
};

export function OrdersListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
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
        renderItem={({ item }) => (
          <Pressable onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
            <Card style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderNo}>{item.orderNo}</Text>
                <Text style={styles.orderDate}>{item.date} · {item.items.length} item{item.items.length > 1 ? 's' : ''}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={styles.amount}>₹{item.amount.toLocaleString('en-IN')}</Text>
                <Pill label={item.status} tone={STATUS_META[item.status].tone} icon={STATUS_META[item.status].icon} size="sm" />
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
});
