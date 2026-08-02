import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { useProducts } from '../../hooks/useSupabaseData';
import { ProductRow } from '../../services/products';

type ProductCategory = 'Adhesive' | 'Waterproofing' | 'Putty' | 'Cement' | 'Mortar';

const CATEGORY_COLOR: Record<string, { bg: string; fg: string }> = {
  Adhesive: { bg: '#fff4ec', fg: '#c05336' },
  Waterproofing: { bg: '#eaf6fb', fg: '#1e7fa8' },
  Putty: { bg: '#f2eefc', fg: '#6b4fc0' },
  Cement: { bg: '#eef1f4', fg: '#4a5568' },
  Mortar: { bg: '#fff8e6', fg: '#b8860b' },
};

const CATEGORIES: (ProductCategory | 'All')[] = ['All', 'Adhesive', 'Waterproofing', 'Putty', 'Cement', 'Mortar'];

export function ProductsScreen() {
  const [category, setCategory] = useState<ProductCategory | 'All'>('All');
  const [selected, setSelected] = useState<ProductRow | null>(null);
  const { data: catalogProducts } = useProducts();

  const products = category === 'All' ? catalogProducts : catalogProducts.filter((p) => p.category === category);

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
        {CATEGORIES.map((cat) => {
          const active = category === cat;
          return (
            <Pressable key={cat} onPress={() => setCategory(cat)}>
              <View style={[styles.categoryPill, active && styles.categoryPillActive]}>
                <Text style={[styles.categoryPillText, active && styles.categoryPillTextActive]}>{cat}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {products.map((product) => {
          const tone = CATEGORY_COLOR[product.category];
          return (
            <Pressable key={product.id} style={styles.cardWrap} onPress={() => setSelected(product)}>
              <Card style={styles.card}>
                <View style={[styles.iconTile, { backgroundColor: tone.bg }]}>
                  <Ionicons name={product.icon as keyof typeof Ionicons.glyphMap} size={28} color={tone.fg} />
                </View>
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.productUnit}>{product.unit}</Text>
                <Text style={styles.productPrice}>₹{product.price}</Text>
              </Card>
            </Pressable>
          );
        })}
      </ScrollView>

      <Modal visible={!!selected} transparent animationType="slide">
        <Pressable style={styles.modalBackdrop} onPress={() => setSelected(null)} />
        {selected ? (
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={[styles.iconTileLarge, { backgroundColor: CATEGORY_COLOR[selected.category].bg }]}>
              <Ionicons name={selected.icon as keyof typeof Ionicons.glyphMap} size={36} color={CATEGORY_COLOR[selected.category].fg} />
            </View>
            <Text style={styles.sheetName}>{selected.name}</Text>
            <Text style={styles.sheetMeta}>{selected.unit} · ₹{selected.price}</Text>
            <Text style={styles.sheetDescription}>{selected.description}</Text>
            <View style={styles.tagRow}>
              {(selected.used_for ?? []).map((tag) => (
                <Pill key={tag} label={tag} tone="info" size="sm" />
              ))}
            </View>
            <Pressable style={styles.closeButton} onPress={() => setSelected(null)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        ) : null}
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { ...m3Type.headlineMedium, fontSize: 22, color: colors.textPrimary },
  categoryRow: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.md },
  categoryPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPillActive: { backgroundColor: colors.primary700, borderColor: colors.primary700 },
  categoryPillText: { ...m3Type.labelLarge, fontSize: 13, color: colors.textSecondary },
  categoryPillTextActive: { color: colors.white, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  cardWrap: { width: '47%' },
  card: { alignItems: 'flex-start', gap: 4 },
  iconTile: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  productName: { ...m3Type.titleMedium, fontSize: 14, color: colors.textPrimary },
  productUnit: { ...m3Type.labelMedium, fontSize: 11, color: colors.neutral500 },
  productPrice: { ...m3Type.titleMediumSemiBold, color: colors.primary700, marginTop: 2 },
  modalBackdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
  },
  sheetHandle: { width: 34, height: 4, borderRadius: radius.pill, backgroundColor: colors.border, marginBottom: spacing.lg },
  iconTileLarge: {
    width: 80,
    height: 80,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  sheetName: { ...m3Type.titleLarge, color: colors.textPrimary, textAlign: 'center' },
  sheetMeta: { ...m3Type.labelLarge, color: colors.neutral500, marginTop: 2 },
  sheetDescription: { ...m3Type.labelLarge, color: colors.neutral500, textAlign: 'center', marginTop: spacing.md },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center', marginTop: spacing.lg },
  closeButton: { marginTop: spacing.xl, paddingVertical: spacing.md, paddingHorizontal: spacing.xxxl, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted },
  closeButtonText: { ...m3Type.titleMediumSemiBold, color: colors.textPrimary },
});
