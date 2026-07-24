import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { dealerLedger, ledgerTransactions } from '../../data/dealerMock';
import { RootStackParamList } from '../../navigation/types';

export function LedgerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const utilisation = Math.round((dealerLedger.outstanding / dealerLedger.creditLimit) * 100);

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Ledger</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={ledgerTransactions}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.content}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListHeaderComponent={
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>OUTSTANDING BALANCE</Text>
            <Text style={styles.summaryValue}>₹{dealerLedger.outstanding.toLocaleString('en-IN')}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${utilisation}%` }]} />
            </View>
            <Text style={styles.summaryHint}>
              {utilisation}% of ₹{dealerLedger.creditLimit.toLocaleString('en-IN')} limit · Due {dealerLedger.dueDate}
            </Text>
          </Card>
        }
        renderItem={({ item }) => (
          <Card style={styles.row}>
            <View style={[styles.typeIcon, item.type === 'credit' ? styles.creditIcon : styles.debitIcon]}>
              <Ionicons
                name={item.type === 'credit' ? 'arrow-down' : 'arrow-up'}
                size={16}
                color={item.type === 'credit' ? colors.success : colors.danger}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowDate}>{item.date}</Text>
            </View>
            <Text style={[styles.rowAmount, item.type === 'credit' ? styles.creditText : styles.debitText]}>
              {item.type === 'credit' ? '−' : '+'}₹{item.amount.toLocaleString('en-IN')}
            </Text>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...m3Type.titleLarge, color: colors.textPrimary },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },
  summaryCard: { backgroundColor: colors.navy900, borderColor: colors.navy900, marginBottom: spacing.lg },
  summaryLabel: { ...m3Type.labelSmall, color: colors.orange500 },
  summaryValue: { ...m3Type.headlineMedium, color: colors.white, marginTop: spacing.xs },
  barTrack: { height: 6, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.15)', marginTop: spacing.lg, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.orange500 },
  summaryHint: { ...m3Type.labelMedium, color: 'rgba(255,255,255,0.7)', marginTop: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  typeIcon: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  creditIcon: { backgroundColor: '#e6f7ec' },
  debitIcon: { backgroundColor: '#fdeaea' },
  rowLabel: { ...m3Type.titleMedium, fontSize: 14, color: colors.textPrimary },
  rowDate: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, marginTop: 2 },
  rowAmount: { ...m3Type.titleMediumSemiBold, fontSize: 14 },
  creditText: { color: colors.success },
  debitText: { color: colors.danger },
});
