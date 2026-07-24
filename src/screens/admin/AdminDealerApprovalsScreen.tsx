import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, spacing } from '../../theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Pill } from '../../components/Pill';
import { Screen } from '../../components/Screen';
import { useApp } from '../../state/AppContext';
import { otherDealerApplications } from '../../data/adminMock';

export function AdminDealerApprovalsScreen() {
  const { role, dealerBusiness, dealerVerificationStatus, approveDealerVerification } = useApp();

  const liveApplication =
    role === 'dealer'
      ? {
          id: 'live',
          shopName: dealerBusiness.shopName || 'Unnamed shop',
          city: dealerBusiness.address || '—',
          submittedAgo: 'Just now',
          status: dealerVerificationStatus,
        }
      : null;

  const applications = [...(liveApplication ? [liveApplication] : []), ...otherDealerApplications];

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Text style={styles.title}>Dealer Approvals</Text>
        <Text style={styles.subtitle}>Application → field verification → credit check → activation</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {applications.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="checkmark-done-circle-outline" size={40} color={colors.neutral400} />
            <Text style={styles.emptyText}>No pending applications</Text>
          </View>
        ) : (
          applications.map((app) => (
            <Card key={app.id} style={styles.appCard}>
              <View style={styles.appHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shopName}>{app.shopName}</Text>
                  <Text style={styles.meta}>{app.city} · Submitted {app.submittedAgo}</Text>
                </View>
                <Pill
                  label={app.status === 'verified' ? 'Verified' : 'Pending'}
                  tone={app.status === 'verified' ? 'success' : 'warning'}
                  icon={app.status === 'verified' ? 'checkmark-circle' : 'time-outline'}
                  size="sm"
                />
              </View>

              {app.status === 'pending' ? (
                <View style={styles.actionRow}>
                  <View style={{ flex: 1 }}>
                    <Button
                      label="Approve"
                      icon="checkmark"
                      onPress={() => {
                        if (app.id === 'live') approveDealerVerification();
                        else Alert.alert('Approved', `${app.shopName} has been activated.`);
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Button
                      label="Reject"
                      icon="close"
                      variant="secondary"
                      onPress={() => Alert.alert('Rejected', `${app.shopName}'s application was rejected.`)}
                    />
                  </View>
                </View>
              ) : null}
            </Card>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.lg },
  title: { ...m3Type.titleLarge, color: colors.textPrimary },
  subtitle: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, marginTop: 2 },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.md },
  appCard: { gap: spacing.md },
  appHeaderRow: { flexDirection: 'row', alignItems: 'flex-start' },
  shopName: { ...m3Type.titleMediumSemiBold, color: colors.textPrimary },
  meta: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxxl },
  emptyText: { ...m3Type.labelLarge, color: colors.neutral400 },
});
