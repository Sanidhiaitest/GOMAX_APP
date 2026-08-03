import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../theme';

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
            <Pressable key={route.key} onPress={onPress} style={styles.scanTab}>
              <View style={styles.scanButton}>
                <Ionicons name={ICONS[route.name]} size={24} color={colors.white} />
              </View>
              <Text style={[styles.scanLabel, isFocused && styles.labelActive]}>Scan</Text>
            </Pressable>
          );
        }

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tab}>
            <Ionicons
              name={ICONS[route.name]}
              size={22}
              color={isFocused ? colors.orange500 : colors.textSecondary}
            />
            <Text style={[styles.label, isFocused && styles.labelActive]}>{LABELS[route.name] ?? route.name}</Text>
          </Pressable>
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
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  scanTab: { flex: 1, alignItems: 'center' },
  scanButton: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.orange500,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    borderWidth: 4,
    borderColor: colors.white,
  },
  label: { ...typography.caption, fontSize: 11, color: colors.textSecondary },
  scanLabel: { ...typography.caption, fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  labelActive: { color: colors.orange500 },
});
