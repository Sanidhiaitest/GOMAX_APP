import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { StepProgress } from '../../components/StepProgress';
import { TextField } from '../../components/TextField';
import { SelectModal } from '../../components/SelectModal';
import { CITIES, LANGUAGES } from '../../data/staticLists';
import { useApp } from '../../state/AppContext';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'BasicDetails'>;

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
        <StepProgress step={2} totalSteps={3} label="About you?" />
        <Text style={styles.title}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>Your Basic detail</Text>

        <View style={styles.fields}>
          <TextField label="Full name *" placeholder="Ram Kumar" value={fullName} onChangeText={setFullName} />

          <Pressable onPress={() => setCityModal(true)}>
            <TextField
              label="City / District *"
              placeholder="Select city"
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
              rightIcon="chevron-down"
              value={language}
              editable={false}
              pointerEvents="none"
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Continue" onPress={onContinue} disabled={!canContinue} />
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
  content: { flex: 1, paddingHorizontal: spacing.xxl, paddingTop: spacing.xl },
  title: { ...typography.h1, color: colors.textPrimary, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xxl },
  fields: { gap: spacing.xl },
  footer: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xl, gap: spacing.lg },
  skip: { ...typography.bodyMedium, color: colors.textSecondary, textAlign: 'center' },
});
