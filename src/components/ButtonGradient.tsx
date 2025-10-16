// components/ButtonGradient.tsx
import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, RADIUS, SPACING, TYPE } from '../lib/theme';

type ButtonGradientProps = {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  icon?: React.ReactNode;
  variant?: 'solid' | 'outline' | 'ghost';
};

export default function ButtonGradient({ title, onPress, style, titleStyle, icon, variant = 'solid' }: ButtonGradientProps) {
  // Solid: gradient background
  // Outline: gradient border with transparent/white inner
  // Ghost: simple text button (used for secondary actions)
  if (variant === 'outline') {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[style]}>
        <LinearGradient colors={[COLORS.primaryStart, COLORS.primaryEnd]} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={styles.outlineGradient}>
          <View style={styles.outlineInner}>
            {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
            <Text style={[styles.outlineTitle, titleStyle]}>{title}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'ghost') {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[styles.ghost, style]}>
        {icon}
        <Text style={[styles.ghostTitle, titleStyle]}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[style]}>
      <LinearGradient
        colors={[COLORS.primaryStart, COLORS.primaryEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradient}
      >
        {icon}
        <Text style={[styles.title, titleStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.regular,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  title: {
    color: COLORS.white,
    fontSize: TYPE.subtitle,
    fontWeight: '700',
  },
  outlineGradient: {
    padding: 1,
    borderRadius: RADIUS.regular,
  },
  outlineInner: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.regular - 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineTitle: {
    color: COLORS.textDark,
    fontSize: TYPE.subtitle,
    fontWeight: '700',
  },
  ghost: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostTitle: {
    color: COLORS.primaryEnd,
    fontSize: TYPE.body,
    fontWeight: '600',
  },
});