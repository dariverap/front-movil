// components/VehicleCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, RADIUS, SPACING, TYPE } from '../lib/theme';

type VehicleCardProps = {
  id?: string;
  make?: string;
  plate?: string;
  color?: string;
  selected?: boolean;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function VehicleCard({ id, make = 'Toyota Prius', plate = 'ABC-1234', color = 'Silver', selected = false, onPress, onEdit, onDelete }: VehicleCardProps) {
  const scale = React.useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, mass: 0.6 }).start();
  }
  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, mass: 0.6 }).start();
  }

  return (
    <Animated.View style={[styles.animated, { transform: [{ scale }] }]}>
      <TouchableOpacity activeOpacity={0.95} onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} style={[styles.container, selected && styles.selected]}>
        <View style={styles.left}>
          <Icon name="car-outline" size={28} color={COLORS.primaryEnd} />
        </View>
        <View style={styles.center}>
          <Text style={styles.make}>{make}</Text>
          <Text style={styles.plate}>{plate} · {color}</Text>
        </View>
        <View style={styles.right}>
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.iconButton} accessibilityLabel="Editar vehículo">
              <Icon name="pencil" size={18} color={COLORS.textMid} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.iconButton} accessibilityLabel="Eliminar vehículo">
              <Icon name="trash" size={18} color="#ef4444" />
            </TouchableOpacity>
          )}
          {selected ? (
            <Icon name="checkmark-circle" size={22} color={COLORS.success} />
          ) : (
            <Icon name="ellipse-outline" size={18} color={COLORS.textMid} />
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animated: { marginVertical: SPACING.xs },
  container: {
    backgroundColor: 'white',
    borderRadius: RADIUS.regular,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  selected: {
    borderColor: COLORS.primaryEnd,
    borderWidth: 1.5,
  },
  left: {
    width: 48,
    alignItems: 'center',
  },
  center: {
    flex: 1,
  },
  right: {
    minWidth: 72,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  make: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  plate: {
    fontSize: 15,
    color: COLORS.textMid,
  },
  iconButton: {
    marginRight: 8,
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
});