import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { useApp } from '../../state/AppContext';
import { RootStackParamList } from '../../navigation/types';

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

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    fullName,
    mobileNumber,
    role,
    city,
    language,
    loyaltyTier,
    kycStatus,
    dealerBusiness,
    dealerVerificationStatus,
    employeeCode,
    logout,
  } = useApp();
  const kyc = KYC_LABEL[kycStatus];

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
    rows.push(
      { icon: 'storefront-outline', label: 'Shop name', value: dealerBusiness.shopName || '—' },
      { icon: 'document-text-outline', label: 'GST number', value: dealerBusiness.gstNumber || '—' },
      {
        icon: 'checkmark-done-outline',
        label: 'Verification status',
        value: dealerVerificationStatus === 'verified' ? 'Verified' : 'Pending',
        pillTone: dealerVerificationStatus === 'verified' ? 'success' : 'warning',
      }
    );
  } else if (role === 'salesman') {
    rows.push({ icon: 'id-card-outline', label: 'Employee code', value: employeeCode || '—' });
  } else {
    rows.push(
      { icon: 'location-outline', label: 'City / District', value: city || '—' },
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
        <View style={styles.identityCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(fullName || 'G')[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{fullName || 'GoMax User'}</Text>
          <Text style={styles.role}>{role ? ROLE_LABEL[role] : 'Role not set'}</Text>
          <View style={styles.tierBadge}>
            <Ionicons name="star" size={12} color={colors.orange500} />
            <Text style={styles.tierText}>{loyaltyTier} Tier</Text>
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

        <Pressable style={styles.logout} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.xxl, paddingTop: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.xl },
  identityCard: { alignItems: 'center', gap: spacing.xs },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.navy800,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { color: colors.white, ...typography.h1 },
  name: { ...typography.h2, color: colors.textPrimary },
  role: { ...typography.body, color: colors.textSecondary },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
    backgroundColor: colors.orange50,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  tierText: { ...typography.caption, color: colors.orange600, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { ...typography.caption, color: colors.textMuted },
  rowValue: { ...typography.bodyMedium, color: colors.textPrimary, marginTop: 2 },
  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  logoutText: { ...typography.bodyMedium, color: colors.danger },
});
