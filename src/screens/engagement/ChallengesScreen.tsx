import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { badges, leaderboard, weeklyChallenges } from '../../data/challengesMock';
import { RootStackParamList } from '../../navigation/types';

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
              const pct = Math.min(100, Math.round((c.progress / c.target) * 100));
              const done = c.progress >= c.target;
              return (
                <Card key={c.id}>
                  <View style={styles.challengeHeaderRow}>
                    <Text style={styles.challengeTitle}>{c.title}</Text>
                    <Text style={styles.challengeReward}>{c.reward}</Text>
                  </View>
                  <Text style={styles.challengeSubtitle}>{c.subtitle}</Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${pct}%` }, done && styles.progressFillDone]} />
                  </View>
                  <Text style={styles.progressLabel}>
                    {done ? 'Completed' : `${c.progress} / ${c.target}`}
                  </Text>
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
            {badges.map((badge) => (
              <Card key={badge.id} style={[styles.badgeCard, !badge.unlocked && styles.badgeCardLocked]}>
                <Ionicons
                  name={badge.unlocked ? 'ribbon' : 'lock-closed-outline'}
                  size={24}
                  color={badge.unlocked ? colors.primary700 : colors.neutral400}
                />
                <Text style={[styles.badgeTitle, !badge.unlocked && styles.badgeTitleLocked]}>{badge.title}</Text>
                <Text style={styles.badgeSubtitle}>{badge.subtitle}</Text>
              </Card>
            ))}
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
