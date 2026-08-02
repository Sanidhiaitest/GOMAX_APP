import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { PressableScale, RewardBurst, UnlockReveal } from '../../components/animations';
import { useApp } from '../../state/AppContext';
import {
  useChallenges,
  useMyChallengeProgress,
  useBadges,
  useMyUnlockedBadges,
  useLeaderboard,
} from '../../hooks/useSupabaseData';
import { claimChallenge as claimChallengeService, ChallengeRow } from '../../services/engagement';
import { RootStackParamList } from '../../navigation/types';
import { successHaptic } from '../../utils/haptics';

type Props = NativeStackScreenProps<RootStackParamList, 'Challenges'>;

type Tab = 'challenges' | 'leaderboard' | 'badges';
const TABS: { key: Tab; label: string }[] = [
  { key: 'challenges', label: 'Challenges' },
  { key: 'leaderboard', label: 'Leaderboard' },
  { key: 'badges', label: 'Badges' },
];

// Freeform hi-fi design (P1) — redesigned from the low-fi wireframe you
// shared earlier (Challenges / Leaderboard / Badges tabs).
export function ChallengesScreen({ navigation }: Props) {
  const [tab, setTab] = useState<Tab>('challenges');
  const { refreshProfile } = useApp();
  const { data: weeklyChallenges } = useChallenges();
  const { data: myProgress, reload: reloadProgress } = useMyChallengeProgress();
  const { data: badges } = useBadges();
  const { data: unlockedBadges } = useMyUnlockedBadges();
  const { data: leaderboard } = useLeaderboard();
  const [claiming, setClaiming] = useState<Record<string, boolean>>({});
  const [burstTriggers, setBurstTriggers] = useState<Record<string, number>>({});

  const progressFor = (challengeId: string) => myProgress.find((p) => p.challenge_id === challengeId);
  const unlockedBadgeIds = new Set(unlockedBadges.map((b) => b.badge_id));

  const onClaim = async (c: ChallengeRow) => {
    if (progressFor(c.id)?.completed_at || claiming[c.id]) return;
    setClaiming((prev) => ({ ...prev, [c.id]: true }));
    try {
      await claimChallengeService(c);
      setBurstTriggers((prev) => ({ ...prev, [c.id]: (prev[c.id] ?? 0) + 1 }));
      successHaptic();
      await Promise.all([reloadProgress(), refreshProfile()]);
    } finally {
      setClaiming((prev) => ({ ...prev, [c.id]: false }));
    }
  };

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Challenges</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <Pressable key={t.key} style={[styles.tab, tab === t.key && styles.tabActive]} onPress={() => setTab(t.key)}>
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.banner}>
          <Ionicons name="trophy" size={22} color={colors.primary700} />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>GoMax Hafte Ka Hero</Text>
            <Text style={styles.bannerSubtitle}>Top scorer in your region wins ₹2,000 + physical certificate</Text>
          </View>
        </Card>

        {tab === 'challenges' ? (
          <View style={{ gap: spacing.md }}>
            {weeklyChallenges.map((c) => {
              const progress = progressFor(c.id)?.progress ?? 0;
              const pct = Math.min(100, Math.round((progress / c.target) * 100));
              const done = progress >= c.target;
              const isClaimed = !!progressFor(c.id)?.completed_at;
              return (
                <Card key={c.id} style={done ? styles.challengeCardDone : undefined}>
                  <RewardBurst trigger={burstTriggers[c.id] ?? 0} count={16} />
                  <View style={styles.challengeHeaderRow}>
                    <Text style={styles.challengeTitle}>{c.title}</Text>
                    <Text style={styles.challengeReward}>{c.reward_label}</Text>
                  </View>
                  <Text style={styles.challengeSubtitle}>{c.subtitle}</Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${pct}%` }, done && styles.progressFillDone]} />
                  </View>
                  {!done ? (
                    <Text style={styles.progressLabel}>{`${progress} / ${c.target}`}</Text>
                  ) : (
                    <View style={styles.claimRow}>
                      {isClaimed ? (
                        <UnlockReveal visible={isClaimed} style={styles.claimedReveal}>
                          <Pill label="Claimed" tone="success" icon="checkmark-circle" size="sm" />
                        </UnlockReveal>
                      ) : (
                        <PressableScale style={styles.claimButton} onPress={() => onClaim(c)}>
                          <Ionicons name="gift-outline" size={13} color={colors.white} />
                          <Text style={styles.claimButtonText}>Claim reward</Text>
                        </PressableScale>
                      )}
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        ) : null}

        {tab === 'leaderboard' ? (
          <View style={{ gap: spacing.sm }}>
            {leaderboard.map((entry) => (
              <Card key={entry.rank} style={[styles.leaderRow, entry.isYou && styles.leaderRowYou]}>
                <Text style={[styles.leaderRank, entry.isYou && styles.leaderTextYou]}>#{entry.rank}</Text>
                <Text style={[styles.leaderName, entry.isYou && styles.leaderTextYou]}>{entry.name}</Text>
                <Text style={[styles.leaderScans, entry.isYou && styles.leaderTextYou]}>{entry.scans} scans</Text>
              </Card>
            ))}
          </View>
        ) : null}

        {tab === 'badges' ? (
          <View style={styles.badgeGrid}>
            {badges.map((badge) => {
              const unlocked = unlockedBadgeIds.has(badge.id);
              return (
                <Card key={badge.id} style={[styles.badgeCard, !unlocked && styles.badgeCardLocked]}>
                  <Ionicons
                    name={unlocked ? 'ribbon' : 'lock-closed-outline'}
                    size={24}
                    color={unlocked ? colors.primary700 : colors.neutral400}
                  />
                  <Text style={[styles.badgeTitle, !unlocked && styles.badgeTitleLocked]}>{badge.title}</Text>
                  <Text style={styles.badgeSubtitle}>{badge.subtitle}</Text>
                </Card>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...m3Type.titleLarge, color: colors.textPrimary },
  tabRow: { flexDirection: 'row', paddingHorizontal: spacing.xl, gap: spacing.sm, marginBottom: spacing.md },
  tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.pill, alignItems: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.primary700, borderColor: colors.primary700 },
  tabText: { ...m3Type.labelLarge, fontSize: 13, color: colors.textSecondary },
  tabTextActive: { color: colors.white },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  banner: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.orange50, borderColor: colors.orange100 },
  bannerTitle: { ...m3Type.titleMediumSemiBold, color: colors.textPrimary },
  bannerSubtitle: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, marginTop: 2 },
  challengeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  challengeTitle: { ...m3Type.titleMedium, fontSize: 15, color: colors.textPrimary, flex: 1 },
  challengeReward: { ...m3Type.labelLarge, fontSize: 12, color: colors.primary700, fontWeight: '700' },
  challengeSubtitle: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, marginTop: 2 },
  progressTrack: { height: 6, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted, marginTop: spacing.md, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary700 },
  progressFillDone: { backgroundColor: colors.success },
  progressLabel: { ...m3Type.labelMedium, fontSize: 11, color: colors.neutral500, marginTop: spacing.xs },
  challengeCardDone: { position: 'relative', overflow: 'hidden' },
  claimRow: { flexDirection: 'row', marginTop: spacing.sm },
  claimedReveal: { alignItems: 'flex-start' },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary700,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  claimButtonText: { ...m3Type.labelLarge, fontSize: 12, color: colors.white },
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  leaderRowYou: { backgroundColor: colors.orange50, borderColor: colors.primary700 },
  leaderRank: { ...m3Type.titleMediumSemiBold, width: 32, color: colors.neutral500 },
  leaderName: { ...m3Type.titleMedium, fontSize: 15, color: colors.textPrimary, flex: 1 },
  leaderScans: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500 },
  leaderTextYou: { color: colors.primary700 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  badgeCard: { width: '47%', alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.lg },
  badgeCardLocked: { opacity: 0.6 },
  badgeTitle: { ...m3Type.titleMedium, fontSize: 13, color: colors.textPrimary, textAlign: 'center' },
  badgeTitleLocked: { color: colors.neutral500 },
  badgeSubtitle: { ...m3Type.labelMedium, fontSize: 10, color: colors.neutral400, textAlign: 'center' },
});
