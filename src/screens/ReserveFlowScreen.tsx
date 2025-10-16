// screens/ReserveFlowScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ProgressSteps from '../components/ProgressSteps';
import DateTimeSelector from '../components/DateTimeSelector';
import VehicleCard from '../components/VehicleCard';
import ButtonGradient from '../components/ButtonGradient';
import GlassCard from '../components/GlassCard';
import { COLORS, SPACING, TYPE } from '../lib/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import VehicleFormModal from '../components/VehicleFormModal';

// Mock data - replace with real data later
const mockVehicles = [
  { id: '1', make: 'Toyota', model: '2020', plate: 'ABC-1234', color: 'Plateado' },
  { id: '2', make: 'Honda', model: '2019', plate: 'XYZ-5678', color: 'Azul' },
];

export default function ReserveFlowScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const parking = route?.params?.parking || { title: 'Parking Central', price: 3.5 };

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>('Hoy, 24 Oct');
  const [selectedTime, setSelectedTime] = useState<string | null>('10:00 - 12:00');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>('1');
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);

  const steps = ['Fecha', 'Vehículo', 'Pago'];

  function handleCancelFlow() {
    Alert.alert('Cancelar reserva', '¿Estás seguro que quieres salir y cancelar el proceso de reserva?', [
      { text: 'Seguir', style: 'cancel' },
      {
        text: 'Cancelar reserva',
        style: 'destructive',
        onPress: () => navigation.navigate('Map'),
      },
    ]);
  }

  function handleBack() {
    if (currentStep === 0) {
      navigation.goBack();
      return;
    }
    setCurrentStep((s) => Math.max(0, s - 1));
  }

  function handleNext() {
    // Simple validation per step
    if (currentStep === 0) {
      if (!selectedDate || !selectedTime) {
        Alert.alert('Selecciona fecha y hora', 'Por favor selecciona una fecha y hora para continuar.');
        return;
      }
    }

    if (currentStep === 1) {
      if (!selectedVehicleId) {
        Alert.alert('Selecciona vehículo', 'Elige un vehículo para continuar.');
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
      return;
    }

    // Final step -> open confirm modal
    setConfirmModalVisible(true);
  }

  async function handleConfirmReservation() {
    setProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setProcessing(false);
      setConfirmModalVisible(false);
      navigation.navigate('Map');
      Alert.alert('Reserva confirmada', 'Tu reserva se ha realizado con éxito.');
    }, 1200);
  }

  function openAddVehicle() {
    setEditingVehicle(null);
    setVehicleModalVisible(true);
  }

  function openEditVehicle(v: any) {
    setEditingVehicle(v);
    setVehicleModalVisible(true);
  }

  function handleSaveVehicle(payload: any) {
    if (payload.id) {
      setVehicles(prev => prev.map(v => v.id === payload.id ? { ...v, ...payload } : v));
    } else {
      const newVehicle = { ...payload, id: Date.now().toString() };
      setVehicles(prev => [...prev, newVehicle]);
      setSelectedVehicleId(newVehicle.id);
    }
    setVehicleModalVisible(false);
  }

  function handleDeleteVehicle(id: string) {
    Alert.alert('Eliminar vehículo', '¿Deseas eliminar este vehículo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => {
        setVehicles(prev => prev.filter(v => v.id !== id));
        if (selectedVehicleId === id) {
          setSelectedVehicleId(vehicles.length > 1 ? vehicles.find(v => v.id !== id)?.id || null : null);
        }
      }},
    ]);
  }

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleBack} style={styles.topButton}>
            <Icon name="chevron-back" size={22} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Reservar</Text>
          <TouchableOpacity onPress={handleCancelFlow} style={styles.topButton}>
            <Text style={{ color: COLORS.textMid }}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={{ paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm }}>
          <ProgressSteps steps={steps} current={currentStep} />
        </View>

        <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: insets.bottom + 80 }}>
          
          {/* Step 0: Date & Time */}
          {currentStep === 0 && (
            <>
              <Text style={styles.stepTitle}>¿Cuándo necesitas el estacionamiento?</Text>
              <GlassCard style={{ marginTop: SPACING.sm }}>
                <DateTimeSelector 
                  dateLabel={selectedDate || 'Seleccionar fecha'}
                  timeLabel={selectedTime || 'Seleccionar hora'}
                  onSelectDate={() => Alert.alert('Selector de fecha', 'Aquí iría un DatePicker')}
                  onSelectTime={() => Alert.alert('Selector de hora', 'Aquí iría un TimePicker')}
                />
              </GlassCard>
            </>
          )}

          {/* Step 1: Vehicle */}
          {currentStep === 1 && (
            <>
              <Text style={styles.stepTitle}>Selecciona tu vehículo</Text>
              {vehicles.map((v) => (
                <VehicleCard
                  key={v.id}
                  id={v.id}
                  make={v.make + (v.model ? ` • ${v.model}` : '')}
                  plate={v.plate}
                  color={v.color}
                  selected={selectedVehicleId === v.id}
                  onPress={() => setSelectedVehicleId(v.id)}
                  onEdit={() => openEditVehicle(v)}
                  onDelete={() => handleDeleteVehicle(v.id)}
                />
              ))}
              
              <View style={{ marginTop: SPACING.md }}>
                <ButtonGradient title="Agregar vehículo" variant="outline" onPress={openAddVehicle} />
              </View>
            </>
          )}

          {/* Step 2: Payment */}
          {currentStep === 2 && (
            <>
              <Text style={styles.stepTitle}>Confirmar y pagar</Text>
              
              {/* Summary */}
              <GlassCard style={{ marginTop: SPACING.sm }}>
                <Text style={styles.summaryTitle}>Resumen de reserva</Text>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Estacionamiento</Text>
                  <Text style={styles.summaryValue}>{parking.title}</Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Fecha y hora</Text>
                  <Text style={styles.summaryValue}>{selectedDate}, {selectedTime}</Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Vehículo</Text>
                  <Text style={styles.summaryValue}>{selectedVehicle?.plate}</Text>
                </View>
                
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>${parking.price?.toFixed(2) || '4.50'}</Text>
                </View>
              </GlassCard>
            </>
          )}
        </ScrollView>

        {/* Bottom CTA */}
        <View style={[styles.bottomCTA, { paddingBottom: insets.bottom + 12 }]}>
          <ButtonGradient
            title={currentStep === steps.length - 1 ? 'Confirmar reserva' : 'Continuar'}
            onPress={handleNext}
            style={{ width: '100%' }}
          />
        </View>

        {/* Confirmation Modal */}
        <Modal visible={confirmModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <GlassCard style={styles.confirmModal}>
              <Text style={styles.confirmTitle}>Confirmar reserva</Text>
              <Text style={styles.confirmText}>¿Proceder con el pago de ${parking.price?.toFixed(2) || '4.50'}?</Text>
              
              <View style={styles.confirmButtons}>
                <ButtonGradient
                  title="Cancelar"
                  variant="outline"
                  onPress={() => setConfirmModalVisible(false)}
                  style={{ flex: 1, marginRight: SPACING.sm }}
                />
                <ButtonGradient
                  title={processing ? 'Procesando...' : 'Pagar'}
                  onPress={handleConfirmReservation}
                  style={{ flex: 1 }}
                />
              </View>
            </GlassCard>
          </View>
        </Modal>

        <VehicleFormModal
          visible={vehicleModalVisible}
          onClose={() => setVehicleModalVisible(false)}
          onSave={handleSaveVehicle}
          existing={editingVehicle}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg },
  topButton: { padding: 8 },
  topTitle: { fontSize: TYPE.title, fontWeight: '700', color: COLORS.textDark },
  stepTitle: { fontSize: TYPE.title, fontWeight: '700', color: COLORS.textDark },
  summaryTitle: { fontSize: TYPE.subtitle, fontWeight: '700', color: COLORS.textDark, marginBottom: SPACING.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xs },
  summaryLabel: { color: COLORS.textMid },
  summaryValue: { color: COLORS.textDark, fontWeight: '600' },
  totalRow: { marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  totalLabel: { color: COLORS.textDark, fontWeight: '700' },
  totalValue: { color: COLORS.textDark, fontWeight: '700', fontSize: TYPE.subtitle },
  bottomCTA: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, backgroundColor: COLORS.surface },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: SPACING.lg },
  confirmModal: { padding: SPACING.lg },
  confirmTitle: { fontSize: TYPE.title, fontWeight: '700', color: COLORS.textDark, textAlign: 'center' },
  confirmText: { color: COLORS.textMid, textAlign: 'center', marginTop: SPACING.sm },
  confirmButtons: { flexDirection: 'row', marginTop: SPACING.lg },
});