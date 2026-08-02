import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { useApp } from '../../state/AppContext';
import { photos } from '../../assets/images';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'MobileNumber'>;

// Node 1:101 — header gradient: linear-gradient(159.8deg, #000000 1.89%, #041F61 74.93%)
export function MobileNumberScreen({ navigation }: Props) {
  const { sendOtp } = useApp();
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = phone.length === 10 && !sending;

  const onSubmit = async () => {
    setSending(true);
    setError('');
    try {
      await sendOtp(phone);
      navigation.navigate('Otp');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send OTP. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.black, colors.gradientNavyIndigo]}
        start={{ x: 0.18, y: 0 }}
        end={{ x: 0.82, y: 1 }}
        locations={[0.019, 0.75]}
        style={styles.header}
      >
        {/* PLACEHOLDER: photos.onboardingMobileNumber — see assets/README.md */}
        {photos.onboardingMobileNumber ? (
          <Image source={photos.onboardingMobileNumber} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : null}
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.heading}>GoMax mein</Text>
        <Text style={styles.headingAccent}>Swagat Hai! 👋</Text>

        <View style={{ marginTop: 32 }}>
          <TextField
            label="MOBILE NUMBER"
            prefix="🇮🇳 +91"
            placeholder="XXXXX-XXXXX"
            keyboardType="number-pad"
            maxLength={10}
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
          />
        </View>

        <View style={styles.spacer} />

        <Button label={sending ? 'Sending…' : 'OTP Bhejo'} onPress={onSubmit} disabled={!canSubmit} roboto />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.terms}>
          Join karke aap <Text style={styles.termsLink}>Terms & Conditions</Text> se agree karte hain
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.black },
  header: { height: 360, overflow: 'hidden' },
  card: {
    flex: 1,
    marginTop: -radius.xl,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  heading: { ...m3Type.headlineLarge, color: colors.primary700 },
  headingAccent: { ...m3Type.headlineLarge, color: colors.black },
  spacer: { flex: 1 },
  errorText: { ...m3Type.labelMedium, color: colors.danger, textAlign: 'center', marginTop: spacing.sm },
  terms: { ...m3Type.labelSmall, color: colors.black, textAlign: 'center', marginTop: spacing.lg, marginBottom: spacing.xl },
  termsLink: { color: colors.primary700 },
});
