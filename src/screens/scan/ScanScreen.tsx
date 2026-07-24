import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../theme';
import { Button } from '../../components/Button';
import { useApp } from '../../state/AppContext';

const MOCK_PRODUCTS = ['GoMax Tile Adhesive 20kg', 'GoMax Waterproofing 5kg', 'GoMax Wall Putty 40kg'];
const MOCK_POINTS = [15, 20, 25, 30];

function randomOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function ScanScreen() {
  const insets = useSafeAreaInsets();
  const { addScan } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
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
        <Ionicons name="camera-outline" size={48} color={colors.white} />
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionSubtitle}>
          GoMax needs your camera to scan the QR code on the product bag.
        </Text>
        <Button label="Allow camera access" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torchOn}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleScanSuccess}
      />

      <View style={[styles.headerRow, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable style={styles.iconButton}>
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </Pressable>
        <View style={styles.segment}>
          <View style={[styles.segmentPill, styles.segmentActive]}>
            <Text style={[styles.segmentText, styles.segmentTextActive]}>Scan</Text>
          </View>
          <View style={styles.segmentPill}>
            <Text style={styles.segmentText}>History</Text>
          </View>
        </View>
        <Pressable style={styles.iconButton} onPress={() => setTorchOn((v) => !v)}>
          <Ionicons name={torchOn ? 'flash' : 'flash-off'} size={20} color={colors.white} />
        </Pressable>
      </View>

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

      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <Text style={styles.sheetTitle}>OR ENTER CODE MANUALLY</Text>
        <View style={styles.manualRow}>
          <TextInput
            style={styles.manualInput}
            placeholder="Enter code…"
            placeholderTextColor={colors.textMuted}
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
      </View>

      <Modal visible={!!result} transparent animationType="fade">
        <View style={styles.resultBackdrop}>
          <View style={styles.resultCard}>
            <View style={styles.resultIcon}>
              <Ionicons name="checkmark" size={32} color={colors.white} />
            </View>
            <Text style={styles.resultTitle}>Product Verified!</Text>
            <Text style={styles.resultProduct}>{result?.product}</Text>
            <Text style={styles.resultPoints}>+{result?.points} points</Text>
            <Button label="Done" onPress={closeResult} />
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
  container: { flex: 1, backgroundColor: colors.navy900 },
  permissionWrap: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.xxxl },
  permissionTitle: { ...typography.h3, color: colors.white },
  permissionSubtitle: { ...typography.body, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: spacing.lg },
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
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: radius.pill, padding: 4 },
  segmentPill: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.pill },
  segmentActive: { backgroundColor: colors.orange500 },
  segmentText: { ...typography.caption, color: 'rgba(255,255,255,0.7)' },
  segmentTextActive: { color: colors.white, fontWeight: '600' },
  statusPill: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  statusText: { ...typography.caption, color: colors.white },
  frameWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 200 },
  frame: { width: 260, height: 260 },
  bracket: { position: 'absolute', width: 31, height: 31, borderColor: colors.orange500 },
  caption: { ...typography.body, color: colors.white, textAlign: 'center', marginTop: spacing.xl, paddingHorizontal: spacing.xxxl },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  sheetTitle: { ...typography.label, color: colors.navy800, textAlign: 'center' },
  manualRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, alignItems: 'center' },
  manualInput: {
    flex: 1,
    height: 52,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  manualSubmit: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.orange500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualSubmitDisabled: { opacity: 0.4 },
  hint: { ...typography.caption, color: colors.orange600, textAlign: 'center', marginTop: spacing.lg },
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
  resultTitle: { ...typography.h3, color: colors.textPrimary },
  resultProduct: { ...typography.body, color: colors.textSecondary },
  resultPoints: { ...typography.h2, color: colors.orange500, marginBottom: spacing.lg },
});
