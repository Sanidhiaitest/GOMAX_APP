// Onboarding screens use Roboto (Material 3 static type scale) in the Figma
// file; Scan + Wallet use Inter. Both are loaded in App.tsx.
export const fontFamily = {
  robotoRegular: 'Roboto_400Regular',
  robotoMedium: 'Roboto_500Medium',
  robotoSemiBold: 'Roboto_600SemiBold',
  robotoBold: 'Roboto_700Bold',

  interRegular: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
  interBold: 'Inter_700Bold',

  // Legacy aliases used by generic (non-Figma-sourced) screens
  heading: 'Roboto_600SemiBold',
  headingBold: 'Roboto_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
} as const;

// Exact M3 static type scale from the Figma file's variable defs.
export const m3Type = {
  headlineLarge: { fontFamily: fontFamily.robotoBold, fontSize: 32, lineHeight: 40 },
  headlineMedium: { fontFamily: fontFamily.robotoMedium, fontSize: 28, lineHeight: 36 },
  titleLarge: { fontFamily: fontFamily.robotoMedium, fontSize: 22, lineHeight: 28 },
  titleMedium: { fontFamily: fontFamily.robotoMedium, fontSize: 16, lineHeight: 24, letterSpacing: 0.15 },
  titleMediumSemiBold: { fontFamily: fontFamily.robotoSemiBold, fontSize: 16, lineHeight: 24, letterSpacing: 0.15 },
  labelLarge: { fontFamily: fontFamily.robotoMedium, fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  labelMedium: { fontFamily: fontFamily.robotoMedium, fontSize: 12, lineHeight: 16, letterSpacing: 0.5 },
  labelSmall: { fontFamily: fontFamily.robotoMedium, fontSize: 11, lineHeight: 16, letterSpacing: 0.5 },
  labelSmallSemiBold: { fontFamily: fontFamily.robotoSemiBold, fontSize: 11, lineHeight: 16, letterSpacing: 0.5 },
} as const;

export const typography = {
  h1: { fontFamily: fontFamily.headingBold, fontSize: 28, lineHeight: 36 },
  h2: { fontFamily: fontFamily.headingBold, fontSize: 22, lineHeight: 30 },
  h3: { fontFamily: fontFamily.heading, fontSize: 18, lineHeight: 26 },
  body: { fontFamily: fontFamily.body, fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: fontFamily.bodyMedium, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fontFamily.bodySemiBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
  caption: { fontFamily: fontFamily.body, fontSize: 13, lineHeight: 18 },
  button: { fontFamily: fontFamily.bodySemiBold, fontSize: 16, lineHeight: 20 },
} as const;
