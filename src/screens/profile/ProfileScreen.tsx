import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Rect } from 'react-native-svg';
import { colors, radius, spacing, typography } from '../../theme';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { GoMaxLogo } from '../../components/GoMaxLogo';
import { useApp } from '../../state/AppContext';
import { RootStackParamList } from '../../navigation/types';
import { dealerLedger } from '../../data/dealerMock';
import { salesmanTarget } from '../../data/salesmanMock';
import { REFERRAL_CODE } from '../engagement/ReferralScreen';
import { softHaptic } from '../../utils/haptics';

const ROLE_LABEL: Record<string, string> = {
  mason: 'Applicator / Mason',
  dealer: 'Dealer / Shop Owner',
  salesman: 'Salesman',
};

const KYC_LABEL: Record<string, { label: string; tone: 'neutral' | 'warning' | 'success' }> = {
  unverified: { label: 'Not verified', tone: 'neutral' },
  pending: { label: 'Under review', tone: 'warning' },
  verified: { label: 'Verified', tone: 'success' },
};

// Mason tier bands, purely a visual "progress within current tier" ring —
// doesn't change loyaltyTier itself, just gives the hero card something more
// premium/graphic than a flat badge to show, grounded in the real points count.
const TIER_BANDS = [
  { name: 'Bronze', min: 0, max: 500 },
  { name: 'Silver', min: 500, max: 1500 },
  { name: 'Gold', min: 1500, max: 3000 },
  { name: 'Platinum', min: 3000, max: 3000 },
];

function tierRingPct(points: number) {
  const band = TIER_BANDS.find((b) => points < b.max) ?? TIER_BANDS[TIER_BANDS.length - 1];
  if (band.max === band.min) return 100;
  return Math.min(100, Math.round(((points - band.min) / (band.max - band.min)) * 100));
}

// A deterministic-looking (seeded, not random) block pattern standing in for
// a scannable QR code — decorative only, nothing in this prototype actually
// scans it. Same idea as a real ID-card QR: a fixed grid derived from the
// member's own data, so it looks like *their* code, not a stock graphic.
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
  const {
    fullName,
    mobileNumber,
    role,
    city,
    language,
    loyaltyTier,
    points,
    kycStatus,
    dealerBusiness,
    dealerVerificationStatus,
    employeeCode,
    logout,
  } = useApp();
  const kyc = KYC_LABEL[kycStatus];

  // logout() only resets AppContext state — it never moves the navigator.
  // Without an explicit reset here, "Main" stays mounted and RoleTabRouter's
  // role === null fallback silently re-renders the Mason tabs, leaving a
  // "logged out" user stuck inside the app with no way back to onboarding.
  // Mirrors the pattern AdminDashboardScreen already uses for admin logout.
  const onLogout = () => {
    logout();
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
  };

  const memberId = `GMX${mobileNumber ? mobileNumber.slice(-6) : '000000'}`;
  const pattern = idPattern(memberId + fullName);

  const ring =
    role === 'dealer'
      ? { pct: Math.min(100, Math.round((dealerLedger.outstanding / dealerLedger.creditLimit) * 100)), icon: 'card-outline' as const, label: 'Credit used' }
      : role === 'salesman'
      ? { pct: Math.min(100, Math.round((salesmanTarget.achieved / salesmanTarget.target) * 100)), icon: 'trending-up-outline' as const, label: 'Target hit' }
      : { pct: tierRingPct(points), icon: 'star' as const, label: `${loyaltyTier} tier` };

  const idCardFields =
    role === 'dealer'
      ? [
          { label: 'Shop Name', value: dealerBusiness.shopName || '—' },
          { label: 'GST Number', value: dealerBusiness.gstNumber || '—' },
        ]
      : role === 'salesman'
      ? [
          { label: 'Employee Code', value: employeeCode || '—' },
          { label: 'Region', value: city || '—' },
        ]
      : [
          { label: 'Referral Code', value: REFERRAL_CODE },
          { label: 'City / District', value: city || '—' },
        ];

  type Shortcut = { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void };
  const shortcuts: Shortcut[] =
    role === 'dealer'
      ? [
          { icon: 'receipt-outline', label: 'Orders', onPress: () => navigation.navigate('OrdersList') },
          { icon: 'wallet-outline', label: 'Ledger', onPress: () => navigation.navigate('Ledger') },
          { icon: 'add-circle-outline', label: 'New Order', onPress: () => navigation.navigate('OrderPlacement') },
        ]
      : role === 'salesman'
      ? [
          { icon: 'people-outline', label: 'Dealers', onPress: () => navigation.navigate('DealersList') },
          { icon: 'clipboard-outline', label: 'DCR', onPress: () => navigation.navigate('Dcr') },
        ]
      : [
          { icon: 'wallet-outline', label: 'Wallet', onPress: () => navigation.getParent()?.navigate('Redeem' as never) },
          { icon: 'qr-code-outline', label: 'Scan', onPress: () => navigation.getParent()?.navigate('Scan' as never) },
          { icon: 'people-outline', label: 'Refer', onPress: () => navigation.navigate('Referral') },
          { icon: 'trophy-outline', label: 'Challenges', onPress: () => navigation.navigate('Challenges') },
        ];

  type Row = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    onPress?: () => void;
    pillTone?: 'neutral' | 'warning' | 'success';
  };

  const rows: Row[] = [
    { icon: 'call-outline', label: 'Mobile number', value: mobileNumber ? `+91 ${mobileNumber}` : '—' },
  ];

  if (role === 'dealer') {
    rows.push({
      icon: 'checkmark-done-outline',
      label: 'Verification status',
      value: dealerVerificationStatus === 'verified' ? 'Verified' : 'Pending',
      pillTone: dealerVerificationStatus === 'verified' ? 'success' : 'warning',
    });
  } else if (role !== 'salesman') {
    rows.push(
      { icon: 'language-outline', label: 'Language', value: language || '—' },
      {
        icon: 'shield-checkmark-outline',
        label: 'KYC status',
        value: kyc.label,
        onPress: () => navigation.navigate('Kyc'),
        pillTone: kyc.tone,
      }
    );
  }

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
          {rows.map((row, i) => (
            <Pressable
              key={row.label}
              onPress={row.onPress}
              style={[styles.row, i < rows.length - 1 && styles.rowBorder]}
            >
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
              {row.onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
            </Pressable>
          ))}
        </Card>

        <Pressable style={styles.logout} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
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
});
