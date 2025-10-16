// components/ProgressSteps.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPE } from '../lib/theme';

type ProgressStepsProps = {
  steps: string[];
  current: number;
};

export default function ProgressSteps({ steps, current }: ProgressStepsProps) {
  return (
    <View style={styles.container}>
      {steps.map((s, i) => {
        const active = i <= current;
        return (
          <View key={s} style={styles.stepContainer}>
            <View style={[styles.bullet, active ? styles.bulletActive : null]} />
            <Text style={[styles.label, active ? styles.labelActive : null]}>{s}</Text>
            {i < steps.length - 1 && <View style={[styles.connector, active ? styles.connectorActive : null]} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  bullet: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    marginBottom: 6,
  },
  bulletActive: {
    backgroundColor: COLORS.primaryEnd,
  },
  label: {
    color: COLORS.textMid,
    fontSize: TYPE.caption,
    textAlign: 'center',
  },
  labelActive: {
    color: COLORS.textDark,
    fontWeight: '600',
  },
  connector: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#E2E8F0',
    left: '50%',
    right: '-50%',
    top: 6,
    zIndex: -1,
  },
  connectorActive: {
    backgroundColor: COLORS.primaryStart,
  },
});