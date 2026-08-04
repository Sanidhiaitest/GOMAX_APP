import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Rect } from 'react-native-svg';
import { colors, m3Type, radius, spacing, typography } from '../../theme';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { GoMaxLogo } from '../../components/GoMaxLogo';
import { useApp } from '../../state/AppContext';
import { updateMyProfile } from '../../services/profile';
import { getMyTier, MyTier } from '../../services/wallet';
import { RootStackParamList } from '../../navigation/types';
import { softHaptic } from '../../utils/haptics';

const ROLE_LABEL: Record<string, string> = {
  dealer: 'Dealer',
  contractor: 'Contractor',
  applicator: 'Applicator',
  admin: 'Admin',
};

// A deterministic-looking (seeded, not random) block pattern standing in for
// a scannable QR code — decorative only.
function idPattern(seed: string, grid = 7): boolean[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return Array.from({ length: grid * grid }, (_, i) => {
    h = (h * 1103515245 + 12345) >>> 0;
    return (h >> 16) % 3 !== 0;
  });
}

function RingStat({ pct, icon, label }: { pct: number; icon: keyof typeof Ionicons.glyphMap; label: string }) {
  const size = 64;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct / 100);
  return (
    <View style={styles.ringWrap}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.18)" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.orange500}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c},${c}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Ionicons name={icon} size={16} color={colors.white} />
        <Text style={styles.ringPct}>{pct}%</Text>
      </View>
      <Text style={styles.ringLabel}>{label}</Text>
    </View>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { fullName, mobileNumber, role, city, address, upiId, bankAccountNumber, points, referralCode, panNumber, refreshProfile, logOut } = useApp();
  const [panModalOpen, setPanModalOpen] = useState(false);
  const [panInput, setPanInput] = useState('');
  const [savingPan, setSavingPan] = useState(false);
  const [tier, setTier] = useState<MyTier | null>(null);

  useEffect(() => {
    getMyTier().then(setTier);
  }, []);

  const onSavePan = async () => {
    setSavingPan(true);
    try {
      await updateMyProfile({ pan_number: panInput.trim() || null });
      await refreshProfile();
      setPanModalOpen(false);
    } finally {
      setSavingPan(false);
    }
  };

  // logOut() only resets AppContext state — it never moves the navigator.
  // Without an explicit reset here, "Main" stays mounted, leaving a
  // "logged out" user stuck inside the app with no way back to onboarding.
  const onLogout = async () => {
    await logOut();
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
  };

  const memberId = `GMX${mobileNumber ? mobileNumber.slice(-6) : '000000'}`;
  const pattern = idPattern(memberId + fullName);
  const tierPct = tier?.nextTierThreshold ? Math.min(100, Math.round((tier.lifetimePoints / tier.nextTierThreshold) * 100)) : 100;
  const ring = { pct: tier ? tierPct : 0, icon: 'star' as const, label: tier?.tierName ?? '…' };

  const idCardFields = [
    { label: 'Referral Code', value: referralCode || '—' },
    { label: 'City', value: city || '—' },
  ];

  type Shortcut = { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void };
  const shortcuts: Shortcut[] = [
    { icon: 'wallet-outline', label: 'Wallet', onPress: () => navigation.getParent()?.navigate('Main' as never) },
    ...(role === 'applicator'
      ? ([{ icon: 'qr-code-outline' as const, label: 'Scan', onPress: () => navigation.getParent()?.navigate('Main' as never) }] as Shortcut[])
      : []),
    { icon: 'gift-outline', label: 'Gifts', onPress: () => navigation.getParent()?.navigate('Main' as never) },
    { icon: 'trophy-outline', label: 'Challenges', onPress: () => navigation.navigate('Challenges') },
  ];

  type Row = { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; pillTone?: 'neutral' | 'warning' | 'success'; onPress?: () => void };

  const rows: Row[] = [
    { icon: 'call-outline', label: 'Mobile number', value: mobileNumber ? `+91 ${mobileNumber}` : '—' },
    { icon: 'location-outline', label: 'Address', value: address || '—' },
    { icon: 'card-outline', label: 'UPI ID', value: upiId || '—' },
    { icon: 'business-outline', label: 'Bank account', value: bankAccountNumber ? `••••${bankAccountNumber.slice(-4)}` : '—' },
    {
      icon: 'document-text-outline',
      label: 'PAN number',
      value: panNumber || (role === 'applicator' ? 'Not added — optional, but saves you tax' : 'Not added — add it to save on tax'),
      onPress: () => {
        setPanInput(panNumber);
        setPanModalOpen(true);
      },
    },
  ];

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.navy900, colors.navy700]} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={{ flex: 1 }}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(fullName || 'G')[0].toUpperCase()}</Text>
            </View>
            <Text style={styles.heroName}>{fullName || 'GoMax User'}</Text>
            <Text style={styles.heroRole}>{role ? ROLE_LABEL[role] : 'Role not set'}</Text>
          </View>
          <RingStat pct={ring.pct} icon={ring.icon} label={ring.label} />
        </LinearGradient>

        <View style={styles.shortcutRow}>
          {shortcuts.map((s) => (
            <Pressable
              key={s.label}
              style={styles.shortcut}
              onPress={() => {
                softHaptic();
                s.onPress();
              }}
            >
              <View style={styles.shortcutIcon}>
                <Ionicons name={s.icon} size={20} color={colors.navy700} />
              </View>
              <Text style={styles.shortcutLabel}>{s.label}</Text>
            </Pressable>
          ))}
        </View>

        {tier ? (
          <Card style={styles.tierCard}>
            <View style={styles.tierHeaderRow}>
              <Text style={styles.tierName}>{tier.tierName} Tier</Text>
              <Text style={styles.tierPoints}>{tier.lifetimePoints} lifetime pts</Text>
            </View>
            {tier.perkDescription ? <Text style={styles.tierPerk}>{tier.perkDescription}</Text> : null}
            {tier.nextTierName ? (
              <>
                <View style={styles.tierBarTrack}>
                  <View style={[styles.tierBarFill, { width: `${tierPct}%` }]} />
                </View>
                <Text style={styles.tierHint}>
                  {tier.pointsToNextTier} pts to {tier.nextTierName}
                </Text>
              </>
            ) : (
              <Text style={styles.tierHint}>Top tier reached 🎉</Text>
            )}
          </Card>
        ) : null}

        <View style={styles.idCard}>
          <View style={styles.idCardHeader}>
            <Text style={styles.idCardEyebrow}>GOMAX MEMBER CARD</Text>
            <GoMaxLogo variant="mark-orange" width={20} />
          </View>
          <View style={styles.idCardBody}>
            <View style={{ flex: 1, gap: spacing.md }}>
              <Text style={styles.idMemberId}>{memberId}</Text>
              {idCardFields.map((f) => (
                <View key={f.label}>
                  <Text style={styles.idFieldLabel}>{f.label}</Text>
                  <Text style={styles.idFieldValue}>{f.value}</Text>
                </View>
              ))}
            </View>
            <View style={styles.qrChip}>
              <Svg width={56} height={56}>
                {pattern.map((on, i) => {
                  if (!on) return null;
                  const grid = 7;
                  const cell = 56 / grid;
                  const x = (i % grid) * cell;
                  const y = Math.floor(i / grid) * cell;
                  return <Rect key={i} x={x} y={y} width={cell} height={cell} fill={colors.navy800} />;
                })}
              </Svg>
            </View>
          </View>
        </View>

        <Card padded={false}>
          {rows.map((row, i) => {
            const Wrapper = row.onPress ? Pressable : View;
            return (
              <Wrapper key={row.label} style={[styles.row, i < rows.length - 1 && styles.rowBorder]} onPress={row.onPress}>
                <Ionicons name={row.icon} size={20} color={colors.textSecondary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{row.label}</Text>
                  {row.pillTone ? (
                    <View style={{ marginTop: 4 }}>
                      <Pill label={row.value} tone={row.pillTone} size="sm" />
                    </View>
                  ) : (
                    <Text style={styles.rowValue}>{row.value}</Text>
                  )}
                </View>
                {row.onPress ? <Ionicons name="chevron-forward" size={16} color={colors.neutral400} /> : null}
              </Wrapper>
            );
          })}
        </Card>

        <Pressable style={styles.logout} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={panModalOpen} transparent animationType="fade" onRequestClose={() => setPanModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>PAN number</Text>
            <Text style={styles.modalSubtitle}>
              {role === 'applicator'
                ? 'PAN dene se tax kam katega (10%, PAN ke bina 20%). Optional hai.'
                : 'Add your PAN so 10% tax applies instead of 20% once your yearly payouts cross ₹20,000.'}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="ABCDE1234F"
              placeholderTextColor={colors.neutral400}
              autoCapitalize="characters"
              value={panInput}
              onChangeText={setPanInput}
            />
            <View style={styles.modalActions}>
              <View style={{ flex: 1 }}>
                <Button label={savingPan ? 'Saving…' : 'Save'} onPress={onSavePan} disabled={savingPan} icon={null} />
              </View>
              <View style={{ flex: 1 }}>
                <Button label="Cancel" variant="secondary" onPress={() => setPanModalOpen(false)} icon={null} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xxl, paddingTop: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.xl },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { color: colors.white, ...typography.h2 },
  heroName: { ...typography.h3, color: colors.white },
  heroRole: { ...typography.caption, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  ringWrap: { width: 64, alignItems: 'center' },
  ringCenter: { position: 'absolute', top: 0, width: 64, height: 64, alignItems: 'center', justifyContent: 'center', gap: 1 },
  ringPct: { ...typography.caption, fontSize: 10, fontWeight: '700', color: colors.white },
  ringLabel: { ...typography.caption, fontSize: 9.5, color: 'rgba(255,255,255,0.6)', marginTop: 4, textAlign: 'center' },
  shortcutRow: { flexDirection: 'row', gap: spacing.sm },
  shortcut: { flex: 1, alignItems: 'center', gap: 6 },
  shortcutIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.orange50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: { ...typography.caption, fontSize: 11, color: colors.textSecondary },
  idCard: { backgroundColor: colors.navy800, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.lg },
  tierCard: { gap: spacing.sm },
  tierHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tierName: { ...typography.h3, color: colors.textPrimary },
  tierPoints: { ...typography.caption, color: colors.textSecondary },
  tierPerk: { ...typography.caption, color: colors.textSecondary },
  tierBarTrack: { height: 6, borderRadius: 3, backgroundColor: colors.surfaceMuted, overflow: 'hidden', marginTop: spacing.xs },
  tierBarFill: { height: 6, borderRadius: 3, backgroundColor: colors.orange500 },
  tierHint: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  idCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  idCardEyebrow: { ...typography.label, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.2 },
  idCardBody: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.lg },
  idMemberId: { ...typography.h3, color: colors.white, letterSpacing: 1 },
  idFieldLabel: { ...typography.caption, fontSize: 10.5, color: 'rgba(255,255,255,0.45)' },
  idFieldValue: { ...typography.bodyMedium, color: colors.white, marginTop: 1 },
  qrChip: { width: 68, height: 68, borderRadius: radius.sm, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { ...typography.caption, color: colors.textSecondary },
  rowValue: { ...typography.bodyMedium, color: colors.textPrimary, marginTop: 2 },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  logoutText: { ...typography.bodyMedium, color: colors.danger },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
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
