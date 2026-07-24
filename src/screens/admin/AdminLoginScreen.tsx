import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { GoMaxLogo } from '../../components/GoMaxLogo';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { useApp } from '../../state/AppContext';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminLogin'>;

// Separate portal for GoMax HQ — per the PRD, the admin persona is
// desktop/dashboard-comfortable staff (marketing, sales ops, finance),
// not one of the three field-facing roles, so this never goes through the
// mason/dealer/salesman onboarding flow.
export function AdminLoginScreen({ navigation }: Props) {
  const { adminLogin } = useApp();
  const [id, setId] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const onLogin = () => {
    setLoading(true);
    setTimeout(() => {
      adminLogin();
      navigation.replace('AdminMain');
    }, 700);
  };

  return (
    <Screen backgroundColor={colors.secondary800} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.content}>
        <GoMaxLogo variant="mark-orange" width={64} />
        <Text style={styles.title}>GoMax HQ</Text>
        <Text style={styles.subtitle}>Admin & operations dashboard</Text>

        <View style={styles.card}>
          <TextField label="Admin ID" placeholder="admin@gomax.in" value={id} onChangeText={setId} autoCapitalize="none" />
          <View style={{ height: spacing.lg }} />
          <TextField label="PIN" placeholder="••••" value={pin} onChangeText={setPin} secureTextEntry keyboardType="number-pad" />
          <View style={{ height: spacing.xl }} />
          <Button
            label={loading ? 'Signing in…' : 'Sign in'}
            onPress={onLogin}
            disabled={id.length < 2 || pin.length < 2 || loading}
            loading={loading}
            icon={null}
          />
        </View>

        <View style={styles.footerNote}>
          <Ionicons name="shield-checkmark-outline" size={14} color="rgba(255,255,255,0.5)" />
          <Text style={styles.footerText}>Internal staff only</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.sm },
  title: { ...m3Type.headlineMedium, color: colors.white, marginTop: spacing.md },
  subtitle: { ...m3Type.labelLarge, color: 'rgba(255,255,255,0.6)', marginBottom: spacing.xl },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  footerNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.xl },
  footerText: { ...m3Type.labelMedium, color: 'rgba(255,255,255,0.5)' },
});
