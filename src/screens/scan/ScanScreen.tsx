import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { PressableScale } from '../../components/animations';
import { useApp } from '../../state/AppContext';
import { scanCoupon } from '../../services/coupon';
import { useMyScans } from '../../hooks/useAppData';

const FRAME_SIZE = 260;

// The moving scan-line from Figma node 41:1128/41:1200 — a glowing bar that
// sweeps top-to-bottom inside the frame while actively scanning.
function ScanLine({ active }: { active: boolean }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (active) {
      progress.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }), -1, true);
    } else {
      progress.value = 0;
    }
  }, [active, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: progress.value * (FRAME_SIZE - 24) }],
    opacity: active ? 1 : 0,
  }));

  return (
    <Animated.View style={[styles.scanLine, style]}>
      <LinearGradient
        colors={['transparent', colors.primary700, colors.scanButtonGradientEnd, colors.primary700, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid_code: "That code doesn't exist. Check the QR and try again.",
  already_used: 'This coupon has already been scanned.',
  not_an_applicator: 'Only Applicators can scan coupons.',
};

// Node 41:1262 — exact gradient, header pills, scan frame, and bottom sheet.
export function ScanScreen() {
  const insets = useSafeAreaInsets();
  const { refreshProfile } = useApp();
  const { data: scanHistory, reload: reloadScans } = useMyScans();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [tab, setTab] = useState<'scan' | 'history'>('scan');
  const [code, setCode] = useState('');
  const [locked, setLocked] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ ok: true; points: number } | { ok: false; message: string } | null>(null);

  const submitCode = async (scannedCode: string) => {
    if (locked || !scannedCode) return;
    setLocked(true);
    setScanning(true);
    try {
      const res = await scanCoupon(scannedCode);
      if (res.success) {
        setResult({ ok: true, points: res.pointsAwarded });
        await Promise.all([refreshProfile(), reloadScans()]);
      } else {
        setResult({ ok: false, message: ERROR_MESSAGES[res.error] ?? 'Could not scan this code. Try again.' });
      }
    } catch (e) {
      setResult({ ok: false, message: e instanceof Error ? e.message : 'Could not scan this code. Try again.' });
    } finally {
      setScanning(false);
    }
  };

  const closeResult = () => {
    setResult(null);
    setCode('');
    setLocked(false);
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permissionWrap]}>
        <StatusBar style="light" />
        <Ionicons name="camera-outline" size={48} color={colors.white} />
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionSubtitle}>
          GoMax needs your camera to scan the QR code on the product bag.
        </Text>
        <Button label="Allow camera access" onPress={requestPermission} roboto />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {tab === 'scan' ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torchOn}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={(event) => submitCode(event.data)}
        />
      ) : (
        <LinearGradient colors={[colors.black, colors.gradientNavyDeep]} style={StyleSheet.absoluteFill} />
      )}

      <View style={[styles.headerRow, { paddingTop: insets.top + spacing.sm }]}>
        <PressableScale style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </PressableScale>
        <View style={styles.segment}>
          <PressableScale style={[styles.segmentPill, tab === 'scan' && styles.segmentActive]} onPress={() => setTab('scan')}>
            <Text style={[styles.segmentText, tab === 'scan' && styles.segmentTextActive]}>Scan</Text>
          </PressableScale>
          <PressableScale style={styles.segmentPill} onPress={() => setTab('history')}>
            <Text style={[styles.segmentText, tab === 'history' && styles.segmentTextActive]}>History</Text>
          </PressableScale>
        </View>
        <PressableScale
          style={styles.iconButton}
          onPress={() => setTorchOn((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={torchOn ? 'Turn off flashlight' : 'Turn on flashlight'}
        >
          <Ionicons name={torchOn ? 'flash' : 'flash-off'} size={20} color={colors.white} />
        </PressableScale>
      </View>

      {tab === 'scan' ? (
        <>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{scanning ? 'Checking code…' : 'Place QR code inside the frame'}</Text>
          </View>

          <View style={styles.frameWrap}>
            <View style={styles.frame}>
              <ScanLine active={!scanning} />
              {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
                <View key={corner} style={[styles.bracket, bracketPosition[corner]]} />
              ))}
              {scanning ? (
                <View style={styles.frameLoading}>
                  <ActivityIndicator color={colors.white} />
                </View>
              ) : null}
            </View>
            <Text style={styles.caption}>📦 डब्बे का QR कोड दिखाएं</Text>
          </View>
        </>
      ) : (
        <View style={styles.historyWrap}>
          {scanHistory.length === 0 ? (
            <View style={styles.historyEmpty}>
              <Ionicons name="time-outline" size={40} color="rgba(255,255,255,0.4)" />
              <Text style={styles.historyEmptyText}>No scans yet today</Text>
            </View>
          ) : (
            scanHistory.map((item) => (
              <View key={item.id} style={styles.historyRow}>
                <View style={styles.historyIcon}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.scanSuccessGreen} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyRowTitle}>+{item.points_awarded} points</Text>
                  <Text style={styles.historyRowTime}>{new Date(item.created_at).toLocaleString()}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      <LinearGradient
        colors={[colors.white, colors.primary50]}
        style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}
      >
        <Text style={styles.sheetTitle}>OR ENTER CODE MANUALLY</Text>
        <View style={styles.manualRow}>
          <TextInput
            style={styles.manualInput}
            placeholder="Enter code…"
            placeholderTextColor="rgba(0,0,0,0.4)"
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
          />
          <PressableScale
            style={[styles.manualSubmit, !code && styles.manualSubmitDisabled]}
            disabled={!code || scanning}
            onPress={() => submitCode(code)}
            accessibilityRole="button"
            accessibilityLabel="Submit code"
          >
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </PressableScale>
        </View>
        <Text style={styles.hint}>Scan daily to earn points</Text>
      </LinearGradient>

      <Modal visible={!!result} transparent animationType="fade">
        <View style={styles.resultBackdrop}>
          <View style={styles.resultCard}>
            <View style={[styles.resultIcon, result && !result.ok && styles.resultIconError]}>
              <Ionicons name={result?.ok ? 'checkmark' : 'close'} size={32} color={colors.white} />
            </View>
            <Text style={styles.resultTitle}>{result?.ok ? 'Product Verified!' : "Couldn't scan"}</Text>
            {result?.ok ? (
              <Text style={styles.resultPoints}>+{result.points} points</Text>
            ) : (
              <Text style={styles.resultProduct}>{!result?.ok ? result?.message : ''}</Text>
            )}
            <Button label="Done" onPress={closeResult} roboto />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const bracketPosition = StyleSheet.create({
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 10 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 10 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 10 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 10 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  permissionWrap: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.xxxl },
  permissionTitle: { ...m3Type.titleLarge, color: colors.white },
  permissionSubtitle: { ...m3Type.labelLarge, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: spacing.lg },
  headerRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 5,
    gap: 4,
  },
  segmentPill: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 12 },
  segmentActive: { backgroundColor: 'rgba(192,83,54,0.18)', borderWidth: 1, borderColor: 'rgba(192,83,54,0.3)' },
  segmentText: { ...m3Type.labelLarge, fontSize: 13, color: colors.neutral300 },
  segmentTextActive: { color: colors.scanActiveTabText },
  statusPill: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.scanSuccessGreen },
  statusText: { ...m3Type.labelLarge, fontSize: 13, color: colors.white },
  frameWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 200 },
  frame: { width: 260, height: 260, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16 },
  frameLoading: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  bracket: { position: 'absolute', width: 31, height: 31, borderColor: colors.primary700 },
  scanLine: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 12,
    height: 2,
    borderRadius: radius.pill,
    shadowColor: colors.primary700,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  caption: { ...m3Type.labelLarge, color: colors.scanCaptionLight, textAlign: 'center', marginTop: spacing.xl, paddingHorizontal: spacing.xxxl },
  historyWrap: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: 140, marginBottom: 200, gap: spacing.md },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: spacing.md,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(20,200,124,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyRowTitle: { ...m3Type.labelLarge, fontSize: 13, color: colors.white, fontWeight: '600' },
  historyRowTime: { ...m3Type.labelMedium, fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  historyEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, marginBottom: 200 },
  historyEmptyText: { ...m3Type.labelLarge, color: 'rgba(255,255,255,0.5)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  sheetTitle: { ...m3Type.titleMedium, color: colors.secondary700, textAlign: 'center' },
  manualRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, alignItems: 'center' },
  manualInput: {
    flex: 1,
    height: 52,
    backgroundColor: 'rgba(5,5,5,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    ...m3Type.labelLarge,
    fontSize: 14,
    color: colors.neutral950,
  },
  manualSubmit: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.scanSubmitOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualSubmitDisabled: { opacity: 0.4 },
  hint: { ...m3Type.labelLarge, fontSize: 12, color: colors.scanHintBlue, textAlign: 'center', marginTop: spacing.lg },
  resultBackdrop: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  resultCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  resultIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  resultIconError: { backgroundColor: colors.danger },
  resultTitle: { ...m3Type.titleLarge, color: colors.neutral950 },
  resultProduct: { ...m3Type.labelLarge, color: colors.neutral500 },
  resultPoints: { ...m3Type.headlineMedium, color: colors.primary700, marginBottom: spacing.lg },
});
