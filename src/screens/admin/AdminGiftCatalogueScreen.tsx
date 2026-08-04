import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { listAllGiftsForAdmin, createGift, updateGift, GiftRow, GiftInput } from '../../services/admin';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminGiftCatalogue'>;

const emptyForm: GiftInput = { name: '', description: '', runsCost: 0, stock: 0, marketValueInr: null };

export function AdminGiftCatalogueScreen({ navigation }: Props) {
  const [gifts, setGifts] = useState<GiftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GiftInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const reload = () => {
    setLoading(true);
    listAllGiftsForAdmin()
      .then(setGifts)
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (gift: GiftRow) => {
    setEditingId(gift.id);
    setForm({
      name: gift.name,
      description: gift.description ?? '',
      runsCost: gift.runs_cost,
      stock: gift.stock,
      marketValueInr: gift.market_value_inr,
    });
    setModalOpen(true);
  };

  const onSave = async () => {
    if (!form.name.trim() || form.runsCost <= 0) return;
    setSaving(true);
    try {
      if (editingId) await updateGift(editingId, form);
      else await createGift(form);
      setModalOpen(false);
      reload();
    } finally {
      setSaving(false);
    }
  };

  const onToggleActive = async (gift: GiftRow) => {
    await updateGift(gift.id, { active: !gift.active });
    reload();
  };

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Gift Catalogue</Text>
        <Pressable onPress={openCreate} style={styles.addButton}>
          <Ionicons name="add" size={22} color={colors.white} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!loading && gifts.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="gift-outline" size={40} color={colors.neutral400} />
            <Text style={styles.emptyText}>No gifts yet — tap + to add one</Text>
          </View>
        ) : (
          gifts.map((gift) => (
            <Card key={gift.id} style={styles.card}>
              <Pressable style={styles.cardTop} onPress={() => openEdit(gift)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{gift.name}</Text>
                  <Text style={styles.meta}>
                    {gift.runs_cost} Runs · Stock: {gift.stock}
                    {gift.market_value_inr ? ` · ₹${gift.market_value_inr} value` : ' · No ₹ value set (skips TDS calc)'}
                  </Text>
                </View>
                <Ionicons name="create-outline" size={18} color={colors.neutral500} />
              </Pressable>
              <View style={styles.activeRow}>
                <Pill label={gift.active ? 'Active' : 'Hidden'} tone={gift.active ? 'success' : 'neutral'} size="sm" />
                <Switch value={gift.active} onValueChange={() => onToggleActive(gift)} trackColor={{ true: colors.primary700 }} />
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit gift' : 'Add gift'}</Text>

              <Text style={styles.fieldLabel}>NAME</Text>
              <TextInput style={styles.input} value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="e.g. GoMax Cap" placeholderTextColor={colors.neutral400} />

              <Text style={styles.fieldLabel}>DESCRIPTION</Text>
              <TextInput style={styles.input} value={form.description} onChangeText={(v) => setForm((f) => ({ ...f, description: v }))} placeholder="Optional" placeholderTextColor={colors.neutral400} />

              <Text style={styles.fieldLabel}>RUNS COST</Text>
              <TextInput
                style={styles.input}
                value={form.runsCost ? String(form.runsCost) : ''}
                onChangeText={(v) => setForm((f) => ({ ...f, runsCost: Number(v.replace(/[^0-9]/g, '')) || 0 }))}
                keyboardType="number-pad"
                placeholder="e.g. 300"
                placeholderTextColor={colors.neutral400}
              />

              <Text style={styles.fieldLabel}>STOCK</Text>
              <TextInput
                style={styles.input}
                value={form.stock ? String(form.stock) : ''}
                onChangeText={(v) => setForm((f) => ({ ...f, stock: Number(v.replace(/[^0-9]/g, '')) || 0 }))}
                keyboardType="number-pad"
                placeholder="e.g. 100"
                placeholderTextColor={colors.neutral400}
              />

              <Text style={styles.fieldLabel}>₹ VALUE (FOR TAX CALC)</Text>
              <TextInput
                style={styles.input}
                value={form.marketValueInr ? String(form.marketValueInr) : ''}
                onChangeText={(v) => setForm((f) => ({ ...f, marketValueInr: v ? Number(v.replace(/[^0-9]/g, '')) : null }))}
                keyboardType="number-pad"
                placeholder="Optional — used for TDS calculation"
                placeholderTextColor={colors.neutral400}
              />

              <View style={styles.modalActions}>
                <View style={{ flex: 1 }}>
                  <Button label={saving ? 'Saving…' : 'Save'} onPress={onSave} disabled={saving || !form.name.trim()} icon={null} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button label="Cancel" variant="secondary" onPress={() => setModalOpen(false)} icon={null} />
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  addButton: { width: 40, height: 40, borderRadius: radius.pill, backgroundColor: colors.primary700, alignItems: 'center', justifyContent: 'center' },
  title: { ...m3Type.titleLarge, color: colors.textPrimary },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxxl },
  emptyText: { ...m3Type.labelLarge, color: colors.neutral600 },
  card: { gap: spacing.md },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  name: { ...m3Type.titleMedium, fontSize: 14, color: colors.textPrimary },
  meta: { ...m3Type.labelMedium, fontSize: 11, color: colors.neutral500, marginTop: 2 },
  activeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.xl },
  modalScroll: { flexGrow: 1, justifyContent: 'center' },
  modalCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.sm },
  modalTitle: { ...m3Type.titleLarge, color: colors.textPrimary, marginBottom: spacing.sm },
  fieldLabel: { ...m3Type.labelSmall, color: colors.neutral500, letterSpacing: 0.5, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: colors.surfaceMuted,
    borderRadius: 8,
    height: 44,
    paddingHorizontal: spacing.lg,
    ...m3Type.titleMediumSemiBold,
    fontSize: 14,
    color: colors.neutral950,
  },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
});
