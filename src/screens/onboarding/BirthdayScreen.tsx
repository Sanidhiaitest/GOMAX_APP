import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { illustrations } from '../../assets/images';
import { useApp } from '../../state/AppContext';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Birthday'>;

// Node 1:233 — exact copy, spacing, and field styling from Figma.
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
        <View style={styles.stepWrap}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>3</Text>
          </View>
          <Text style={styles.stepLabel}>Almost done!</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={styles.progressDone} />
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Birthday &{'\n'}Anniversary bonus</Text>
          <Text style={styles.bannerSubtitle}>
            Earn <Text style={styles.bannerAccent}>2x points</Text> on your special days
          </Text>
        </View>

        <View style={styles.illustration}>
          {/* PLACEHOLDER: illustrations.birthdayCouple — see assets/README.md */}
          {illustrations.birthdayCouple ? (
            <Image source={illustrations.birthdayCouple} style={styles.illustrationImage} resizeMode="contain" />
          ) : (
            <Ionicons name="gift" size={56} color={colors.primary700} />
          )}
        </View>

        <View style={styles.fields}>
          <TextField
            label="Date of Birth"
            placeholder="DD / MM / YYYY"
            variant="filled"
            rightIcon="calendar-outline"
            value={dob}
            onChangeText={setDob}
          />
          <TextField
            label="Wedding anniversary"
            placeholder="DD / MM / YYYY"
            variant="filled"
            rightIcon="calendar-outline"
            value={anniversary}
            onChangeText={setAnniversary}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="Continue" onPress={finish} roboto />
        <Pressable onPress={finish}>
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
  progressTrack: { height: 2, flexDirection: 'row', marginTop: -8 },
  progressDone: { width: '50%', height: 2, backgroundColor: colors.secondary700 },
  banner: { alignItems: 'center', marginTop: 74 },
  bannerTitle: { ...m3Type.headlineMedium, color: colors.secondary700, textAlign: 'center' },
  bannerSubtitle: { ...m3Type.labelLarge, color: colors.neutral500, textAlign: 'center', marginTop: spacing.xs },
  bannerAccent: { color: colors.primary600 },
  illustration: {
    alignSelf: 'center',
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xxl,
  },
  illustrationImage: { width: '100%', height: '100%' },
  fields: { gap: spacing.xl },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.lg },
  skip: { ...m3Type.titleMediumSemiBold, color: colors.skipGray, textAlign: 'center' },
});
