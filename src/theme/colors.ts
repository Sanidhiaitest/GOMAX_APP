// Exact brand/UI values pulled from the GoMax Figma file's variables and
// get_design_context (fileKey FeJTlIYATbYbRX82aBY17w) — do not approximate;
// if a new screen needs a color not listed here, pull it from Figma.
export const colors = {
  // --- Brand (from the client's logo artwork) ---
  brandNavy: '#001E42',
  brandOrange: '#F3987A',

  // --- M3 "Primary" scale (buttons, links, accents) ---
  primary700: '#c05336',
  primary600: '#e07554',
  primary50: '#fff8f5',

  // --- M3 "Secondary" scale (headings, step indicators) ---
  secondary800: '#0a1c37',
  secondary700: '#0f2a4e',
  secondary500: '#1e508c',
  secondary50: '#f0f4fa',

  // --- M3 "Neutral" scale ---
  neutral0: '#ffffff',
  neutral200: '#e4e4e7',
  neutral300: '#d4d4d8',
  neutral400: '#a1a1aa',
  neutral500: '#71717a',
  neutral600: '#52525b',
  neutral950: '#09090b',

  // --- Raw one-off hex used directly in the design (not Figma variables) ---
  labelGray: '#808080',
  inputBorder: '#e0e0e0',
  inputPrefixBg: '#ededed',
  skipGray: '#595c5d',
  gradientNavyDeep: '#002040', // splash + scan gradient stop
  gradientNavyIndigo: '#041F61', // mobile number / otp header gradient stop
  scanSuccessGreen: '#14c87c', // ScanScreen "verified" dot + history checkmark (dark UI, not the light-surface `success` token)
  scanActiveTabText: '#ff8a6b', // ScanScreen active Scan/History segment label
  scanCaptionLight: '#e9e9f4', // ScanScreen caption text on the dark camera view
  warningBg: '#fff4e0', // shared warning-tinted icon/pill background (matches Pill's `warning` tone bg)
  scanButtonGradientEnd: '#e07a62', // BottomNav Scan button's gradient end stop (Figma node 61:57)

  // --- Dark "Light/Neutral" collection used on Scan + Wallet ---
  darkNeutral700: '#474D6A',
  darkNeutral800: '#121224',

  // --- Scan/Wallet screen-specific (Inter-typeset dark UI) ---
  walletBg: '#0a1628',
  walletCard: '#0d1f3c',
  walletPointsAccent: '#c1440e',
  walletRunsAccent: '#2a8fa8',
  scanSubmitOrange: '#cf4b29',
  scanHintBlue: '#2e5475',

  // --- Generic semantic aliases used by shared components (Home/Profile/KYC/
  // Products/Dealer/Salesman — screens with no exact Figma reference) ---
  navy900: '#0a1c37',
  navy800: '#0f2a4e',
  navy700: '#1e508c',
  orange500: '#c05336',
  orange600: '#a8442a',
  orange100: '#fbe7dd',
  orange50: '#fff8f5',
  textPrimary: '#131B2E',
  textSecondary: '#71717a',
  textMuted: '#a1a1aa',
  textInverse: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F4F5F7',
  border: '#e4e4e7',
  borderFocus: '#c05336',

  white: '#FFFFFF',
  black: '#0A0A0A',
  success: '#1FA855',
  whatsapp: '#25D366',
  danger: '#DC2626',
  warning: '#D97706',
  overlay: 'rgba(11, 26, 51, 0.6)',

  // --- AA-contrast text/icon variants of success/warning/danger, for use
  // whenever those semantic colors sit ON TOP of a light tint or white
  // (the base success/warning/danger above read as ~2.8-4.2:1 there, below
  // the 4.5:1 WCAG AA text minimum; these hold the same hue at ~4.9-5.6:1) ---
  successText: '#137a3d',
  warningText: '#a3540a',
  dangerText: '#b91c1c',
} as const;

export type Colors = typeof colors;
