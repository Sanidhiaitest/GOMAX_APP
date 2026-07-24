import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { SelectModal } from '../../components/SelectModal';
import { beatPlan, DcrEntry, todaysDcrEntries } from '../../data/salesmanMock';
import { RootStackParamList } from '../../navigation/types';

const OUTCOMES: DcrEntry['outcome'][] = ['Order taken', 'Payment collected', 'No order', 'Dealer closed'];

export function DcrScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [entries, setEntries] = useState<DcrEntry[]>(todaysDcrEntries);
  const [dealerModal, setDealerModal] = useState(false);
  const [outcomeModal, setOutcomeModal] = useState(false);
  const [dealer, setDealer] = useState('');
  const [outcome, setOutcome] = useState<DcrEntry['outcome'] | ''>('');
  const [notes, setNotes] = useState('');

  const canSubmit = dealer.length > 0 && outcome.length > 0;

  const onSubmit = () => {
    if (!canSubmit) return;
    setEntries((prev) => [
      { id: String(Date.now()), dealerName: dealer, time: 'Just now', outcome: outcome as DcrEntry['outcome'], notes },
      ...prev,
    ]);
    setDealer('');
    setOutcome('');
    setNotes('');
  };

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Daily Call Report</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card>
          <Text style={styles.formTitle}>Log a visit</Text>

          <Text style={styles.label}>Dealer</Text>
          <Pressable style={styles.selectField} onPress={() => setDealerModal(true)}>
            <Text style={[styles.selectFieldText, !dealer && styles.placeholder]}>{dealer || 'Select dealer'}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.neutral500} />
          </Pressable>

          <Text style={styles.label}>Outcome</Text>
          <Pressable style={styles.selectField} onPress={() => setOutcomeModal(true)}>
            <Text style={[styles.selectFieldText, !outcome && styles.placeholder]}>{outcome || 'Select outcome'}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.neutral500} />
          </Pressable>

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            multiline
            placeholder="What happened at this visit?"
            placeholderTextColor={colors.neutral400}
            value={notes}
            onChangeText={setNotes}
          />

          <View style={{ marginTop: spacing.lg }}>
            <Button label="Log visit" onPress={onSubmit} disabled={!canSubmit} icon={null} />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Today&apos;s visits ({entries.length})</Text>
        {entries.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={32} color={colors.neutral400} />
            <Text style={styles.emptyText}>No visits logged yet today</Text>
          </View>
        ) : (
          <View style={{ gap: spacing.md }}>
            {entries.map((entry) => (
              <Card key={entry.id}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryDealer}>{entry.dealerName}</Text>
                  <Text style={styles.entryTime}>{entry.time}</Text>
                </View>
                <Text style={styles.entryOutcome}>{entry.outcome}</Text>
                {entry.notes ? <Text style={styles.entryNotes}>{entry.notes}</Text> : null}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      <SelectModal
        visible={dealerModal}
        title="Select dealer"
        options={beatPlan.map((d) => d.dealerName)}
        selected={dealer}
        onSelect={setDealer}
        onClose={() => setDealerModal(false)}
      />
      <SelectModal
        visible={outcomeModal}
        title="Select outcome"
        options={OUTCOMES}
        selected={outcome}
        onSelect={(v) => setOutcome(v as DcrEntry['outcome'])}
        onClose={() => setOutcomeModal(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...m3Type.titleLarge, color: colors.textPrimary },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  formTitle: { ...m3Type.titleMediumSemiBold, color: colors.textPrimary, marginBottom: spacing.sm },
  label: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, marginTop: spacing.md, marginBottom: spacing.xs },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: 10,
    height: 44,
    paddingHorizontal: spacing.md,
  },
  selectFieldText: { ...m3Type.titleMedium, fontSize: 14, color: colors.neutral950 },
  placeholder: { color: colors.neutral400 },
  notesInput: {
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: colors.neutral200,
    borderRadius: 10,
    minHeight: 72,
    padding: spacing.md,
    ...m3Type.titleMedium,
    fontSize: 14,
    color: colors.neutral950,
    textAlignVertical: 'top',
  },
  sectionTitle: { ...m3Type.titleMediumSemiBold, color: colors.textPrimary },
  entryHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  entryDealer: { ...m3Type.titleMedium, fontSize: 15, color: colors.textPrimary },
  entryTime: { ...m3Type.labelMedium, color: colors.neutral500 },
  entryOutcome: { ...m3Type.labelLarge, fontSize: 13, color: colors.primary700, fontWeight: '600', marginTop: 4 },
  entryNotes: { ...m3Type.labelLarge, fontSize: 13, color: colors.neutral500, marginTop: 4 },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl },
  emptyText: { ...m3Type.labelLarge, color: colors.neutral400 },
});
