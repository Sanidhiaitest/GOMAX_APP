import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { useApp } from '../../state/AppContext';

const MOCK_PRODUCTS = ['GoMax Tile Adhesive 20kg', 'GoMax Waterproofing 5kg', 'GoMax Wall Putty 40kg'];
const MOCK_POINTS = [15, 20, 25, 30];

function randomOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Node 41:1262 — exact gradient, header pills, scan frame, and bottom sheet.
export function ScanScreen() {
  const insets = useSafeAreaInsets();
  const { addScan } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [tab, setTab] = useState<'scan' | 'history'>('scan');
  const [code, setCode] = useState('');
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<{ product: string; points: number } | null>(null);

  const handleScanSuccess = () => {
    if (locked) return;
    setLocked(true);
    const product = randomOf(MOCK_PRODUCTS);
    const points = randomOf(MOCK_POINTS);
    addScan({ productName: product, points });
    setResult({ product, points });
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
          onBarcodeScanned={handleScanSuccess}
        />
      ) : (
        <LinearGradient colors={[colors.black, colors.gradientNavyDeep]} style={StyleSheet.absoluteFill} />
      )}

      <View style={[styles.headerRow, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable style={styles.iconButton}>
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </Pressable>
        <View style={styles.segment}>
          <Pressable style={[styles.segmentPill, tab === 'scan' && styles.segmentActive]} onPress={() => setTab('scan')}>
            <Text style={[styles.segmentText, tab === 'scan' && styles.segmentTextActive]}>Scan</Text>
          </Pressable>
          <Pressable style={styles.segmentPill} onPress={() => setTab('history')}>
            <Text style={[styles.segmentText, tab === 'history' && styles.segmentTextActive]}>History</Text>
          </Pressable>
        </View>
        <Pressable style={styles.iconButton} onPress={() => setTorchOn((v) => !v)}>
          <Ionicons name={torchOn ? 'flash' : 'flash-off'} size={20} color={colors.white} />
        </Pressable>
      </View>

      {tab === 'scan' ? (
        <>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Place QR code inside the frame</Text>
          </View>

          <View style={styles.frameWrap}>
            <View style={styles.frame}>
              {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
                <View key={corner} style={[styles.bracket, bracketPosition[corner]]} />
              ))}
            </View>
            <Text style={styles.caption}>Point the camera at the QR Code on the bag</Text>
          </View>
        </>
      ) : (
        <View style={styles.historyEmpty}>
          <Ionicons name="time-outline" size={40} color="rgba(255,255,255,0.4)" />
          <Text style={styles.historyEmptyText}>No scans yet today</Text>
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
          <Pressable
            style={[styles.manualSubmit, !code && styles.manualSubmitDisabled]}
            disabled={!code}
            onPress={handleScanSuccess}
          >
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </Pressable>
        </View>
        <Text style={styles.hint}>Scan daily to earn points</Text>
      </LinearGradient>

      <Modal visible={!!result} transparent animationType="fade">
        <View style={styles.resultBackdrop}>
          <View style={styles.resultCard}>
            <View style={styles.resultIcon}>
              <Ionicons name="checkmark" size={32} color={colors.white} />
            </View>
            <Text style={styles.resultTitle}>Product Verified!</Text>
            <Text style={styles.resultProduct}>{result?.product}</Text>
            <Text style={styles.resultPoints}>+{result?.points} points</Text>
            <Button label="Done" onPress={closeResult} roboto />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const bracketPosition = StyleSheet.create({
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
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
  segmentTextActive: { color: '#ff8a6b' },
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
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#14c87c' },
  statusText: { ...m3Type.labelLarge, fontSize: 13, color: colors.white },
  frameWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 200 },
  frame: { width: 260, height: 260, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16 },
  bracket: { position: 'absolute', width: 31, height: 31, borderColor: colors.primary700 },
  caption: { ...m3Type.labelLarge, color: '#e9e9f4', textAlign: 'center', marginTop: spacing.xl, paddingHorizontal: spacing.xxxl },
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
  resultTitle: { ...m3Type.titleLarge, color: colors.neutral950 },
  resultProduct: { ...m3Type.labelLarge, color: colors.neutral500 },
  resultPoints: { ...m3Type.headlineMedium, color: colors.primary700, marginBottom: spacing.lg },
});
