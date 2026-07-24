import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { useApp } from '../../state/AppContext';
import { otherApplicators } from '../../data/adminMock';

export function AdminApplicatorsScreen() {
  const { role, fullName, city, loyaltyTier, points } = useApp();

  const liveApplicator =
    role === 'mason'
      ? [{ id: 'live', name: fullName || 'You', city: city || '—', tier: loyaltyTier, scansThisMonth: 0, pointsBalance: points }]
      : [];

  const applicators = [...liveApplicator, ...otherApplicators];

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Text style={styles.title}>Applicators</Text>
        <Text style={styles.subtitle}>{applicators.length} active this month</Text>
      </View>

      <FlatList
        data={applicators}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        renderItem={({ item }) => (
          <Card style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.city} · {item.scansThisMonth} scans</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Pill label={item.tier} tone="primary" size="sm" />
              <Text style={styles.points}>{item.pointsBalance} pts</Text>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.lg },
  title: { ...m3Type.titleLarge, color: colors.textPrimary },
  subtitle: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, marginTop: 2 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
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
  meta: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, marginTop: 2 },
  points: { ...m3Type.labelMedium, fontSize: 11, color: colors.neutral500 },
});
