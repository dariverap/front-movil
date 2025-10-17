// components/VehicleFormModal.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPE, RADIUS } from '../lib/theme';
import ButtonGradient from './ButtonGradient';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (payload: { id?: string; make: string; model?: string; plate: string; color?: string }) => void;
  existing?: { id: string; make: string; model?: string; plate: string; color?: string } | null;
};

export default function VehicleFormModal({ visible, onClose, onSave, existing }: Props) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [plate, setPlate] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    if (existing) {
      setMake(existing.make || '');
      setModel(existing.model || '');
      setPlate(existing.plate || '');
      setColor(existing.color || '');
    } else {
      setMake('');
      setModel('');
      setPlate('');
      setColor('');
    }
  }, [existing, visible]);

  function handleSave() {
    if (!make.trim() || !plate.trim()) {
      Alert.alert('Faltan datos', 'Por favor completa la marca y la placa.');
      return;
    }
    onSave({ id: existing?.id, make: make.trim(), model: model.trim(), plate: plate.trim(), color: color.trim() });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <SafeAreaView>
            <Text style={styles.title}>{existing ? 'Editar vehículo' : 'Agregar vehículo'}</Text>

            <Text style={styles.label}>Marca</Text>
            <TextInput placeholder="Ej. Toyota" value={make} onChangeText={setMake} style={styles.input} />

            <Text style={styles.label}>Modelo</Text>
            <TextInput placeholder="Ej. 2020" value={model} onChangeText={setModel} style={styles.input} />

            <Text style={styles.label}>Placa</Text>
            <TextInput placeholder="Ej. ABC-1234" value={plate} onChangeText={setPlate} style={styles.input} />

            <Text style={styles.label}>Color</Text>
            <TextInput placeholder="Ej. Plateado" value={color} onChangeText={setColor} style={styles.input} />

            <View style={{ flexDirection: 'row', marginTop: SPACING.md }}>
              <View style={{ flex: 1 }}>
                <ButtonGradient title="Cancelar" variant="outline" onPress={onClose} />
              </View>
              <View style={{ width: SPACING.md }} />
              <View style={{ flex: 1 }}>
                <ButtonGradient title={existing ? 'Guardar' : 'Agregar'} onPress={handleSave} />
              </View>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(17,24,39,0.5)', justifyContent: 'flex-end' },
  card: { backgroundColor: '#fff', padding: SPACING.lg, borderTopLeftRadius: RADIUS.large, borderTopRightRadius: RADIUS.large },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.textDark },
  label: { marginTop: SPACING.sm, color: COLORS.textMid },
  input: { marginTop: SPACING.xs, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', padding: SPACING.sm, borderRadius: 8 },
});