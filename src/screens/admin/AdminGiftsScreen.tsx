import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { useGiftRedemptionsAdmin } from '../../hooks/useAppData';
import { updateGiftRedemptionStatus } from '../../services/admin';

type Tab = 'pending' | 'shipped' | 'delivered';
const TABS: { key: Tab; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

export function AdminGiftsScreen() {
  const [tab, setTab] = useState<Tab>('pending');
  const { data: redemptions, reload } = useGiftRedemptionsAdmin(tab);
  const [proofModalFor, setProofModalFor] = useState<string | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const advance = async (id: string, nextStatus: 'shipped' | 'delivered', withProof?: string) => {
    setSaving(true);
    try {
      await updateGiftRedemptionStatus(id, nextStatus, withProof);
      await reload();
      setProofModalFor(null);
      setProofUrl('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Text style={styles.title}>Gift Fulfilment</Text>
        <Text style={styles.subtitle}>Pending → Shipped → Delivered</Text>
      </View>

      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <Pressable key={t.key} style={[styles.tab, tab === t.key && styles.tabActive]} onPress={() => setTab(t.key)}>
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {redemptions.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="gift-outline" size={40} color={colors.neutral400} />
            <Text style={styles.emptyText}>Nothing here right now</Text>
          </View>
        ) : (
          redemptions.map((r) => (
            <Card key={r.id} style={styles.card}>
              <View style={styles.rowTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{r.user?.full_name || 'GoMax User'}</Text>
                  <Text style={styles.meta}>{r.gift?.name ?? 'Gift'} · {r.runs_spent} Runs</Text>
                  <Text style={styles.meta}>{r.user?.mobile_number ?? '—'} · {r.user?.address || 'No address on file'}</Text>
                </View>
                <Pill
                  label={r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  tone={r.status === 'delivered' ? 'success' : r.status === 'shipped' ? 'info' : 'warning'}
                  size="sm"
                />
              </View>
              {r.proof_url ? (
                <View style={styles.proofRow}>
                  <Ionicons name="attach-outline" size={14} color={colors.neutral500} />
                  <Text style={styles.proofText} numberOfLines={1}>{r.proof_url}</Text>
                </View>
              ) : null}
              {tab === 'pending' ? (
                <Button label="Mark shipped" icon="car-outline" onPress={() => setProofModalFor(r.id)} disabled={saving} />
              ) : null}
              {tab === 'shipped' ? (
                <Button label="Mark delivered" icon="checkmark-done" onPress={() => setProofModalFor(r.id)} disabled={saving} />
              ) : null}
            </Card>
          ))
        )}
      </ScrollView>

      <Modal visible={!!proofModalFor} transparent animationType="fade" onRequestClose={() => setProofModalFor(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Attach proof (optional)</Text>
            <Text style={styles.modalSubtitle}>Paste a tracking link or photo URL as proof of {tab === 'pending' ? 'shipping' : 'delivery'}.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="https://…"
              placeholderTextColor={colors.neutral400}
              value={proofUrl}
              onChangeText={setProofUrl}
              autoCapitalize="none"
            />
            <View style={styles.modalActions}>
              <View style={{ flex: 1 }}>
                <Button
                  label="Confirm"
                  onPress={() => proofModalFor && advance(proofModalFor, tab === 'pending' ? 'shipped' : 'delivered', proofUrl || undefined)}
                  disabled={saving}
                  icon={null}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button label="Cancel" variant="secondary" onPress={() => setProofModalFor(null)} icon={null} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md },
  title: { ...m3Type.titleLarge, color: colors.textPrimary },
  subtitle: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, marginTop: 2 },
  tabRow: { flexDirection: 'row', paddingHorizontal: spacing.xl, gap: spacing.sm, marginBottom: spacing.md },
  tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.pill, alignItems: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary700, borderColor: colors.primary700 },
  tabText: { ...m3Type.labelLarge, fontSize: 13, color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.md },
  card: { gap: spacing.md },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  name: { ...m3Type.titleMedium, fontSize: 14, color: colors.textPrimary },
  meta: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, marginTop: 2 },
  proofRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  proofText: { ...m3Type.labelMedium, fontSize: 11, color: colors.neutral500, flex: 1 },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxxl },
  emptyText: { ...m3Type.labelLarge, color: colors.neutral600 },
  modalBackdrop: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  modalCard: { width: '100%', backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md },
  modalTitle: { ...m3Type.titleLarge, color: colors.textPrimary },
  modalSubtitle: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500 },
  modalInput: {
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
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
});
