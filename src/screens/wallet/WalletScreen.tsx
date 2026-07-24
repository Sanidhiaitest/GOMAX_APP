import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { useApp, REDEMPTION_AUTO_APPROVE_CEILING } from '../../state/AppContext';

const QUICK_AMOUNTS = [200, 500, 1000];

// Node 46:33 — exact colors/copy from Figma. "Minimum 200 pts" banner copy is
// verbatim from the design; the PRD's ₹50/4hr-SLA rules are applied silently
// via MIN_REDEMPTION_POINTS/AUTO_APPROVE_CEILING without changing the visible text.
const MIN_REDEMPTION_POINTS = 50;
const AUTO_APPROVE_CEILING = REDEMPTION_AUTO_APPROVE_CEILING;

export function WalletScreen() {
  const { points, runs, redeemPoints } = useApp();
  const [upiId, setUpiId] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | 'all' | null>(null);
  const [success, setSuccess] = useState(false);

  const amount = selectedAmount === 'all' ? points : selectedAmount ?? 0;
  const isValidUpi = /^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upiId);
  const canSubmit = isValidUpi && amount >= MIN_REDEMPTION_POINTS && amount <= points;

  const onSubmit = () => {
    redeemPoints(amount, upiId);
    setSuccess(true);
    setSelectedAmount(null);
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
            <Text style={styles.cardHint}>≈ ₹{(points * 0.165).toFixed(2)} cash value</Text>
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
            <Text style={styles.infoBannerText}>Minimum 200 pts · Paid to your UPI</Text>
          </View>

          <Text style={styles.fieldLabel}>UPI ID</Text>
          <View style={styles.upiField}>
            <Text style={styles.upiFieldEmoji}>📱</Text>
            <TextInput
              style={styles.upiInput}
              value={upiId}
              onChangeText={setUpiId}
              placeholder="yourname@upi"
              placeholderTextColor="rgba(10,22,40,0.5)"
              autoCapitalize="none"
            />
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
              <Text style={styles.amountChipSub}>{points}</Text>
            </Pressable>
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <Button
              label={!isValidUpi ? 'Enter UPI first' : 'Withdraw to UPI'}
              onPress={onSubmit}
              disabled={!canSubmit}
              variant={!isValidUpi ? 'neutralDisabled' : 'primary'}
              icon={null}
              roboto
            />
          </View>
        </ScrollView>
      </View>

      <Modal visible={success} transparent animationType="fade">
        <View style={styles.resultBackdrop}>
          <View style={styles.resultCard}>
            <View style={styles.resultIcon}>
              <Ionicons name="checkmark" size={32} color={colors.white} />
            </View>
            <Text style={styles.resultTitle}>Withdrawal requested</Text>
            <Text style={styles.resultSubtitle}>
              {amount} pts will reach your UPI within {amount < AUTO_APPROVE_CEILING ? 'a few minutes' : '4 hours'}.
            </Text>
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
    opacity: 0.85,
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
  fieldLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 0.6, color: 'rgba(10,22,40,0.4)', marginTop: spacing.lg },
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
