import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../../theme';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { useApp } from '../../state/AppContext';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'MobileNumber'>;

// NOTE: header uses a gradient placeholder instead of the construction-site
// photography from Figma — swap in real photo assets once exported.
export function MobileNumberScreen({ navigation }: Props) {
  const { setMobileNumber } = useApp();
  const [phone, setPhone] = useState('');

  const canSubmit = phone.length === 10;

  const onSubmit = () => {
    setMobileNumber(phone);
    navigation.navigate('Otp');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={[colors.navy900, colors.navy700]} style={styles.header}>
        <Ionicons name="business" size={72} color="rgba(255,255,255,0.18)" />
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.heading}>GoMax mein</Text>
        <Text style={styles.headingAccent}>Swagat Hai! 👋</Text>

        <View style={{ marginTop: spacing.xxl }}>
          <TextField
            label="Mobile Number"
            prefix="🇮🇳 +91"
            placeholder="XXXXX-XXXXX"
            keyboardType="number-pad"
            maxLength={10}
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
          />
        </View>

        <View style={styles.spacer} />

        <Button label="OTP Bhejo" onPress={onSubmit} disabled={!canSubmit} />

        <Text style={styles.terms}>
          Join karke aap <Text style={styles.termsLink}>Terms & Conditions</Text> se agree karte hain
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  header: {
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    marginTop: -radius.xl,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
  },
  heading: { ...typography.h1, color: colors.orange500 },
  headingAccent: { ...typography.h1, color: colors.textPrimary },
  spacer: { flex: 1 },
  terms: { ...typography.caption, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.lg, marginBottom: spacing.xl },
  termsLink: { color: colors.orange500, fontWeight: '600' },
});
