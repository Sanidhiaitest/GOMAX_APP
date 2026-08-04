import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { listAllChallengesForAdmin, createChallenge, updateChallenge, ChallengeRow, ChallengeInput } from '../../services/admin';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminChallengesManage'>;

const emptyForm: ChallengeInput = { title: '', subtitle: '', target: 1, rewardRuns: 0, rewardLabel: '' };

export function AdminChallengesManageScreen({ navigation }: Props) {
  const [challenges, setChallenges] = useState<ChallengeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ChallengeInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const reload = () => {
    setLoading(true);
    listAllChallengesForAdmin()
      .then(setChallenges)
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (c: ChallengeRow) => {
    setEditingId(c.id);
    setForm({
      title: c.title,
      subtitle: c.subtitle ?? '',
      target: c.target,
      rewardRuns: c.reward_runs,
      rewardLabel: c.reward_label ?? '',
    });
    setModalOpen(true);
  };

  const onSave = async () => {
    if (!form.title.trim() || form.target <= 0) return;
    setSaving(true);
    try {
      if (editingId) await updateChallenge(editingId, form);
      else await createChallenge(form);
      setModalOpen(false);
      reload();
    } finally {
      setSaving(false);
    }
  };

  const onToggleActive = async (c: ChallengeRow) => {
    await updateChallenge(c.id, { active: !c.active });
    reload();
  };

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Challenges</Text>
        <Pressable onPress={openCreate} style={styles.addButton}>
          <Ionicons name="add" size={22} color={colors.white} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!loading && challenges.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="trophy-outline" size={40} color={colors.neutral400} />
            <Text style={styles.emptyText}>No challenges yet — tap + to add one</Text>
          </View>
        ) : (
          challenges.map((c) => (
            <Card key={c.id} style={styles.card}>
              <Pressable style={styles.cardTop} onPress={() => openEdit(c)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{c.title}</Text>
                  <Text style={styles.meta}>Target: {c.target} · Reward: +{c.reward_runs} Runs</Text>
                </View>
                <Ionicons name="create-outline" size={18} color={colors.neutral500} />
              </Pressable>
              <View style={styles.activeRow}>
                <Pill label={c.active ? 'Active' : 'Hidden'} tone={c.active ? 'success' : 'neutral'} size="sm" />
                <Switch value={c.active} onValueChange={() => onToggleActive(c)} trackColor={{ true: colors.primary700 }} />
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit challenge' : 'Add challenge'}</Text>

              <Text style={styles.fieldLabel}>TITLE</Text>
              <TextInput style={styles.input} value={form.title} onChangeText={(v) => setForm((f) => ({ ...f, title: v }))} placeholder="e.g. Scan 10 bags this week" placeholderTextColor={colors.neutral400} />

              <Text style={styles.fieldLabel}>SUBTITLE</Text>
              <TextInput style={styles.input} value={form.subtitle} onChangeText={(v) => setForm((f) => ({ ...f, subtitle: v }))} placeholder="Optional" placeholderTextColor={colors.neutral400} />

              <Text style={styles.fieldLabel}>TARGET</Text>
              <TextInput
                style={styles.input}
                value={form.target ? String(form.target) : ''}
                onChangeText={(v) => setForm((f) => ({ ...f, target: Number(v.replace(/[^0-9]/g, '')) || 0 }))}
                keyboardType="number-pad"
                placeholder="e.g. 10"
                placeholderTextColor={colors.neutral400}
              />

              <Text style={styles.fieldLabel}>REWARD (RUNS)</Text>
              <TextInput
                style={styles.input}
                value={form.rewardRuns ? String(form.rewardRuns) : ''}
                onChangeText={(v) => setForm((f) => ({ ...f, rewardRuns: Number(v.replace(/[^0-9]/g, '')) || 0 }))}
                keyboardType="number-pad"
                placeholder="e.g. 50"
                placeholderTextColor={colors.neutral400}
              />

              <Text style={styles.fieldLabel}>REWARD LABEL (SHOWN ON CARD)</Text>
              <TextInput style={styles.input} value={form.rewardLabel} onChangeText={(v) => setForm((f) => ({ ...f, rewardLabel: v }))} placeholder="e.g. +50 Runs" placeholderTextColor={colors.neutral400} />

              <View style={styles.modalActions}>
                <View style={{ flex: 1 }}>
                  <Button label={saving ? 'Saving…' : 'Save'} onPress={onSave} disabled={saving || !form.title.trim()} icon={null} />
                </View>
                <View style={{ flex: 1 }}>
                  <Button label="Cancel" variant="secondary" onPress={() => setModalOpen(false)} icon={null} />
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  addButton: { width: 40, height: 40, borderRadius: radius.pill, backgroundColor: colors.primary700, alignItems: 'center', justifyContent: 'center' },
  title: { ...m3Type.titleLarge, color: colors.textPrimary },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxxl },
  emptyText: { ...m3Type.labelLarge, color: colors.neutral600 },
  card: { gap: spacing.md },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  name: { ...m3Type.titleMedium, fontSize: 14, color: colors.textPrimary },
  meta: { ...m3Type.labelMedium, fontSize: 11, color: colors.neutral500, marginTop: 2 },
  activeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.xl },
  modalScroll: { flexGrow: 1, justifyContent: 'center' },
  modalCard: { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.sm },
  modalTitle: { ...m3Type.titleLarge, color: colors.textPrimary, marginBottom: spacing.sm },
  fieldLabel: { ...m3Type.labelSmall, color: colors.neutral500, letterSpacing: 0.5, marginTop: spacing.sm },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: colors.surfaceMuted,
    borderRadius: 8,
    height: 44,
    paddingHorizontal: spacing.lg,
    ...m3Type.titleMediumSemiBold,
    fontSize: 14,
    color: colors.neutral950,
  },
  modalActions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
});
