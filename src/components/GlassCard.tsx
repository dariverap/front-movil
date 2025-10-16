// components/GlassCard.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../lib/theme';

type GlassCardProps = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export default function GlassCard({ children, style }: GlassCardProps) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.glass,
    borderRadius: RADIUS.large,
    padding: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
  },
});