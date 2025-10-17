// components/IconInput.tsx
import React from 'react';
import { View, TextInput, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, RADIUS, SPACING, TYPE } from '../lib/theme';

type IconInputProps = {
  icon?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  secureTextEntry?: boolean;
};

export default function IconInput({ icon = 'search', placeholder, value, onChangeText, style, inputStyle, secureTextEntry }: IconInputProps) {
  return (
    <View style={[styles.container, style]}>
      <Icon name={icon} size={20} color={COLORS.primaryEnd} style={styles.icon} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMid}
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, inputStyle]}
        underlineColorAndroid="transparent"
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: RADIUS.large,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  icon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
  },
});