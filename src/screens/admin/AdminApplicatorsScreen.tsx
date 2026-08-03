import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { StatTile } from '../../components/StatTile';
import { listAllUsersDirectory, DirectoryEntry } from '../../services/admin';

const ROLE_TONE: Record<string, 'primary' | 'info' | 'success' | 'warning'> = {
  dealer: 'primary',
  contractor: 'info',
  applicator: 'success',
  admin: 'warning',
};

export function AdminApplicatorsScreen() {
  const [directory, setDirectory] = useState<DirectoryEntry[]>([]);

  useEffect(() => {
    listAllUsersDirectory().then(setDirectory);
  }, []);

  const totalPoints = directory.reduce((sum, a) => sum + a.points, 0);
  const dealers = directory.filter((d) => d.role === 'dealer').length;
  const contractors = directory.filter((d) => d.role === 'contractor').length;
  const applicators = directory.filter((d) => d.role === 'applicator').length;

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Text style={styles.title}>Hierarchy Directory</Text>
        <Text style={styles.subtitle}>{directory.length} people · {dealers} Dealers, {contractors} Contractors, {applicators} Applicators</Text>
      </View>

      <View style={styles.statGrid}>
        <StatTile icon="people-outline" value={String(directory.length)} label="Total users" />
        <StatTile
          icon="cash-outline"
          value={String(totalPoints)}
          label="Total Points held"
          iconColor={colors.secondary500}
          iconBg={colors.secondary50}
        />
      </View>

      <FlatList
        data={directory}
        keyExtractor={(a) => a.id}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        renderItem={({ item }) => (
          <Card style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(item.full_name || 'G')[0].toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.full_name || 'GoMax User'}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="call-outline" size={12} color={colors.neutral500} />
                <Text style={styles.meta}>{item.mobile_number ?? '—'}</Text>
              </View>
              {item.uplineName ? (
                <View style={styles.metaRow}>
                  <Ionicons name="arrow-up-outline" size={12} color={colors.neutral500} />
                  <Text style={styles.meta}>{item.uplineName} ({item.uplineRole})</Text>
                </View>
              ) : (
                <Text style={styles.meta}>Root of their chain</Text>
              )}
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Pill label={item.role} tone={ROLE_TONE[item.role] ?? 'neutral'} size="sm" />
              <Text style={styles.points}>{item.points} pts</Text>
              <Text style={styles.points}>{item.runs} runs</Text>
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
  statGrid: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
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
