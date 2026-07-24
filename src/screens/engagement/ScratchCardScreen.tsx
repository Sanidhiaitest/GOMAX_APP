import React, { useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors, m3Type, radius, spacing } from '../../theme';
import { Screen } from '../../components/Screen';
import { useApp } from '../../state/AppContext';
import { initialScratchCards, ScratchCard } from '../../data/scratchCardsMock';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ScratchCards'>;

// Freeform design (P1). Simplified reveal: a tap-to-flip animation rather
// than a literal finger-scratch gesture — a real scratch mask (e.g. via
// react-native-skia) would be a good upgrade once this loop is validated.
export function ScratchCardScreen({ navigation }: Props) {
  const { addRuns } = useApp();
  const [cards, setCards] = useState<ScratchCard[]>(initialScratchCards);
  const flips = useRef<Record<string, Animated.Value>>(
    Object.fromEntries(initialScratchCards.map((c) => [c.id, new Animated.Value(0)]))
  ).current;

  const reveal = (card: ScratchCard) => {
    if (card.scratched) return;
    Animated.spring(flips[card.id], { toValue: 1, useNativeDriver: true, friction: 8 }).start();
    addRuns(card.reward);
    setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, scratched: true } : c)));
  };

  return (
    <Screen backgroundColor={colors.surfaceMuted}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>My Scratch Cards</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {cards.map((card) => {
          const flip = flips[card.id];
          const frontRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
          const backRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
          const frontOpacity = flip.interpolate({ inputRange: [0, 0.5, 0.5001, 1], outputRange: [1, 1, 0, 0] });
          const backOpacity = flip.interpolate({ inputRange: [0, 0.5, 0.5001, 1], outputRange: [0, 0, 1, 1] });

          return (
            <Pressable key={card.id} onPress={() => reveal(card)} disabled={card.scratched}>
              <View style={styles.cardWrap}>
                <Animated.View
                  style={[styles.face, styles.front, { opacity: frontOpacity, transform: [{ perspective: 800 }, { rotateY: frontRotate }] }]}
                >
                  <View style={styles.ticketIcon}>
                    <Ionicons name="ticket" size={20} color={colors.primary700} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                  </View>
                  <View style={styles.scratchButton}>
                    <Text style={styles.scratchButtonText}>Scratch</Text>
                  </View>
                </Animated.View>

                <Animated.View
                  style={[styles.face, styles.back, { opacity: backOpacity, transform: [{ perspective: 800 }, { rotateY: backRotate }] }]}
                >
                  <Text style={styles.rewardEmoji}>🎉</Text>
                  <Text style={styles.rewardText}>+{card.reward} Runs</Text>
                  <Text style={styles.rewardHint}>Added to your wallet</Text>
                </Animated.View>
              </View>
              <Text style={styles.expiry}>{card.expiresIn}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...m3Type.titleLarge, color: colors.textPrimary },
  content: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, gap: spacing.xs },
  cardWrap: { height: 76 },
  face: {
    position: 'absolute',
    width: '100%',
    height: 68,
    borderRadius: radius.lg,
    backfaceVisibility: 'hidden',
  },
  front: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  back: {
    backgroundColor: colors.primary50,
    borderWidth: 1,
    borderColor: colors.primary700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.orange50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { ...m3Type.titleMedium, fontSize: 15, color: colors.textPrimary },
  cardSubtitle: { ...m3Type.labelLarge, fontSize: 12, color: colors.neutral500, marginTop: 2 },
  scratchButton: { backgroundColor: colors.primary700, borderRadius: radius.sm, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  scratchButtonText: { ...m3Type.labelLarge, fontSize: 12, color: colors.white },
  rewardEmoji: { fontSize: 20 },
  rewardText: { ...m3Type.titleMediumSemiBold, color: colors.primary700 },
  rewardHint: { ...m3Type.labelMedium, fontSize: 11, color: colors.neutral500 },
  expiry: { ...m3Type.labelMedium, fontSize: 11, color: colors.neutral400, marginBottom: spacing.md },
});
