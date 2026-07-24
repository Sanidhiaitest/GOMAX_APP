import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { illustrations } from '../../assets/images';
import { useApp, Role } from '../../state/AppContext';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'RoleSelect'>;

const ROLES: { key: Role; title: string; subtitle: string; illustration?: number; placeholderBg: string }[] = [
  { key: 'mason', title: 'Applicator / Mason', subtitle: 'I manage GoMax dealer accounts', illustration: illustrations.roleMason, placeholderBg: '#f3cfa8' },
  { key: 'dealer', title: 'Dealer/Shop Owner', subtitle: 'I stock & sell GoMax products', illustration: illustrations.roleDealer, placeholderBg: 'rgba(222,213,200,0.3)' },
  { key: 'salesman', title: 'Salesman', subtitle: 'I manage GoMax dealer accounts', illustration: illustrations.roleSalesman, placeholderBg: 'rgba(222,213,200,0.3)' },
];

// Node 1:157 — step badge, progress line, and card states match exactly.
export function RoleSelectScreen({ navigation }: Props) {
  const { setRole } = useApp();
  const [selected, setSelected] = useState<Role | null>('mason');

  const onContinue = () => {
    if (!selected) return;
    setRole(selected);
    if (selected === 'dealer') return navigation.navigate('DealerBusinessDetails');
    if (selected === 'salesman') return navigation.navigate('SalesmanCode');
    navigation.navigate('BasicDetails');
  };

  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.stepWrap}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>1</Text>
          </View>
          <Text style={styles.stepLabel}>Who are you?</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={styles.progressDone} />
        </View>

        <Text style={styles.title}>Who are you?</Text>
        <Text style={styles.subtitle}>Choose your role to personalise your GoMax Expereince</Text>

        <View style={styles.cards}>
          {ROLES.map((role) => {
            const isSelected = selected === role.key;
            return (
              <Pressable
                key={role.key}
                onPress={() => setSelected(role.key)}
                style={[styles.card, isSelected ? styles.cardSelected : styles.cardDefault]}
              >
                <View style={[styles.avatar, { backgroundColor: role.placeholderBg }]}>
                  {/* PLACEHOLDER: illustrations.role* — see assets/README.md */}
                  {role.illustration ? (
                    <Image source={role.illustration} style={styles.avatarImage} resizeMode="contain" />
                  ) : null}
                </View>
                <View style={styles.cardText}>
                  <Text style={[styles.cardTitle, isSelected ? styles.cardTitleSelected : styles.cardTitleDefault]}>
                    {role.title}
                  </Text>
                  <Text style={[styles.cardSubtitle, isSelected ? styles.cardSubtitleSelected : styles.cardSubtitleDefault]}>
                    {role.subtitle}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Continue" onPress={onContinue} disabled={!selected} roboto />
        <Pressable onPress={() => navigation.navigate('BasicDetails')}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: 37 },
  stepWrap: { alignItems: 'center', gap: 4 },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: { color: colors.white, ...m3Type.labelSmallSemiBold },
  stepLabel: { ...m3Type.labelSmall, color: colors.secondary700 },
  progressTrack: { height: 2, backgroundColor: colors.neutral300, marginTop: -8, flexDirection: 'row' },
  progressDone: { width: 40, height: 2, backgroundColor: colors.secondary700 },
  title: { ...m3Type.headlineMedium, color: colors.secondary700, textAlign: 'center', marginTop: 74 },
  subtitle: {
    ...m3Type.labelLarge,
    color: colors.neutral500,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  cards: { gap: spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 81,
    borderWidth: 1.5,
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: colors.primary700,
    backgroundColor: colors.primary50,
    shadowColor: '#ff7043',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardDefault: { borderColor: colors.neutral200, backgroundColor: colors.white },
  avatar: {
    width: 76,
    height: 81,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { width: '100%', height: '100%' },
  cardText: { flex: 1, paddingHorizontal: spacing.lg },
  cardTitle: { ...m3Type.titleMediumSemiBold },
  cardTitleSelected: { color: colors.secondary700 },
  cardTitleDefault: { color: colors.neutral600 },
  cardSubtitle: { ...m3Type.labelSmall, marginTop: 2 },
  cardSubtitleSelected: { color: colors.secondary500 },
  cardSubtitleDefault: { color: colors.neutral400 },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.lg },
  skip: { ...m3Type.titleMediumSemiBold, color: colors.skipGray, textAlign: 'center' },
});
