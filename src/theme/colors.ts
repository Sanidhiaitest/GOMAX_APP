// GoMax design language, approximated from the Figma file reviewed with the client.
// TODO: replace approximated hex values with exact Figma variable exports once
// design tokens are shared (Figma connector was disconnected mid-project).
export const colors = {
  navy900: '#0B1A33',
  navy800: '#0F2247',
  navy700: '#14294F',
  navy600: '#1C3560',

  orange500: '#DD6B3F',
  orange600: '#C85A31',
  orange100: '#FBE7DD',
  orange50: '#FDF3EE',

  white: '#FFFFFF',
  black: '#0A0A0A',

  textPrimary: '#131B2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  surface: '#FFFFFF',
  surfaceMuted: '#F4F5F7',
  border: '#E5E7EB',
  borderFocus: '#DD6B3F',

  success: '#1FA855',
  whatsapp: '#25D366',
  danger: '#DC2626',
  warning: '#D97706',

  overlay: 'rgba(11, 26, 51, 0.6)',
} as const;

export type Colors = typeof colors;
