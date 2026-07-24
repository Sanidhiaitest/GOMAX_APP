// Single barrel for all image assets — screens import from here, never
// require() a path directly. See assets/README.md for how to add more.

export const brand = {
  logoFullOrange: require('../../assets/brand/gomax-logo-full-orange.png'),
  logoFullNavy: require('../../assets/brand/gomax-logo-full-navy.png'),
  markOrange: require('../../assets/brand/gomax-mark-orange.png'),
  markNavy: require('../../assets/brand/gomax-mark-navy.png'),
};

// Awaiting real exports from Figma (see assets/README.md) — screens fall back
// to a solid-color/gradient placeholder when these are undefined.
export const photos: Partial<{
  onboardingMobileNumber: number;
  onboardingOtp: number;
}> = {};

export const illustrations: Partial<{
  roleMason: number;
  roleDealer: number;
  roleSalesman: number;
  birthdayCouple: number;
}> = {};
