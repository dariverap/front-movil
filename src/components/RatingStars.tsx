// components/RatingStars.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, TYPE } from '../lib/theme';

type RatingStarsProps = {
  rating: number; // 0-5
  count?: number; // total ratings
};

export default function RatingStars({ rating, count = 0 }: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const stars = Array.from({ length: 5 }).map((_, i) => (
    <Icon
      key={i}
      name={i < fullStars ? 'star' : 'star-outline'}
      size={16}
      color={i < fullStars ? '#D4AF37' : '#CBD5E0'}
      style={{ marginRight: 4 }}
    />
  ));

  return (
    <View style={styles.row}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>{stars}</View>
      <Text style={styles.count}>{rating.toFixed(1)} · {count} reseñas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  count: {
    marginLeft: SPACING.sm,
    color: COLORS.textMid,
    fontSize: 13,
  },
});