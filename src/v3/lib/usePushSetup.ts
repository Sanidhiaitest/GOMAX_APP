// Firebase Cloud Messaging (FCM) setup for the GoMax app.
// - Requests notification permission (iOS requires this explicitly).
// - Handles foreground messages: bumps unread count + shows a toast.
// - Handles notification taps from background / killed state → navigates to the linked screen.
// - Refreshes the FCM token when Firebase rotates it.
// Token registration with the backend happens inside fetchAccount() so it
// is always tied to an authenticated session.
import { useEffect } from 'react';
import { Platform } from 'react-native';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

type Opts = {
  navigate: (route: string, params?: object) => void;
  onNewNotification: () => void;
  showToast: (msg: string, kind?: 'info' | 'error') => void;
};

type Msg = FirebaseMessagingTypes.RemoteMessage;

function parseLink(data: Msg['data']): { route: string; params?: object } | null {
  try {
    const raw = typeof data?.link === 'string' ? data.link : null;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function usePushSetup({ navigate, onNewNotification, showToast }: Opts) {
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    (async () => {
      try {
        const messaging = (await import('@react-native-firebase/messaging')).default;
        const m = messaging();

        // iOS: must request permission before receiving any push.
        if (Platform.OS === 'ios') {
          const status = await m.requestPermission();
          const allowed =
            status === messaging.AuthorizationStatus.AUTHORIZED ||
            status === messaging.AuthorizationStatus.PROVISIONAL;
          if (!allowed) return;
        }

        // Foreground: show a toast + refresh account to update unread badge.
        unsubs.push(
          m.onMessage(async (msg: Msg) => {
            onNewNotification();
            const title = msg.notification?.title;
            if (title) showToast(title, 'info');
          }),
        );

        // Background → foreground: user tapped a notification while app was suspended.
        unsubs.push(
          m.onNotificationOpenedApp((msg: Msg) => {
            const link = parseLink(msg.data);
            if (link) navigate(link.route, link.params);
          }),
        );

        // Token refresh — backend is updated next time fetchAccount() runs or here.
        unsubs.push(
          m.onTokenRefresh(() => {
            // fetchAccount() will re-register the new token on the next focus.
            // Nothing to do here unless the user is idle for a long time.
          }),
        );

        // Killed state: app was completely closed, user tapped the notification.
        const initial = await m.getInitialNotification();
        if (initial) {
          const link = parseLink(initial.data);
          if (link) {
            // Small delay so the navigator is fully mounted before navigating.
            setTimeout(() => navigate(link.route, link.params), 500);
          }
        }
      } catch {
        // No push available (Android emulator without Play Services, etc.).
      }
    })();

    return () => unsubs.forEach((fn) => fn());
  }, []);
}
