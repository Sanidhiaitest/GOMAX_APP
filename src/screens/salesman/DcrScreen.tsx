import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { SelectModal } from '../../components/SelectModal';
import { useMyBeatPlan, useTodaysDcr } from '../../hooks/useSupabaseData';
import { addDcrEntry, DcrRow } from '../../services/salesman';
import { RootStackParamList } from '../../navigation/types';

const OUTCOMES: DcrRow['outcome'][] = ['Order taken', 'Payment collected', 'No order', 'Dealer closed'];

const OUTCOME_META: Record<DcrRow['outcome'], { tone: 'success' | 'info' | 'neutral' | 'danger'; icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap }> = {
  'Order taken': { tone: 'success', icon: 'receipt-outline' },
  'Payment collected': { tone: 'info', icon: 'cash-outline' },
  'No order': { tone: 'neutral', icon: 'remove-circle-outline' },
  'Dealer closed': { tone: 'danger', icon: 'close-circle-outline' },
};

export function DcrScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: beatPlan } = useMyBeatPlan();
  const { data: entries, reload } = useTodaysDcr();
  const [dealerModal, setDealerModal] = useState(false);
  const [outcomeModal, setOutcomeModal] = useState(false);
  const [dealer, setDealer] = useState('');
  const [outcome, setOutcome] = useState<DcrRow['outcome'] | ''>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = dealer.length > 0 && outcome.length > 0 && !submitting;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await addDcrEntry({ dealerName: dealer, outcome: outcome as DcrRow['outcome'], notes });
      await reload();
      setDealer('');
      setOutcome('');
      setNotes('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
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
            <Button label={submitting ? 'Logging…' : 'Log visit'} onPress={onSubmit} disabled={!canSubmit} icon={null} />
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
                  <Text style={styles.entryDealer}>{entry.dealer_name}</Text>
                  <Text style={styles.entryTime}>{new Date(entry.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <View style={{ marginTop: 4, marginBottom: entry.notes ? 4 : 0 }}>
                  <Pill
                    label={entry.outcome}
                    tone={OUTCOME_META[entry.outcome as DcrRow['outcome']].tone}
                    icon={OUTCOME_META[entry.outcome as DcrRow['outcome']].icon}
                    size="sm"
                  />
                </View>
                {entry.notes ? <Text style={styles.entryNotes}>{entry.notes}</Text> : null}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      <SelectModal
        visible={dealerModal}
        title="Select dealer"
        options={beatPlan.map((d) => d.dealer_name)}
        selected={dealer}
        onSelect={setDealer}
        onClose={() => setDealerModal(false)}
      />
      <SelectModal
        visible={outcomeModal}
        title="Select outcome"
        options={OUTCOMES}
        selected={outcome}
        onSelect={(v) => setOutcome(v as DcrRow['outcome'])}
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
  entryNotes: { ...m3Type.labelLarge, fontSize: 13, color: colors.neutral500, marginTop: 4 },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl },
  emptyText: { ...m3Type.labelLarge, color: colors.neutral600 },
});
