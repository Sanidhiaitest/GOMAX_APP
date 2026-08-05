import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../theme';
import { PressableScale } from './animations';

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: 'home-outline',
  Products: 'cube-outline',
  Scan: 'qr-code',
  Redeem: 'gift-outline',
  Wallet: 'wallet-outline',
  Gifts: 'gift-outline',
  Profile: 'person-outline',
  Orders: 'receipt-outline',
  Ledger: 'wallet-outline',
  Dealers: 'people-outline',
  Dcr: 'document-text-outline',
  Dashboard: 'grid-outline',
  DealerApprovals: 'storefront-outline',
  Redemptions: 'cash-outline',
  Directory: 'people-outline',
  LedgerSearch: 'search-outline',
};

const LABELS: Record<string, string> = {
  Dcr: 'Reports',
  DealerApprovals: 'Dealers',
  LedgerSearch: 'Search',
  // Figma (node 61:42) labels this tab "Redeem" — matches the screen's
  // actual job (converting Points to a UPI payout) better than "Wallet" does.
  Wallet: 'Redeem',
  // Figma calls this nav slot "Products"; the app has no separate product
  // catalogue post-backend-rewrite, so this is the Gift Catalogue relabeled.
  Gifts: 'Products',
};

export function BottomNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const isScan = route.name === 'Scan';

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (isScan) {
          return (
            <PressableScale key={route.key} onPress={onPress} style={styles.scanTab} scaleTo={0.92}>
              <LinearGradient
                colors={[colors.primary700, colors.scanButtonGradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.scanButton}
              >
                <Ionicons name={ICONS[route.name]} size={24} color={colors.white} />
              </LinearGradient>
              <Text style={[styles.scanLabel, isFocused && styles.labelActive]}>Scan</Text>
            </PressableScale>
          );
        }

        return (
          <PressableScale key={route.key} onPress={onPress} style={styles.tab} scaleTo={0.94} haptics={false}>
            <Ionicons
              name={ICONS[route.name]}
              size={22}
              color={isFocused ? colors.primary700 : colors.darkNeutral700}
            />
            <Text style={[styles.label, isFocused && styles.labelActive]}>{LABELS[route.name] ?? route.name}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.secondary50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  scanTab: { flex: 1, alignItems: 'center', gap: 4 },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    borderWidth: 2.5,
    borderColor: colors.white,
    shadowColor: colors.primary700,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  label: { ...typography.caption, fontSize: 11, color: colors.darkNeutral700 },
  scanLabel: { ...typography.caption, fontSize: 11, color: colors.darkNeutral700 },
  labelActive: { color: colors.primary700 },
});
