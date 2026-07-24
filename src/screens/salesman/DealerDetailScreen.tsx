import React from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { beatPlan } from '../../data/salesmanMock';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DealerDetail'>;

export function DealerDetailScreen({ navigation, route }: Props) {
  const dealer = beatPlan.find((d) => d.id === route.params.dealerId);

  if (!dealer) {
    return (
      <Screen backgroundColor={colors.surfaceMuted}>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.neutral400} />
          <Text style={styles.notFoundText}>Dealer not found</Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.notFoundLink}>Go back</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const utilisation = Math.min(100, Math.round((dealer.outstanding / dealer.creditLimit) * 100));

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{dealer.dealerName}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={colors.neutral500} />
            <Text style={styles.infoText}>{dealer.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color={colors.neutral500} />
            <Text style={styles.infoText}>{dealer.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color={colors.neutral500} />
            <Text style={styles.infoText}>Last visit: {dealer.lastVisit}</Text>
          </View>
        </Card>

        <View style={styles.actionRow}>
          <Pressable style={styles.actionButton} onPress={() => Linking.openURL(`tel:${dealer.phone.replace(/\s/g, '')}`)}>
            <Ionicons name="call" size={18} color={colors.primary700} />
            <Text style={styles.actionButtonText}>Call</Text>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(dealer.address)}`)}
          >
            <Ionicons name="navigate" size={18} color={colors.primary700} />
            <Text style={styles.actionButtonText}>Navigate</Text>
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => Alert.alert('Visit logged', `Marked ${dealer.dealerName} as visited for today.`)}
          >
            <Ionicons name="checkmark-circle" size={18} color={colors.primary700} />
            <Text style={styles.actionButtonText}>Log visit</Text>
          </Pressable>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>Credit</Text>
          <Text style={styles.outstandingValue}>₹{dealer.outstanding.toLocaleString('en-IN')}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${utilisation}%` }]} />
          </View>
          <Text style={styles.hint}>{utilisation}% of ₹{dealer.creditLimit.toLocaleString('en-IN')} limit used</Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Last order</Text>
          <Text style={styles.lastOrderAmount}>₹{dealer.lastOrderAmount.toLocaleString('en-IN')}</Text>
        </Card>

        <Button label="Place order for this dealer" onPress={() => navigation.navigate('OrderPlacement')} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...m3Type.titleLarge, color: colors.textPrimary, flex: 1, textAlign: 'center' },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.lg },
  infoCard: { gap: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  infoText: { ...m3Type.labelLarge, fontSize: 14, color: colors.textPrimary, flex: 1 },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
  },
  actionButtonText: { ...m3Type.labelLarge, fontSize: 12, color: colors.primary700, fontWeight: '600' },
  sectionTitle: { ...m3Type.labelSmall, color: colors.neutral500, textTransform: 'uppercase' },
  outstandingValue: { ...m3Type.headlineMedium, fontSize: 24, color: colors.textPrimary, marginTop: spacing.xs },
  barTrack: { height: 6, borderRadius: radius.pill, backgroundColor: colors.surfaceMuted, marginTop: spacing.md, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.primary700 },
  hint: { ...m3Type.labelMedium, color: colors.neutral500, marginTop: spacing.sm },
  lastOrderAmount: { ...m3Type.headlineMedium, fontSize: 24, color: colors.textPrimary, marginTop: spacing.xs },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  notFoundText: { ...m3Type.titleMedium, color: colors.textSecondary },
  notFoundLink: { ...m3Type.labelLarge, color: colors.primary700 },
});
