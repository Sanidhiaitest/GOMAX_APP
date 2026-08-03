import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { useApp } from '../../state/AppContext';
import { photos } from '../../assets/images';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Login'>;

// Same header/card template as the old MobileNumberScreen (node 1:101) —
// gradient photo header + white rounded card underneath.
export function LoginScreen({ navigation }: Props) {
  const { logIn } = useApp();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = mobile.length === 10 && password.length > 0 && !signingIn;

  const onSubmit = async () => {
    setSigningIn(true);
    setError('');
    try {
      await logIn(mobile, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in. Try again.');
    } finally {
      setSigningIn(false);
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
        {photos.onboardingMobileNumber ? (
          <Image source={photos.onboardingMobileNumber} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : null}
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.heading}>GoMax mein</Text>
        <Text style={styles.headingAccent}>Wapas Aaiye! 👋</Text>

        <View style={{ marginTop: 32, gap: spacing.lg }}>
          <TextField
            label="MOBILE NUMBER"
            prefix="🇮🇳 +91"
            placeholder="XXXXX-XXXXX"
            keyboardType="number-pad"
            maxLength={10}
            value={mobile}
            onChangeText={(t) => setMobile(t.replace(/[^0-9]/g, ''))}
          />
          <TextField
            label="PASSWORD"
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowPassword((v) => !v)}
            rightIconAccessibilityLabel="Toggle password visibility"
          />
        </View>

        <Pressable onPress={() => navigation.navigate('ForgotPassword')} hitSlop={8}>
          <Text style={styles.forgotLink}>Password bhool gaye?</Text>
        </Pressable>

        <View style={styles.spacer} />

        <Button label={signingIn ? 'Signing in…' : 'Login'} onPress={onSubmit} disabled={!canSubmit} roboto />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable onPress={() => navigation.navigate('Signup')} hitSlop={8}>
          <Text style={styles.terms}>
            Naya account? <Text style={styles.termsLink}>Sign up karein</Text>
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.black },
  header: { height: 260, overflow: 'hidden' },
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
  forgotLink: { ...m3Type.labelMedium, color: colors.primary700, textAlign: 'right', marginTop: spacing.md },
  spacer: { flex: 1 },
  errorText: { ...m3Type.labelMedium, color: colors.danger, textAlign: 'center', marginTop: spacing.sm },
  terms: { ...m3Type.labelSmall, color: colors.black, textAlign: 'center', marginTop: spacing.lg, marginBottom: spacing.xl },
  termsLink: { color: colors.primary700 },
});
