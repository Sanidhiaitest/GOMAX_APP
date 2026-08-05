import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Pill } from '../../components/Pill';
import { RewardBurst, UnlockReveal } from '../../components/animations';
import { useApp } from '../../state/AppContext';
import { useMyRedemptions, useRedeemedThisMonth } from '../../hooks/useAppData';
import {
  requestRedemption,
  MIN_REDEMPTION_POINTS,
  MAX_REDEMPTION_POINTS_PER_REQUEST,
  MAX_REDEMPTION_POINTS_PER_MONTH,
} from '../../services/wallet';
import { successHaptic } from '../../utils/haptics';

const QUICK_AMOUNTS = [500, 1000, 2500];

const REDEMPTION_STATUS_META: Record<
  string,
  { tone: 'warning' | 'success' | 'danger'; icon: keyof typeof Ionicons.glyphMap; label: string }
> = {
  pending: { tone: 'warning', icon: 'hourglass-outline', label: 'Pending' },
  approved: { tone: 'success', icon: 'checkmark-circle', label: 'Approved' },
  paid: { tone: 'success', icon: 'checkmark-done-circle', label: 'Paid' },
  rejected: { tone: 'danger', icon: 'close-circle', label: 'Rejected' },
};

function maskUpi(upiId: string) {
  if (upiId.length <= 4) return upiId;
  return '•'.repeat(upiId.length - 4) + upiId.slice(-4);
}

export function WalletScreen() {
  const navigation = useNavigation();
  const { points, runs, upiId, refreshProfile } = useApp();
  const { data: myRedemptions, reload: reloadRedemptions } = useMyRedemptions();
  const { data: redeemedThisMonth, reload: reloadMonthTotal } = useRedeemedThisMonth();
  const [selectedAmount, setSelectedAmount] = useState<number | 'all' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [burstTrigger, setBurstTrigger] = useState(0);

  useEffect(() => {
    if (success) {
      setBurstTrigger((n) => n + 1);
      successHaptic();
    }
  }, [success]);

  const remainingThisMonth = Math.max(0, MAX_REDEMPTION_POINTS_PER_MONTH - redeemedThisMonth);
  const amountRaw = selectedAmount === 'all' ? Math.min(points, MAX_REDEMPTION_POINTS_PER_REQUEST) : selectedAmount ?? 0;
  const amount = amountRaw;
  const hasPayoutMethod = upiId.length > 0;
  const canSubmit =
    hasPayoutMethod &&
    amount >= MIN_REDEMPTION_POINTS &&
    amount <= MAX_REDEMPTION_POINTS_PER_REQUEST &&
    amount <= points &&
    amount <= remainingThisMonth &&
    !submitting;

  const onSubmit = async () => {
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await requestRedemption(amount);
      if (!res.success) {
        if (res.error === 'monthly_limit_exceeded') {
          setErrorMsg(`Only ₹${res.remainingThisMonth ?? remainingThisMonth} left of your ₹15,000 monthly limit.`);
        } else if (res.error === 'insufficient_balance') {
          setErrorMsg("You don't have enough Points for that.");
        } else {
          setErrorMsg('Could not submit request. Try again.');
        }
        return;
      }
      setSuccess(true);
      setSelectedAmount(null);
      await Promise.all([refreshProfile(), reloadRedemptions(), reloadMonthTotal()]);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Could not submit request. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={[colors.black, colors.gradientNavyDeep]} style={styles.topGradient} />
      <View style={styles.darkBody}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wallet</Text>
          <Text style={styles.headerSubtitle}>Apni kamai dekho</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow}>
          <View style={styles.pointsCard}>
            <Text style={styles.pointsLabel}>POINTS</Text>
            <View style={styles.cardValueRow}>
              <Text style={styles.pointsValue}>{points}</Text>
              <Text style={styles.cardUnit}>pts</Text>
            </View>
            <Text style={styles.cardHint}>₹{points.toLocaleString('en-IN')} redeemable to UPI</Text>
            <View style={styles.cardCta}>
              <Text style={styles.cardCtaText}>Paise Nikalo</Text>
            </View>
          </View>

          <View style={styles.runsCard}>
            <Text style={styles.runsLabel}>RUNS</Text>
            <View style={styles.cardValueRow}>
              <Text style={styles.pointsValue}>{runs}</Text>
              <Text style={styles.cardUnit}>runs</Text>
            </View>
            <Text style={styles.cardHint}>Via spin, referrals & challenges</Text>
            <View style={[styles.cardCta, styles.runsCta]}>
              <Text style={styles.cardCtaText}>Gift Lo</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.dots}>
          <View style={styles.dotActive} />
          <View style={styles.dotInactive} />
        </View>
      </View>

      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
          <View style={styles.sheetHeaderRow}>
            <Text style={styles.sheetTitle}>Paise Nikalo</Text>
            <View style={styles.pointsPill}>
              <Text style={styles.pointsPillText}>₹ {points} pts</Text>
            </View>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerEmoji}>ℹ️</Text>
            <Text style={styles.infoBannerText}>
              Min ₹{MIN_REDEMPTION_POINTS} · Max ₹{MAX_REDEMPTION_POINTS_PER_REQUEST}/request · ₹{remainingThisMonth} left this month
            </Text>
          </View>

          <Text style={styles.fieldLabel}>PAYOUT TO</Text>
          <View style={styles.upiField}>
            <Text style={styles.upiFieldEmoji}>📱</Text>
            <Text style={styles.upiInput}>{upiId || 'Add a UPI ID / bank account in your Profile'}</Text>
          </View>

          <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>SELECT POINTS</Text>
          <View style={styles.amountRow}>
            {QUICK_AMOUNTS.map((amt) => (
              <Pressable
                key={amt}
                style={[styles.amountChip, selectedAmount === amt && styles.amountChipSelected, amt > points && styles.amountChipDisabled]}
                disabled={amt > points}
                onPress={() => setSelectedAmount(amt)}
              >
                <Text style={styles.amountChipText}>{amt}</Text>
              </Pressable>
            ))}
            <Pressable style={[styles.amountChip, selectedAmount === 'all' && styles.amountChipSelected]} onPress={() => setSelectedAmount('all')}>
              <Text style={styles.amountChipText}>All</Text>
              <Text style={styles.amountChipSub}>{Math.min(points, MAX_REDEMPTION_POINTS_PER_REQUEST)}</Text>
            </Pressable>
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <Button
              label={!hasPayoutMethod ? 'Add UPI in Profile first' : submitting ? 'Submitting…' : 'Withdraw to UPI'}
              onPress={onSubmit}
              disabled={!canSubmit}
              variant={!hasPayoutMethod ? 'neutralDisabled' : 'primary'}
              icon={null}
              roboto
            />
            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
          </View>

          <View style={styles.historyHeaderRow}>
            <Text style={[styles.fieldLabel, { marginTop: spacing.xl }]}>REDEMPTION HISTORY</Text>
            <Pressable onPress={() => navigation.getParent()?.navigate('Ledger' as never)}>
              <Text style={styles.fullLedgerLink}>Full ledger →</Text>
            </Pressable>
          </View>
          {myRedemptions.length === 0 ? (
            <View style={styles.historyEmpty}>
              <Ionicons name="time-outline" size={32} color="rgba(10,22,40,0.25)" />
              <Text style={styles.historyEmptyText}>No redemption requests yet</Text>
              <Text style={styles.historyEmptySubtext}>Your withdrawal requests will show up here</Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {myRedemptions.map((r) => {
                const meta = REDEMPTION_STATUS_META[r.status] ?? REDEMPTION_STATUS_META.pending;
                return (
                  <View key={r.id} style={styles.historyRow}>
                    <View style={styles.historyIcon}>
                      <Ionicons name="cash-outline" size={16} color={colors.walletPointsAccent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyAmount}>₹{Number(r.amount).toLocaleString('en-IN')} pts</Text>
                      <Text style={styles.historyMeta}>
                        {r.upi_id ? maskUpi(r.upi_id) : 'Bank transfer'} · {new Date(r.requested_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <Pill label={meta.label} tone={meta.tone} icon={meta.icon} size="sm" />
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>

      <Modal visible={success} transparent animationType="fade">
        <View style={styles.resultBackdrop}>
          <View style={styles.resultCard}>
            <RewardBurst trigger={burstTrigger} count={18} />
            <UnlockReveal visible={success} glow glowColor={colors.success}>
              <View style={styles.resultIcon}>
                <Ionicons name="checkmark" size={32} color={colors.white} />
              </View>
            </UnlockReveal>
            <Text style={styles.resultTitle}>Withdrawal requested</Text>
            <Text style={styles.resultSubtitle}>Your request is with our team and will reach your UPI soon.</Text>
            <Button label="Done" onPress={() => setSuccess(false)} roboto />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.walletBg },
  topGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 260 },
  darkBody: { backgroundColor: colors.walletBg, paddingTop: 56, paddingBottom: 10 },
  header: { paddingHorizontal: spacing.xl, paddingBottom: 14 },
  headerTitle: { ...m3Type.headlineMedium, fontSize: 22, lineHeight: 26, color: colors.white },
  headerSubtitle: { ...m3Type.labelLarge, fontSize: 13, color: 'rgba(255,255,255,0.32)', marginTop: 2 },
  cardsRow: { paddingHorizontal: spacing.xl, gap: spacing.md },
  pointsCard: {
    width: 300,
    backgroundColor: colors.walletCard,
    borderWidth: 1.5,
    borderColor: colors.walletPointsAccent,
    borderRadius: 22,
    padding: spacing.xl,
  },
  runsCard: {
    width: 300,
    backgroundColor: colors.walletCard,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 22,
    padding: spacing.xl,
    opacity: 0.5,
  },
  pointsLabel: { ...m3Type.labelSmall, fontSize: 10, letterSpacing: 1.9, color: colors.walletPointsAccent },
  runsLabel: { ...m3Type.labelSmall, fontSize: 10, letterSpacing: 1.9, color: colors.walletRunsAccent },
  cardValueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: spacing.md },
  pointsValue: { fontFamily: 'Inter_700Bold', fontSize: 40, color: colors.white },
  cardUnit: { ...m3Type.labelLarge, color: 'rgba(255,255,255,0.38)', marginBottom: 6 },
  cardHint: { ...m3Type.labelMedium, fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: spacing.sm },
  cardCta: {
    backgroundColor: colors.walletPointsAccent,
    borderRadius: 13,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  runsCta: { backgroundColor: colors.walletRunsAccent },
  cardCtaText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: colors.white },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.sm },
  dotActive: { width: 18, height: 6, borderRadius: radius.pill, backgroundColor: colors.walletPointsAccent },
  dotInactive: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  sheet: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    marginTop: 10,
  },
  sheetHandle: {
    width: 34,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(10,22,40,0.1)',
    alignSelf: 'center',
    marginTop: 10,
  },
  sheetContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxxl },
  sheetHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  sheetTitle: { fontFamily: 'Inter_700Bold', fontSize: 15, color: colors.walletBg },
  pointsPill: {
    backgroundColor: 'rgba(193,68,14,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(193,68,14,0.16)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  pointsPillText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: colors.walletPointsAccent },
  divider: { height: 1, backgroundColor: 'rgba(10,22,40,0.06)', marginVertical: spacing.sm },
  infoBanner: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    backgroundColor: 'rgba(193,68,14,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(193,68,14,0.15)',
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  infoBannerEmoji: { fontSize: 14 },
  infoBannerText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.walletPointsAccent },
  errorText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.danger, marginTop: spacing.sm, textAlign: 'center' },
  fieldLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 0.6, color: 'rgba(10,22,40,0.4)', marginTop: spacing.lg },
  historyHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fullLedgerLink: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.walletPointsAccent, marginTop: spacing.lg },
  upiField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(10,22,40,0.03)',
    borderWidth: 1.5,
    borderColor: 'rgba(10,22,40,0.1)',
    borderRadius: 13,
    height: 46,
    paddingHorizontal: 14,
    marginTop: spacing.sm,
  },
  upiFieldEmoji: { fontSize: 14 },
  upiInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.walletBg, padding: 0 },
  amountRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  amountChip: {
    flex: 1,
    backgroundColor: 'rgba(10,22,40,0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(10,22,40,0.1)',
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  amountChipSelected: { borderColor: colors.walletPointsAccent, backgroundColor: 'rgba(193,68,14,0.06)' },
  amountChipDisabled: { opacity: 0.3 },
  amountChipText: { fontFamily: 'Inter_700Bold', fontSize: 13, color: colors.walletBg },
  amountChipSub: { fontFamily: 'Inter_500Medium', fontSize: 9, color: 'rgba(10,22,40,0.35)', marginTop: 2 },
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
  historyList: { gap: spacing.sm, marginTop: spacing.sm },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(10,22,40,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(10,22,40,0.08)',
    borderRadius: 13,
    padding: spacing.md,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(193,68,14,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyAmount: { fontFamily: 'Inter_700Bold', fontSize: 13, color: colors.walletBg },
  historyMeta: { fontFamily: 'Inter_500Medium', fontSize: 11, color: 'rgba(10,22,40,0.4)', marginTop: 2 },
  historyEmpty: { alignItems: 'center', gap: 4, paddingVertical: spacing.xl },
  historyEmptyText: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: 'rgba(10,22,40,0.45)', marginTop: spacing.xs },
  historyEmptySubtext: { fontFamily: 'Inter_400Regular', fontSize: 11, color: 'rgba(10,22,40,0.3)' },
});
