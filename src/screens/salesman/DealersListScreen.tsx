import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, spacing } from '../../theme';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { beatPlan, BeatStop } from '../../data/salesmanMock';
import { RootStackParamList } from '../../navigation/types';

const STATUS_META: Record<BeatStop['status'], { label: string; tone: 'success' | 'warning' | 'neutral'; icon: keyof typeof Ionicons.glyphMap }> = {
  visited: { label: 'Visited', tone: 'success', icon: 'checkmark-circle' },
  pending: { label: 'Pending', tone: 'warning', icon: 'time-outline' },
  skipped: { label: 'Skipped', tone: 'neutral', icon: 'close-circle-outline' },
};

export function DealersListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Dealers</Text>
      </View>

      <FlatList
        data={beatPlan}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        renderItem={({ item }) => {
          const meta = STATUS_META[item.status];
          return (
            <Pressable onPress={() => navigation.navigate('DealerDetail', { dealerId: item.id })}>
              <Card style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.dealerName}</Text>
                  <Text style={styles.area}>{item.area}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Pill label={meta.label} tone={meta.tone} icon={meta.icon} size="sm" />
                  {item.outstanding > 0 ? (
                    <Text style={styles.outstanding}>₹{item.outstanding.toLocaleString('en-IN')} due</Text>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.neutral400} />
              </Card>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.lg },
  headerTitle: { ...m3Type.titleLarge, color: colors.textPrimary },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  name: { ...m3Type.titleMedium, fontSize: 15, color: colors.textPrimary },
  area: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, marginTop: 2 },
  outstanding: { ...m3Type.labelMedium, fontSize: 11, color: colors.neutral500 },
});
