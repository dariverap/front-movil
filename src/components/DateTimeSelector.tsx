// components/DateTimeSelector.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, RADIUS, SPACING, TYPE } from '../lib/theme';

type DateTimeSelectorProps = {
  dateLabel?: string;
  timeLabel?: string;
  onSelectDate?: () => void;
  onSelectTime?: () => void;
};

export default function DateTimeSelector({ dateLabel = 'Hoy, 24 Oct', timeLabel = '10:00 - 12:00', onSelectDate, onSelectTime }: DateTimeSelectorProps) {
  return (
    <View style={styles.row}>
      <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={onSelectDate}>
        <View style={styles.cardInner}>
          <Icon name="calendar-outline" size={20} color={COLORS.primaryEnd} />
          <View style={{ marginLeft: SPACING.sm }}>
            <Text style={styles.label}>Fecha</Text>
            <Text style={styles.value}>{dateLabel}</Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={onSelectTime}>
        <View style={styles.cardInner}>
          <Icon name="time-outline" size={20} color={COLORS.primaryEnd} />
          <View style={{ marginLeft: SPACING.sm }}>
            <Text style={styles.label}>Hora</Text>
            <Text style={styles.value}>{timeLabel}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.regular,
    padding: SPACING.md,
    marginRight: SPACING.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: COLORS.textMid,
    fontSize: 13,
  },
  value: {
    color: COLORS.textDark,
    fontSize: 15,
    fontWeight: '600',
  },
});