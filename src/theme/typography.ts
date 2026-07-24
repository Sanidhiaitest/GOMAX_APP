export const fontFamily = {
  heading: 'Poppins_600SemiBold',
  headingBold: 'Poppins_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
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
