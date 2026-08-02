import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { useApp } from '../../state/AppContext';
import { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'DealerBusinessDetails'>;

// Fields per the Distributor/Salesman/Admin spec's "New Dealer Onboarding"
// section: name, address, GST number, phone (already captured), bank
// details, photo of shop, geo-tag.
export function DealerBusinessDetailsScreen({ navigation }: Props) {
  const { setDealerBusiness } = useApp();
  const [shopName, setShopName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [address, setAddress] = useState('');
  const [geoTagged, setGeoTagged] = useState(false);
  const [bankUpi, setBankUpi] = useState('');
  const [hasShopPhoto, setHasShopPhoto] = useState(false);

  const canContinue = shopName.trim().length > 1 && address.trim().length > 1 && bankUpi.trim().length > 1;

  const onContinue = () => {
    setDealerBusiness({ shopName, gstNumber, address, bankUpi, hasShopPhoto, outstanding: 0, creditLimit: 0, dueDate: '' });
    navigation.navigate('DealerPendingApproval');
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Tell us about your shop</Text>
        <Text style={styles.subtitle}>Your salesman will use this to verify and activate your account</Text>
      </View>

      <View style={styles.fields}>
        <TextField label="Shop / Business name *" placeholder="Singh Hardware Store" value={shopName} onChangeText={setShopName} />
        <TextField label="GST Number" placeholder="e.g. 03ABCDE1234F1Z5" value={gstNumber} onChangeText={setGstNumber} autoCapitalize="characters" />
        <TextField label="Shop address *" placeholder="Shop no., street, area" value={address} onChangeText={setAddress} />

        <Pressable style={styles.tagRow} onPress={() => setGeoTagged(true)}>
          <Ionicons name={geoTagged ? 'checkmark-circle' : 'location-outline'} size={18} color={geoTagged ? colors.success : colors.primary700} />
          <Text style={[styles.tagText, geoTagged && styles.tagTextDone]}>
            {geoTagged ? 'Location captured' : 'Use current location'}
          </Text>
        </Pressable>

        <TextField label="Bank account / UPI for settlements *" placeholder="yourname@upi" value={bankUpi} onChangeText={setBankUpi} autoCapitalize="none" />

        <Pressable style={styles.tagRow} onPress={() => setHasShopPhoto(true)}>
          <Ionicons name={hasShopPhoto ? 'checkmark-circle' : 'camera-outline'} size={18} color={hasShopPhoto ? colors.success : colors.primary700} />
          <Text style={[styles.tagText, hasShopPhoto && styles.tagTextDone]}>
            {hasShopPhoto ? 'Shop photo added' : 'Add a photo of your shop'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Button label="Submit for verification" onPress={onContinue} disabled={!canContinue} roboto />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, marginBottom: spacing.xl },
  title: { ...m3Type.headlineMedium, color: colors.secondary700 },
  subtitle: { ...m3Type.labelLarge, color: colors.neutral500, marginTop: spacing.xs },
  fields: { flex: 1, paddingHorizontal: spacing.xl, gap: spacing.xl },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primary700,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  tagText: { ...m3Type.titleMedium, fontSize: 14, color: colors.primary700 },
  tagTextDone: { color: colors.success },
  footer: { paddingHorizontal: spacing.xl, paddingVertical: spacing.xl },
});
