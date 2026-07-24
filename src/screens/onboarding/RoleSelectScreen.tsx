import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { StepProgress } from '../../components/StepProgress';
import { useApp, Role } from '../../state/AppContext';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'RoleSelect'>;

const ROLES: { key: Role; title: string; subtitle: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'mason', title: 'Applicator / Mason', subtitle: 'I apply GoMax products on site', icon: 'hammer-outline' },
  { key: 'dealer', title: 'Dealer / Shop Owner', subtitle: 'I stock & sell GoMax products', icon: 'storefront-outline' },
  { key: 'salesman', title: 'Salesman', subtitle: 'I manage GoMax dealer accounts', icon: 'briefcase-outline' },
];

export function RoleSelectScreen({ navigation }: Props) {
  const { setRole } = useApp();
  const [selected, setSelected] = useState<Role | null>(null);

  const onContinue = () => {
    if (!selected) return;
    setRole(selected);
    navigation.navigate('BasicDetails');
  };

  return (
    <Screen>
      <View style={styles.content}>
        <StepProgress step={1} totalSteps={3} label="Who are you?" />

        <Text style={styles.title}>Who are you?</Text>
        <Text style={styles.subtitle}>Choose your role to personalise your GoMax Experience</Text>

        <View style={styles.cards}>
          {ROLES.map((role) => {
            const isSelected = selected === role.key;
            return (
              <Pressable
                key={role.key}
                onPress={() => setSelected(role.key)}
                style={[styles.card, isSelected && styles.cardSelected]}
              >
                <View style={[styles.avatar, isSelected && styles.avatarSelected]}>
                  <Ionicons name={role.icon} size={28} color={isSelected ? colors.white : colors.navy700} />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{role.title}</Text>
                  <Text style={styles.cardSubtitle}>{role.subtitle}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Continue" onPress={onContinue} disabled={!selected} />
        <Pressable onPress={() => navigation.navigate('BasicDetails')}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: spacing.xxl, paddingTop: spacing.xl },
  title: { ...typography.h1, color: colors.textPrimary, textAlign: 'center' },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  cards: { gap: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  cardSelected: { borderColor: colors.orange500, backgroundColor: colors.orange50 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSelected: { backgroundColor: colors.orange500 },
  cardText: { flex: 1 },
  cardTitle: { ...typography.bodyMedium, color: colors.textPrimary, fontWeight: '700' },
  cardSubtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  footer: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xl, gap: spacing.lg },
  skip: { ...typography.bodyMedium, color: colors.textSecondary, textAlign: 'center' },
});
