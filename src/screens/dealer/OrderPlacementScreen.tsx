import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { useProducts } from '../../hooks/useSupabaseData';
import { placeOrder } from '../../services/dealer';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderPlacement'>;

export function OrderPlacementScreen({ navigation }: Props) {
  const { data: products } = useProducts();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [placed, setPlaced] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  const setQty = (id: string, delta: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) }));
  };

  const total = products.reduce((sum, p) => sum + (quantities[p.id] ?? 0) * Number(p.price), 0);
  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

  const onPlaceOrder = async () => {
    setPlacing(true);
    setError('');
    try {
      const items = products
        .filter((p) => (quantities[p.id] ?? 0) > 0)
        .map((p) => ({ productId: p.id, name: p.name, qty: quantities[p.id], price: Number(p.price) }));
      await placeOrder(items);
      setPlaced(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not place order. Try again.');
    } finally {
      setPlacing(false);
    }
  };

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
        <Text style={styles.headerTitle}>New Order</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {products.map((product) => {
          const qty = quantities[product.id] ?? 0;
          return (
            <Card key={product.id} style={styles.productRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productPrice}>₹{Number(product.price)} {product.unit}</Text>
              </View>
              <View style={styles.stepper}>
                <Pressable
                  style={styles.stepperButton}
                  onPress={() => setQty(product.id, -1)}
                  disabled={qty === 0}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  accessibilityRole="button"
                  accessibilityLabel={`Decrease quantity of ${product.name}`}
                  accessibilityState={{ disabled: qty === 0 }}
                >
                  <Ionicons name="remove" size={16} color={qty === 0 ? colors.neutral300 : colors.primary700} />
                </Pressable>
                <Text style={styles.stepperValue}>{qty}</Text>
                <Pressable
                  style={styles.stepperButton}
                  onPress={() => setQty(product.id, 1)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  accessibilityRole="button"
                  accessibilityLabel={`Increase quantity of ${product.name}`}
                >
                  <Ionicons name="add" size={16} color={colors.primary700} />
                </Pressable>
              </View>
            </Card>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{totalItems} item{totalItems !== 1 ? 's' : ''}</Text>
          <Text style={styles.totalValue}>₹{total.toLocaleString('en-IN')}</Text>
        </View>
        <Button
          label={placing ? 'Placing…' : 'Place Order'}
          onPress={onPlaceOrder}
          disabled={totalItems === 0 || placing}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <Modal visible={placed} transparent animationType="fade">
        <View style={styles.resultBackdrop}>
          <View style={styles.resultCard}>
            <View style={styles.resultIcon}>
              <Ionicons name="checkmark" size={32} color={colors.white} />
            </View>
            <Text style={styles.resultTitle}>Order placed</Text>
            <Text style={styles.resultSubtitle}>
              ₹{total.toLocaleString('en-IN')} across {totalItems} item{totalItems !== 1 ? 's' : ''} — your salesman will confirm shortly.
            </Text>
            <Button label="Done" onPress={() => navigation.goBack()} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...m3Type.titleLarge, color: colors.textPrimary },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.md },
  productRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  productName: { ...m3Type.titleMedium, fontSize: 14, color: colors.textPrimary },
  productPrice: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { ...m3Type.titleMediumSemiBold, color: colors.textPrimary, minWidth: 20, textAlign: 'center' },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { ...m3Type.labelLarge, color: colors.neutral500 },
  totalValue: { ...m3Type.headlineMedium, fontSize: 22, color: colors.textPrimary },
  errorText: { ...m3Type.labelMedium, color: colors.danger, textAlign: 'center' },
  resultBackdrop: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  resultCard: { width: '100%', backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xxl, alignItems: 'center', gap: spacing.sm },
  resultIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  resultTitle: { ...m3Type.titleLarge, color: colors.neutral950 },
  resultSubtitle: { ...m3Type.labelLarge, color: colors.neutral500, textAlign: 'center', marginBottom: spacing.lg },
});
