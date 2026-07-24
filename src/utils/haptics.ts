import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// expo-haptics has no-op/limited support on web, and some Android devices lack
// a vibration motor — every call here is fire-and-forget so a missing/failed
// haptic never throws or blocks a UI interaction.
function safe(fn: () => Promise<void> | void) {
  if (Platform.OS === 'web') return;
  try {
    const result = fn();
    if (result && typeof (result as Promise<void>).catch === 'function') {
      (result as Promise<void>).catch(() => {});
    }
  } catch {
    // no-op — haptics are a nice-to-have, never a hard requirement
  }
}

// Light tap — every generic button/pill press.
export function tapHaptic() {
  safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

// Slightly stronger tap for primary CTAs (Spin, Scratch, Claim).
export function pressHaptic() {
  safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

// Big win — jackpot, challenge claimed, redemption success.
export function successHaptic() {
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

// Consolation / "try again" outcomes.
export function softHaptic() {
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}
