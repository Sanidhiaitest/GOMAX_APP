import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { useApp } from '../../state/AppContext';

const QUICK_AMOUNTS = [200, 500, 1000];
const MIN_REDEMPTION_POINTS = 50; // PRD: min redemption is ₹50, points ≈ ₹ 1:1-ish for MVP display
const AUTO_APPROVE_CEILING = 200; // PRD: auto-approved under 200 points, else 4h SLA

export function WalletScreen() {
  const { points, runs, redeemPoints } = useApp();
  const [upiId, setUpiId] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | 'all' | null>(null);
  const [success, setSuccess] = useState(false);

  const amount = selectedAmount === 'all' ? points : selectedAmount ?? 0;
  const isValidUpi = /^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId);
  const canSubmit = isValidUpi && amount >= MIN_REDEMPTION_POINTS && amount <= points;

  const onSubmit = () => {
    redeemPoints(amount);
    setSuccess(true);
    setSelectedAmount(null);
  };

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
        <Text style={styles.headerSubtitle}>Apni kamai dekho</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceRow}>
          <Card style={[styles.balanceCard, styles.pointsCard]}>
            <Text style={styles.pointsLabel}>POINTS</Text>
            <Text style={styles.pointsValue}>{points}</Text>
            <Text style={styles.pointsHint}>≈ ₹{(points * 0.165).toFixed(2)} cash value</Text>
          </Card>
          <Card style={[styles.balanceCard, styles.runsCard]}>
            <Text style={styles.runsLabel}>RUNS</Text>
            <Text style={styles.runsValue}>{runs}</Text>
            <Text style={styles.runsHint}>For gifts catalogue</Text>
          </Card>
        </View>

        <Card>
          <View style={styles.cashoutHeaderRow}>
            <Text style={styles.cashoutTitle}>Paise Nikalo</Text>
            <View style={styles.pointsPill}>
              <Text style={styles.pointsPillText}>₹ {points} pts</Text>
            </View>
          </View>

          <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={16} color={colors.orange600} />
            <Text style={styles.infoBannerText}>
              Minimum {MIN_REDEMPTION_POINTS} pts · Under {AUTO_APPROVE_CEILING} pts is instant, above that
              may take up to 4 hours · Paid to your UPI
            </Text>
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <TextField
              label="UPI ID"
              placeholder="yourname@upi"
              leftIcon="phone-portrait-outline"
              value={upiId}
              onChangeText={setUpiId}
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>SELECT POINTS</Text>
          <View style={styles.amountRow}>
            {QUICK_AMOUNTS.map((amt) => (
              <Pressable
                key={amt}
                style={[
                  styles.amountChip,
                  selectedAmount === amt && styles.amountChipSelected,
                  amt > points && styles.amountChipDisabled,
                ]}
                disabled={amt > points}
                onPress={() => setSelectedAmount(amt)}
              >
                <Text style={[styles.amountChipText, selectedAmount === amt && styles.amountChipTextSelected]}>
                  {amt}
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={[styles.amountChip, selectedAmount === 'all' && styles.amountChipSelected]}
              onPress={() => setSelectedAmount('all')}
            >
              <Text style={[styles.amountChipText, selectedAmount === 'all' && styles.amountChipTextSelected]}>
                All
              </Text>
              <Text style={styles.amountChipSub}>{points}</Text>
            </Pressable>
          </View>

          <View style={{ marginTop: spacing.xl }}>
            <Button
              label={!isValidUpi ? 'Enter UPI first' : 'Withdraw to UPI'}
              onPress={onSubmit}
              disabled={!canSubmit}
            />
          </View>
        </Card>

        <Pressable>
          <Card style={styles.giftsTeaser}>
            <Ionicons name="gift-outline" size={20} color={colors.navy700} />
            <View style={{ flex: 1 }}>
              <Text style={styles.giftsTitle}>Gifts Catalogue</Text>
              <Text style={styles.giftsSubtitle}>Spend Runs on merchandise — coming soon (P1)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Card>
        </Pressable>
      </ScrollView>

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
            <Button label="Done" onPress={() => setSuccess(false)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xxl, paddingTop: spacing.md, paddingBottom: spacing.lg },
  headerTitle: { ...typography.h2, color: colors.textPrimary },
  headerSubtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  content: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  balanceRow: { flexDirection: 'row', gap: spacing.md },
  balanceCard: { flex: 1 },
  pointsCard: { backgroundColor: colors.navy900, borderColor: colors.navy900 },
  pointsLabel: { ...typography.label, color: colors.orange500 },
  pointsValue: { ...typography.h1, color: colors.white, marginTop: spacing.xs },
  pointsHint: { ...typography.caption, color: 'rgba(255,255,255,0.6)', marginTop: spacing.xs },
  runsCard: { backgroundColor: colors.navy700, borderColor: colors.navy700 },
  runsLabel: { ...typography.label, color: '#7EC8E3' },
  runsValue: { ...typography.h1, color: colors.white, marginTop: spacing.xs },
  runsHint: { ...typography.caption, color: 'rgba(255,255,255,0.6)', marginTop: spacing.xs },
  cashoutHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cashoutTitle: { ...typography.h3, color: colors.textPrimary },
  pointsPill: { backgroundColor: colors.orange50, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill },
  pointsPillText: { ...typography.caption, color: colors.orange600, fontWeight: '600' },
  infoBanner: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.orange50,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  infoBannerText: { flex: 1, ...typography.caption, color: colors.orange600 },
  label: { ...typography.label, color: colors.textSecondary, marginTop: spacing.xl, marginBottom: spacing.sm },
  amountRow: { flexDirection: 'row', gap: spacing.sm },
  amountChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  amountChipSelected: { borderColor: colors.orange500, backgroundColor: colors.orange50 },
  amountChipDisabled: { opacity: 0.4 },
  amountChipText: { ...typography.bodyMedium, color: colors.textPrimary },
  amountChipTextSelected: { color: colors.orange600 },
  amountChipSub: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  giftsTeaser: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  giftsTitle: { ...typography.bodyMedium, color: colors.textPrimary },
  giftsSubtitle: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
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
  resultTitle: { ...typography.h3, color: colors.textPrimary },
  resultSubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
});
