import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, m3Type, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { SelectModal } from '../../components/SelectModal';
import { CITIES, LANGUAGES } from '../../data/staticLists';
import { useApp } from '../../state/AppContext';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'BasicDetails'>;

// Node 1:197 — exact copy, spacing, and field styling from Figma.
export function BasicDetailsScreen({ navigation }: Props) {
  const { setBasicDetails } = useApp();
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [language, setLanguage] = useState('');
  const [cityModal, setCityModal] = useState(false);
  const [langModal, setLangModal] = useState(false);

  const canContinue = fullName.trim().length > 1 && city.length > 0;

  const onContinue = () => {
    setBasicDetails({ fullName, city, language: language || 'Hindi' });
    navigation.navigate('Birthday');
  };

  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.stepWrap}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>2</Text>
          </View>
          <Text style={styles.stepLabel}>About you?</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={styles.progressDone} />
          <View style={styles.progressPending} />
        </View>

        <Text style={styles.title}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>Your Basic detail</Text>

        <View style={styles.fields}>
          <TextField label="Full name *" placeholder="Ram Kumar" value={fullName} onChangeText={setFullName} />

          <Pressable onPress={() => setCityModal(true)}>
            <TextField
              label="City / District *"
              placeholder="Select city"
              variant="filled"
              leftIcon="location-outline"
              rightIcon="chevron-down"
              value={city}
              editable={false}
              pointerEvents="none"
            />
          </Pressable>

          <Pressable onPress={() => setLangModal(true)}>
            <TextField
              label="Language"
              placeholder="Select language"
              variant="filled"
              rightIcon="chevron-down"
              value={language}
              editable={false}
              pointerEvents="none"
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Continue" onPress={onContinue} disabled={!canContinue} roboto />
        <Pressable onPress={() => navigation.navigate('Birthday')}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <SelectModal
        visible={cityModal}
        title="Select your city"
        options={CITIES}
        selected={city}
        onSelect={setCity}
        onClose={() => setCityModal(false)}
      />
      <SelectModal
        visible={langModal}
        title="Select your language"
        options={LANGUAGES}
        selected={language}
        onSelect={setLanguage}
        onClose={() => setLangModal(false)}
      />
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
  progressTrack: { height: 2, flexDirection: 'row', marginTop: -8 },
  progressDone: { width: '50%', height: 2, backgroundColor: colors.secondary700 },
  progressPending: { width: '50%', height: 2, backgroundColor: colors.neutral300 },
  title: { ...m3Type.headlineMedium, color: colors.secondary700, textAlign: 'center', marginTop: 74 },
  subtitle: { ...m3Type.labelLarge, color: colors.neutral500, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xxl },
  fields: { gap: spacing.xl },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.lg },
  skip: { ...m3Type.titleMediumSemiBold, color: colors.skipGray, textAlign: 'center' },
});
