import React, { useEffect, useState } from 'react';
import { errorText } from '../../api/client';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Coins, ScanLine, Smartphone } from 'lucide-react-native';
import { c, t } from '../../theme';
import { d3 } from '../../assets';
import { Page, CenterBar } from '../../components/Layout';
import { Button } from '../../components/Button';
import { useToast } from '../../components/Toast';
import { FormField, OkNote } from '../../components/FormField';
import { saveUpi, validateUpi } from '../../api/kyc';
import { WITHDRAW_MIN, fmt, useV3 } from '../../state/Store';
import { V3ScreenProps } from '../../navigation/types';

// A3-07 Add UPI (17:17589)
export function AddUpiScreen({ navigation }: V3ScreenProps<'AddUpi'>) {
  const { patchAccount } = useV3();
  const toast = useToast();
  const [upi, setUpi] = useState('');
  const [name, setName] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setName(null);
    setError(undefined);
    if (!upi.includes('@') || upi.split('@')[1].length < 2) return;
    let live = true;
    const id = setTimeout(() => {
      validateUpi(upi).then((r) => {
        if (!live) return;
        if (r.ok) setName(r.name);
        else setError(r.error);
      });
    }, 400);
    return () => {
      live = false;
      clearTimeout(id);
    };
  }, [upi]);

  const save = async () => {
    setBusy(true);
    try {
      patchAccount({ upi: await saveUpi(upi) });
    } catch (e) {
      setError(errorText(e));
      return;
    } finally {
      setBusy(false);
    }
    toast('UPI ID saved');
    navigation.reset({ index: 1, routes: [{ name: 'Tabs' }, { name: 'PanUpiDone' }] });
  };

  return (
    <Page bg={c.surfacePage} footerBordered footer={<Button label="Save UPI" disabled={!name} loading={busy} onPress={save} />}>
      <CenterBar title="Add UPI" />
      <View style={{ gap: 14, paddingTop: 8 }}>
        <FormField
          label="UPI ID"
          required
          icon={Smartphone}
          placeholder="name@bank"
          autoCapitalize="none"
          keyboardType="email-address"
          autoFocus
          value={upi}
          onChangeText={setUpi}
          error={error}
        />
        {name ? <OkNote text={`Verified · ${name}`} /> : null}
        <Text style={[t.cap12, { color: c.textSecondary }]}>Find your UPI ID in PhonePe, Google Pay or Paytm → Profile.</Text>
      </View>
    </Page>
  );
}

// A3-08 Link PAN & UPI · done (17:17616)
export function PanUpiDoneScreen({ navigation }: V3ScreenProps<'PanUpiDone'>) {
  const { account } = useV3();
  const short = Math.max(0, WITHDRAW_MIN - account.points);
  return (
    <Page footerBordered footer={<Button label="Go to Home" onPress={() => navigation.navigate('Tabs', { screen: 'Home' })} />}>
      <View style={{ alignItems: 'center', gap: 16, paddingTop: 8 }}>
        <View style={{ height: 200, justifyContent: 'center' }}>
          <Animated.Image entering={ZoomIn.springify().damping(10)} source={d3.checkMarkButton} style={{ width: 120, height: 120 }} />
        </View>
        <Text style={styles.big}>UPI linked</Text>
        <Text style={[t.body15, { color: c.textSecondary, textAlign: 'center' }]}>
          {short > 0 ? 'You can take money out once you have 500 points.' : 'You can take your money out now.'}
        </Text>
        <View style={[styles.pill, { backgroundColor: c.primary100 }]}>
          <Coins size={14} color={c.primary700} strokeWidth={2} />
          <Text style={[t.cap12Medium, { color: c.primary700 }]}>
            {fmt(account.points)} pts now{short > 0 ? ` · ${fmt(short)} more to withdraw` : ' · ready to withdraw'}
          </Text>
        </View>
      </View>
    </Page>
  );
}

// A3-04 First coupon celebration (17:17479) — shown once after 1st valid scan.
export function FirstCouponScreen({ navigation, route }: V3ScreenProps<'FirstCoupon'>) {
  const { user, account, patchAccount } = useV3();
  useEffect(() => {
    patchAccount({ firstCouponCelebrated: true });
  }, [patchAccount]);
  const name = (user?.name ?? '').split(' ')[0];
  const value = route.params?.value ?? 0;
  const bonus = route.params?.bonus ?? 0;
  const left = Math.max(0, 10 - account.todayCoupons);
  return (
    <Page
      bg={c.surfacePage}
      scroll={false}
      footer={
        <>
          <Button label="Scan next coupon" icon={ScanLine} height={52} style={{ borderRadius: 14 }} onPress={() => navigation.navigate('Tabs', { screen: 'Scan' })} />
          <Button label="Go to Home" variant="plain" onPress={() => navigation.navigate('Tabs', { screen: 'Home' })} />
        </>
      }
    >
      <View style={styles.orb} />
      <Image source={d3.partyPopper} style={[styles.abs, { left: 10, top: 36, width: 44, height: 44 }]} />
      <Image source={d3.sparkles} style={[styles.abs, { right: 20, top: 66, width: 30, height: 30 }]} />
      <Image source={d3.coin} style={[styles.abs, { left: 20, top: 286, width: 30, height: 30 }]} />
      <Image source={d3.coin} style={[styles.abs, { right: 16, top: 256, width: 24, height: 24 }]} />
      <Image source={d3.sparkles} style={[styles.abs, { left: 50, top: 156, width: 22, height: 22 }]} />
      <View style={{ alignItems: 'center', marginTop: 106 }}>
        <View style={styles.backCard} />
        <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.coupon}>
          <Image source={d3.ticket} style={{ width: 64, height: 64 }} />
          <Text style={[t.sec13Semibold, { color: c.textSecondary }]}>1st coupon added</Text>
          <Text style={styles.plus}>+{value + bonus} pts</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <View style={[styles.pill, { backgroundColor: c.surfaceMuted }]}>
              <Text style={[t.cap12Medium, { color: c.textSecondary }]}>Coupon {value} pts</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: c.success50 }]}>
              <Text style={[t.cap12Medium, { color: c.successText }]}>🎁 Bonus +{bonus}</Text>
            </View>
          </View>
        </Animated.View>
      </View>
      <View style={styles.panel}>
        <Text style={styles.shabash}>Shabash, {name}! 🎉</Text>
        <Text style={[t.body15, { color: c.textSecondary, textAlign: 'center', width: 300 }]}>
          Your welcome bonus is added. Scan {left} more today to win a scratch card.
        </Text>
        <View style={styles.tickets}>
          {Array.from({ length: 10 }, (_, i) => (
            <View key={i} style={[styles.ticket, i < 10 - left && styles.ticketOn]}>
              {i < 10 - left ? <Text style={{ color: '#fff', fontSize: 11 }}>✓</Text> : null}
            </View>
          ))}
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'center' },
  big: { fontFamily: 'Inter_700Bold', fontSize: 26, lineHeight: 28, letterSpacing: -0.26, color: c.navyBrand, textAlign: 'center' },
  abs: { position: 'absolute' },
  orb: { position: 'absolute', right: -120, top: -124, width: 300, height: 300, borderRadius: 150, backgroundColor: c.primary100, opacity: 0.6 },
  backCard: {
    position: 'absolute',
    top: -10,
    width: 250,
    height: 214,
    borderRadius: 28,
    backgroundColor: c.primary50,
    borderWidth: 1,
    borderColor: c.border,
    transform: [{ rotate: '6deg' }],
  },
  coupon: {
    width: 270,
    alignItems: 'center',
    gap: 6,
    paddingTop: 22,
    paddingBottom: 26,
    paddingHorizontal: 16,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surfaceCard,
    shadowColor: '#0a1729',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  plus: { fontFamily: 'Inter_700Bold', fontSize: 40, lineHeight: 46, letterSpacing: -0.4, color: c.primary700 },
  panel: {
    marginTop: 'auto',
    marginBottom: 8,
    alignItems: 'center',
    gap: 8,
    paddingTop: 22,
    paddingBottom: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surfaceCard,
  },
  shabash: { fontFamily: 'Inter_700Bold', fontSize: 26, lineHeight: 28, letterSpacing: -0.26, color: c.textPrimary },
  tickets: { flexDirection: 'row', gap: 3, marginTop: 24 },
  ticket: { width: 22, height: 28, borderRadius: 5, backgroundColor: c.surfaceMuted, borderWidth: 1, borderColor: c.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  ticketOn: { backgroundColor: c.primary700, borderWidth: 0 },
});
