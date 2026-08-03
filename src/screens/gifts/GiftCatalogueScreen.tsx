import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { RewardBurst, UnlockReveal } from '../../components/animations';
import { useApp } from '../../state/AppContext';
import { useGiftCatalogue, useMyGiftRedemptions } from '../../hooks/useAppData';
import { redeemGift, GiftRow } from '../../services/gifts';
import { successHaptic } from '../../utils/haptics';

const STATUS_META: Record<string, { label: string; tone: 'warning' | 'info' | 'success'; icon: keyof typeof Ionicons.glyphMap }> = {
  pending: { label: 'Pending', tone: 'warning', icon: 'hourglass-outline' },
  shipped: { label: 'Shipped', tone: 'info', icon: 'car-outline' },
  delivered: { label: 'Delivered', tone: 'success', icon: 'checkmark-circle' },
};

export function GiftCatalogueScreen() {
  const { runs, refreshProfile } = useApp();
  const { data: catalogue, reload: reloadCatalogue } = useGiftCatalogue();
  const { data: myRedemptions, reload: reloadRedemptions } = useMyGiftRedemptions();
  const [selected, setSelected] = useState<GiftRow | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [burstTrigger, setBurstTrigger] = useState(0);

  const onRedeem = async () => {
    if (!selected) return;
    setRedeeming(true);
    setError('');
    try {
      const res = await redeemGift(selected.id);
      if (!res.success) {
        if (res.error === 'insufficient_runs') setError("You don't have enough Runs for this gift.");
        else if (res.error === 'out_of_stock') setError('This gift is out of stock right now.');
        else setError('Could not redeem this gift. Try again.');
        return;
      }
      setSuccess(true);
      setBurstTrigger((n) => n + 1);
      successHaptic();
      setSelected(null);
      await Promise.all([refreshProfile(), reloadCatalogue(), reloadRedemptions()]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not redeem this gift. Try again.');
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Text style={styles.title}>Gift Catalogue</Text>
        <View style={styles.runsPill}>
          <Ionicons name="trophy" size={13} color={colors.walletRunsAccent} />
          <Text style={styles.runsPillText}>{runs} Runs</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {catalogue.map((gift) => {
            const affordable = runs >= gift.runs_cost && gift.stock > 0;
            return (
              <Pressable key={gift.id} style={styles.giftCard} onPress={() => setSelected(gift)} disabled={gift.stock === 0}>
                <View style={styles.giftIconTile}>
                  <Ionicons name="gift-outline" size={26} color={colors.walletRunsAccent} />
                </View>
                <Text style={styles.giftName} numberOfLines={2}>{gift.name}</Text>
                <View style={styles.giftCostRow}>
                  <Ionicons name="trophy" size={12} color={affordable ? colors.walletRunsAccent : colors.neutral400} />
                  <Text style={[styles.giftCost, !affordable && styles.giftCostDisabled]}>{gift.runs_cost}</Text>
                </View>
                {gift.stock === 0 ? <Pill label="Out of stock" tone="neutral" size="sm" /> : null}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Your claims</Text>
        {myRedemptions.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="gift-outline" size={32} color={colors.neutral400} />
            <Text style={styles.emptyText}>No gifts claimed yet</Text>
          </View>
        ) : (
          <View style={{ gap: spacing.md }}>
            {myRedemptions.map((r) => {
              const meta = STATUS_META[r.status] ?? STATUS_META.pending;
              return (
                <Card key={r.id} style={styles.claimRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.claimName}>{r.gift?.name ?? 'Gift'}</Text>
                    <Text style={styles.claimMeta}>{r.runs_spent} Runs · {new Date(r.requested_at).toLocaleDateString()}</Text>
                  </View>
                  <Pill label={meta.label} tone={meta.tone} icon={meta.icon} size="sm" />
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.backdrop} onPress={() => setSelected(null)} />
        <View style={styles.sheet}>
          {selected ? (
            <>
              <View style={styles.sheetIconTile}>
                <Ionicons name="gift-outline" size={32} color={colors.walletRunsAccent} />
              </View>
              <Text style={styles.sheetName}>{selected.name}</Text>
              {selected.description ? <Text style={styles.sheetDescription}>{selected.description}</Text> : null}
              <View style={styles.sheetCostRow}>
                <Ionicons name="trophy" size={16} color={colors.walletRunsAccent} />
                <Text style={styles.sheetCost}>{selected.runs_cost} Runs</Text>
              </View>
              <Button
                label={redeeming ? 'Redeeming…' : `Redeem for ${selected.runs_cost} Runs`}
                onPress={onRedeem}
                disabled={runs < selected.runs_cost || redeeming}
                roboto
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              {runs < selected.runs_cost ? <Text style={styles.hintText}>You need {selected.runs_cost - runs} more Runs.</Text> : null}
            </>
          ) : null}
        </View>
      </Modal>

      <Modal visible={success} transparent animationType="fade">
        <View style={styles.resultBackdrop}>
          <View style={styles.resultCard}>
            <RewardBurst trigger={burstTrigger} count={18} />
            <UnlockReveal visible={success} glow glowColor={colors.success}>
              <View style={styles.resultIcon}>
                <Ionicons name="checkmark" size={32} color={colors.white} />
              </View>
            </UnlockReveal>
            <Text style={styles.resultTitle}>Gift claimed!</Text>
            <Text style={styles.resultSubtitle}>We&apos;ll update the status here as it ships.</Text>
            <Button label="Done" onPress={() => setSuccess(false)} roboto />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.lg },
  title: { ...m3Type.titleLarge, color: colors.textPrimary },
  runsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(42,143,168,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(42,143,168,0.25)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  runsPillText: { ...m3Type.labelLarge, fontSize: 12, color: colors.walletRunsAccent, fontWeight: '700' },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  giftCard: {
    width: '47%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  giftIconTile: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(42,143,168,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftName: { ...m3Type.titleMedium, fontSize: 13, color: colors.textPrimary },
  giftCostRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  giftCost: { ...m3Type.labelLarge, fontSize: 13, color: colors.walletRunsAccent, fontWeight: '700' },
  giftCostDisabled: { color: colors.neutral400 },
  sectionTitle: { ...m3Type.titleMediumSemiBold, color: colors.textPrimary, marginTop: spacing.sm },
  claimRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  claimName: { ...m3Type.titleMedium, fontSize: 14, color: colors.textPrimary },
  claimMeta: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, marginTop: 2 },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl },
  emptyText: { ...m3Type.labelLarge, color: colors.neutral600 },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  sheetIconTile: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(42,143,168,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  sheetName: { ...m3Type.titleLarge, color: colors.textPrimary, textAlign: 'center' },
  sheetDescription: { ...m3Type.labelLarge, color: colors.neutral500, textAlign: 'center' },
  sheetCostRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.lg },
  sheetCost: { ...m3Type.titleMediumSemiBold, color: colors.walletRunsAccent },
  errorText: { ...m3Type.labelMedium, color: colors.danger, textAlign: 'center' },
  hintText: { ...m3Type.labelMedium, color: colors.neutral500, textAlign: 'center' },
  resultBackdrop: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  resultCard: { width: '100%', backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xxl, alignItems: 'center', gap: spacing.sm, position: 'relative', overflow: 'hidden' },
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
