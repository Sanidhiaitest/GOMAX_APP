import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { StepProgress } from '../../components/StepProgress';
import { TextField } from '../../components/TextField';
import { useApp } from '../../state/AppContext';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Birthday'>;

export function BirthdayScreen({ navigation }: Props) {
  const { completeOnboarding } = useApp();
  const [dob, setDob] = useState('');
  const [anniversary, setAnniversary] = useState('');

  const finish = () => {
    completeOnboarding();
    navigation.getParent()?.navigate('Main');
  };

  return (
    <Screen>
      <View style={styles.content}>
        <StepProgress step={3} totalSteps={3} label="Almost done!" />

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Birthday & Anniversary bonus</Text>
          <Text style={styles.bannerSubtitle}>
            Earn <Text style={styles.bannerAccent}>2x points</Text> on your special days
          </Text>
        </View>

        <View style={styles.illustration}>
          <Ionicons name="gift" size={56} color={colors.orange500} />
        </View>

        <View style={styles.fields}>
          <TextField
            label="Date of Birth"
            placeholder="DD / MM / YYYY"
            rightIcon="calendar-outline"
            value={dob}
            onChangeText={setDob}
          />
          <TextField
            label="Wedding anniversary"
            placeholder="DD / MM / YYYY"
            rightIcon="calendar-outline"
            value={anniversary}
            onChangeText={setAnniversary}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Continue" onPress={finish} />
        <Pressable onPress={finish}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: spacing.xxl, paddingTop: spacing.xl },
  banner: { alignItems: 'center' },
  bannerTitle: { ...typography.h2, color: colors.textPrimary, textAlign: 'center' },
  bannerSubtitle: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
  bannerAccent: { color: colors.orange500, fontWeight: '700' },
  illustration: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    backgroundColor: colors.orange50,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xxl,
  },
  fields: { gap: spacing.xl },
  footer: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xl, gap: spacing.lg },
  skip: { ...typography.bodyMedium, color: colors.textSecondary, textAlign: 'center' },
});
