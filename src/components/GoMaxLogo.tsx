import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { brand } from '../assets/images';

type Props = {
  variant?: 'full-orange' | 'full-navy' | 'mark-orange' | 'mark-navy';
  width?: number;
  style?: StyleProp<ImageStyle>;
};

const SOURCES = {
  'full-orange': brand.logoFullOrange,
  'full-navy': brand.logoFullNavy,
  'mark-orange': brand.markOrange,
  'mark-navy': brand.markNavy,
};

const ASPECT_RATIO = {
  'full-orange': 1200 / 449,
  'full-navy': 1200 / 257,
  'mark-orange': 600 / 499,
  'mark-navy': 600 / 496,
};

export function GoMaxLogo({ variant = 'mark-orange', width = 120, style }: Props) {
  const ratio = ASPECT_RATIO[variant];
  return (
    <Image
      source={SOURCES[variant]}
      style={[{ width, height: width / ratio }, style]}
      resizeMode="contain"
    />
  );
}
