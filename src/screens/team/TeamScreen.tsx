import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { getMyDownline, DownlineMember } from '../../services/downline';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Team'>;

const ROLE_TONE: Record<string, 'primary' | 'info' | 'success'> = {
  dealer: 'primary',
  contractor: 'info',
  applicator: 'success',
};

export function TeamScreen({ navigation }: Props) {
  const [team, setTeam] = useState<DownlineMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMyDownline()
      .then((result) => {
        if (!cancelled) setTeam(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const totalCommission = team.reduce((sum, m) => sum + m.commissionGenerated, 0);

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <View>
          <Text style={styles.title}>My Team</Text>
          <Text style={styles.subtitle}>{team.length} people in your downline</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>TOTAL COMMISSION FROM YOUR TEAM</Text>
          <Text style={styles.summaryValue}>₹{totalCommission.toLocaleString('en-IN')}</Text>
        </Card>

        {!loading && team.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={40} color={colors.neutral400} />
            <Text style={styles.emptyText}>Nobody in your downline yet</Text>
            <Text style={styles.emptySubtext}>Share your referral code to start building your team.</Text>
          </View>
        ) : (
          <View style={{ gap: spacing.md }}>
            {team.map((member) => (
              <Card key={member.id} style={styles.row}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{member.fullName[0]?.toUpperCase() ?? 'G'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{member.fullName}</Text>
                  <Text style={styles.joined}>Joined {new Date(member.joinedAt).toLocaleDateString()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Pill label={member.role} tone={ROLE_TONE[member.role] ?? 'neutral'} size="sm" />
                  <Text style={styles.commission}>₹{member.commissionGenerated.toLocaleString('en-IN')}</Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { ...m3Type.titleLarge, color: colors.textPrimary },
  subtitle: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, marginTop: 2 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  summaryCard: { backgroundColor: colors.navy800 },
  summaryLabel: { ...m3Type.labelSmall, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.6 },
  summaryValue: { ...m3Type.headlineMedium, fontSize: 26, color: colors.white, marginTop: 4 },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxxl },
  emptyText: { ...m3Type.labelLarge, color: colors.neutral600 },
  emptySubtext: { ...m3Type.labelMedium, color: colors.neutral500, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.navy800,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, ...m3Type.titleMediumSemiBold },
  name: { ...m3Type.titleMedium, fontSize: 14, color: colors.textPrimary },
  joined: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, marginTop: 2 },
  commission: { ...m3Type.labelMedium, fontSize: 12, color: colors.success, fontWeight: '700' },
});
