// screens/ReserveFlowScreen.tsx
import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
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
import { 
  getVehiculos, 
  createVehiculo,
  getEspaciosDisponibles,
  createReserva,
  getTarifasByParkingId,
  Espacio,
  Tarifa
} from '../lib/api';

export default function ReserveFlowScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const parking = route?.params?.parking || { title: 'Parking Central', price: 3.5 };

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>('Hoy, 24 Oct');
  const [selectedTime, setSelectedTime] = useState<string | null>('10:00 - 12:00');
  const [selectedEspacioId, setSelectedEspacioId] = useState<number | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [selectedTarifaId, setSelectedTarifaId] = useState<number | null>(null);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingEspacios, setLoadingEspacios] = useState(true);
  const [loadingTarifas, setLoadingTarifas] = useState(true);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);

    const steps = ['Tarifa', 'Espacio', 'Vehículo', 'Confirmación'];

  useEffect(() => {
    loadVehicles();
    loadEspacios();
    loadTarifas();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoadingVehicles(true);
      const data = await getVehiculos();
      setVehicles(data);
      
      // Seleccionar el primer vehículo por defecto si hay alguno
      if (data.length > 0 && !selectedVehicleId) {
        setSelectedVehicleId(data[0].id_vehiculo);
      }
    } catch (error) {
      console.error('[ReserveFlow] Error cargando vehículos:', error);
      Alert.alert('Error', 'No se pudieron cargar tus vehículos');
    } finally {
      setLoadingVehicles(false);
    }
  };

  const loadEspacios = async () => {
    try {
      setLoadingEspacios(true);
      const parkingId = parking.id || parking.id_parking;
      const data = await getEspaciosDisponibles(parkingId);
      setEspacios(data);
      
      // Seleccionar el primer espacio por defecto
      if (data.length > 0 && !selectedEspacioId) {
        setSelectedEspacioId(data[0].id_espacio);
      }
    } catch (error) {
      console.error('[ReserveFlow] Error cargando espacios:', error);
      Alert.alert('Error', 'No se pudieron cargar los espacios disponibles');
    } finally {
      setLoadingEspacios(false);
    }
  };

  const loadTarifas = async () => {
    try {
      setLoadingTarifas(true);
      const parkingId = parking.id || parking.id_parking;
      const data = await getTarifasByParkingId(parkingId);
      setTarifas(data);
      
      // Seleccionar la primera tarifa por defecto (preferiblemente 'hora')
      if (data.length > 0 && !selectedTarifaId) {
        const tarifaHora = data.find(t => t.tipo.toLowerCase() === 'hora');
        setSelectedTarifaId(tarifaHora ? tarifaHora.id_tarifa : data[0].id_tarifa);
      }
    } catch (error) {
      console.error('[ReserveFlow] Error cargando tarifas:', error);
      Alert.alert('Error', 'No se pudieron cargar las tarifas del estacionamiento');
    } finally {
      setLoadingTarifas(false);
    }
  };

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
    // Validaciones por paso
    if (currentStep === 0) {
        if (!selectedTarifaId) {
          Alert.alert('Selecciona una tarifa', 'Por favor selecciona el tipo de tarifa para continuar.');
        return;
      }
    }

    if (currentStep === 1) {
      if (!selectedEspacioId) {
        Alert.alert('Selecciona espacio', 'Elige un espacio de estacionamiento para continuar.');
        return;
      }
    }

    if (currentStep === 2) {
      if (!selectedVehicleId) {
        Alert.alert('Selecciona vehículo', 'Elige un vehículo para continuar.');
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
      return;
    }

    // Último paso -> abrir modal de confirmación
    setConfirmModalVisible(true);
  }

  async function handleConfirmReservation() {
    if (!selectedEspacioId || !selectedVehicleId) {
      Alert.alert('Error', 'Faltan datos para completar la reserva');
      return;
    }

    try {
      setProcessing(true);
      
      // Crear fechas ISO desde los datos seleccionados
      // Para testing: reserva inmediata (ahora mismo)
      const now = new Date();
      const fecha_inicio = now; // Ahora mismo (para testing)
      const fecha_fin = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 horas desde ahora

      const reservaCreada = await createReserva({
        id_espacio: selectedEspacioId,
        id_vehiculo: selectedVehicleId,
        fecha_inicio: fecha_inicio.toISOString(),
        fecha_fin: fecha_fin.toISOString(),
        id_tarifa: selectedTarifaId || undefined, // Enviar id_tarifa si está seleccionado
      });

      setProcessing(false);
      setConfirmModalVisible(false);
      
      // Navegar a pantalla de confirmación con datos de la reserva
      navigation.navigate('ReservationConfirmed', { 
        reserva: reservaCreada,
        parking,
        espacio: espacios.find(e => e.id_espacio === selectedEspacioId),
        vehiculo: vehicles.find(v => v.id_vehiculo === selectedVehicleId),
      });
      
    } catch (error: any) {
      setProcessing(false);
      setConfirmModalVisible(false);
      
      // Extraer mensaje del servidor o usar mensaje por defecto
      const errorMessage = error.response?.data?.message || 'No se pudo completar la reserva. Intenta nuevamente.';
      
      console.log('[ReserveFlow] Error creando reserva:', errorMessage);
      
      // Si ya tiene una reserva activa, mostrar mensaje específico
      if (error.response?.status === 400 && errorMessage.includes('reserva activa')) {
        Alert.alert(
          'Reserva activa', 
          errorMessage + '\n\nPuedes ver y gestionar tu reserva desde "Mis Reservas".',
          [
            { text: 'Ir a Mis Reservas', onPress: () => navigation.navigate('MyReservations' as never) },
            { text: 'Cerrar', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
    }
  }

  function openAddVehicle() {
    setEditingVehicle(null);
    setVehicleModalVisible(true);
  }

  function openEditVehicle(v: any) {
    setEditingVehicle(v);
    setVehicleModalVisible(true);
  }

  async function handleSaveVehicle(payload: any) {
    try {
      if (payload.id) {
        // TODO: Implementar updateVehiculo en la API
        setVehicles(prev => prev.map(v => v.id_vehiculo === payload.id ? { ...v, ...payload } : v));
      } else {
        const newVehicle = await createVehiculo({
          marca: payload.make,
          modelo: payload.model,
          placa: payload.plate,
          color: payload.color,
        });
        setVehicles(prev => [...prev, newVehicle]);
        setSelectedVehicleId(newVehicle.id_vehiculo);
      }
      setVehicleModalVisible(false);
    } catch (error) {
      console.error('[ReserveFlow] Error guardando vehículo:', error);
      Alert.alert('Error', 'No se pudo guardar el vehículo');
    }
  }

  function handleDeleteVehicle(id: number) {
    Alert.alert('Eliminar vehículo', '¿Deseas eliminar este vehículo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => {
        // TODO: Llamar a deleteVehiculo de la API
        setVehicles(prev => prev.filter(v => v.id_vehiculo !== id));
        if (selectedVehicleId === id) {
          setSelectedVehicleId(vehicles.length > 1 ? vehicles.find(v => v.id_vehiculo !== id)?.id_vehiculo || null : null);
        }
      }},
    ]);
  }

  const selectedVehicle = vehicles.find((v) => v.id_vehiculo === selectedVehicleId);

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
              <Text style={styles.stepTitle}>Selecciona tipo de tarifa</Text>
              
              {/* Selector de Tarifa */}
              {loadingTarifas ? (
                <View style={{ padding: SPACING.xl, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={[styles.summaryLabel, { marginTop: SPACING.sm }]}>
                    Cargando tarifas...
                  </Text>
                </View>
              ) : tarifas.length === 0 ? (
                <GlassCard style={{ marginTop: SPACING.sm }}>
                  <Text style={[styles.summaryLabel, { textAlign: 'center' }]}>
                    No hay tarifas disponibles
                  </Text>
                </GlassCard>
              ) : (
                <View style={{ marginTop: SPACING.sm }}>
                  {tarifas.map((tarifa) => (
                    <TouchableOpacity
                      key={tarifa.id_tarifa}
                      style={[
                        styles.tarifaCard,
                        selectedTarifaId === tarifa.id_tarifa && styles.tarifaCardSelected
                      ]}
                      onPress={() => setSelectedTarifaId(tarifa.id_tarifa)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[
                          styles.tarifaTipo,
                          selectedTarifaId === tarifa.id_tarifa && styles.tarifaTipoSelected
                        ]}>
                          {tarifa.tipo.charAt(0).toUpperCase() + tarifa.tipo.slice(1)}
                        </Text>
                        <Text style={styles.tarifaMonto}>
                          S/ {tarifa.monto.toFixed(2)}
                        </Text>
                        {tarifa.condiciones && (
                          <Text style={styles.tarifaCondiciones}>
                            {tarifa.condiciones}
                          </Text>
                        )}
                      </View>
                      {selectedTarifaId === tarifa.id_tarifa && (
                        <Icon name="checkmark-circle" size={24} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <GlassCard style={{ marginTop: SPACING.md }}>
                <View style={{ padding: SPACING.md }}>
                  <Text style={[styles.summaryLabel, { textAlign: 'center', fontSize: 15 }]}>
                    Tu reserva será efectiva inmediatamente
                  </Text>
                  <Text style={[styles.summaryValue, { textAlign: 'center', marginTop: SPACING.xs }]}>
                    {new Date().toLocaleString('es-PE', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
              </GlassCard>
            </>
          )}

          {/* Step 1: Espacio */}
          {currentStep === 1 && (
            <>
              <Text style={styles.stepTitle}>Selecciona un espacio</Text>
              {loadingEspacios ? (
                <View style={{ padding: SPACING.xl, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={[styles.summaryLabel, { marginTop: SPACING.sm }]}>
                    Cargando espacios disponibles...
                  </Text>
                </View>
              ) : espacios.length === 0 ? (
                <GlassCard style={{ marginTop: SPACING.sm }}>
                  <Text style={[styles.summaryLabel, { textAlign: 'center' }]}>
                    No hay espacios disponibles en este momento
                  </Text>
                </GlassCard>
              ) : (
                <View style={{ marginTop: SPACING.sm }}>
                  {espacios.map((espacio) => (
                    <TouchableOpacity
                      key={espacio.id_espacio}
                      style={[
                        styles.espacioCard,
                        selectedEspacioId === espacio.id_espacio && styles.espacioCardSelected
                      ]}
                      onPress={() => setSelectedEspacioId(espacio.id_espacio)}
                    >
                      <View style={styles.espacioIcon}>
                        <Icon 
                          name="car-sport" 
                          size={24} 
                          color={selectedEspacioId === espacio.id_espacio ? COLORS.primary : COLORS.textMid} 
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[
                          styles.espacioNumber,
                          selectedEspacioId === espacio.id_espacio && styles.espacioNumberSelected
                        ]}>
                          Espacio {espacio.numero_espacio}
                        </Text>
                        <Text style={styles.espacioStatus}>
                          {espacio.estado === 'disponible' ? 'Disponible ahora' : espacio.estado}
                        </Text>
                      </View>
                      {selectedEspacioId === espacio.id_espacio && (
                        <Icon name="checkmark-circle" size={24} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}

          {/* Step 2: Vehicle */}
          {currentStep === 2 && (
            <>
              <Text style={styles.stepTitle}>Selecciona tu vehículo</Text>
              {loadingVehicles ? (
                <View style={{ padding: SPACING.xl, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={[styles.summaryLabel, { marginTop: SPACING.sm }]}>
                    Cargando tus vehículos...
                  </Text>
                </View>
              ) : vehicles.length === 0 ? (
                <GlassCard style={{ marginTop: SPACING.sm }}>
                  <Text style={[styles.summaryLabel, { textAlign: 'center', marginBottom: SPACING.md }]}>
                    No tienes vehículos registrados
                  </Text>
                  <ButtonGradient title="Agregar primer vehículo" onPress={openAddVehicle} />
                </GlassCard>
              ) : (
                <>
                  {vehicles.map((v) => (
                    <VehicleCard
                      key={v.id_vehiculo}
                      id={v.id_vehiculo.toString()}
                      make={v.marca + (v.modelo ? ` • ${v.modelo}` : '')}
                      plate={v.placa}
                      color={v.color}
                      selected={selectedVehicleId === v.id_vehiculo}
                      onPress={() => setSelectedVehicleId(v.id_vehiculo)}
                      onEdit={() => openEditVehicle(v)}
                      onDelete={() => handleDeleteVehicle(v.id_vehiculo)}
                    />
                  ))}
                  
                  <View style={{ marginTop: SPACING.md }}>
                    <ButtonGradient title="Agregar vehículo" variant="outline" onPress={openAddVehicle} />
                  </View>
                </>
              )}
            </>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <>
              <Text style={styles.stepTitle}>Confirmar y pagar</Text>
              
              {/* Summary */}
              <GlassCard style={{ marginTop: SPACING.sm }}>
                <Text style={styles.summaryTitle}>Resumen de reserva</Text>
                
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tipo de tarifa</Text>
                    <Text style={styles.summaryValue}>
                      {tarifas.find(t => t.id_tarifa === selectedTarifaId)?.tipo.charAt(0).toUpperCase() + 
                       tarifas.find(t => t.id_tarifa === selectedTarifaId)?.tipo.slice(1) || 'N/A'}
                    </Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tarifa base</Text>
                    <Text style={styles.summaryValue}>
                      S/ {tarifas.find(t => t.id_tarifa === selectedTarifaId)?.monto.toFixed(2) || '0.00'}
                    </Text>
                  </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Estacionamiento</Text>
                  <Text style={styles.summaryValue}>{parking.title}</Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Espacio</Text>
                  <Text style={styles.summaryValue}>
                    {espacios.find(e => e.id_espacio === selectedEspacioId)?.numero_espacio || 'N/A'}
                  </Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Fecha y hora</Text>
                  <Text style={styles.summaryValue}>
                    {new Date().toLocaleString('es-PE', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
                
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Vehículo</Text>
                  <Text style={styles.summaryValue}>{selectedVehicle?.placa}</Text>
                </View>
              </GlassCard>
              
              <GlassCard style={{ marginTop: SPACING.md, padding: SPACING.md }}>
                <Text style={{ fontSize: 13, color: COLORS.textMid, lineHeight: 20 }}>
                  ℹ️ Esta reserva garantiza tu espacio de forma gratuita. El pago se realizará cuando salgas del estacionamiento, 
                  según el tiempo real que uses el espacio.
                </Text>
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
              <Text style={styles.confirmText}>
                ¿Deseas confirmar esta reserva? Tu espacio quedará apartado y pagarás al salir del estacionamiento.
              </Text>
              
              <View style={styles.confirmButtons}>
                <ButtonGradient
                  title="Cancelar"
                  variant="outline"
                  onPress={() => setConfirmModalVisible(false)}
                  style={{ flex: 1, marginRight: SPACING.sm }}
                />
                <ButtonGradient
                  title={processing ? 'Procesando...' : 'Confirmar'}
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
  topTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textDark },
  stepTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textDark },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: SPACING.sm },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xs },
  summaryLabel: { color: COLORS.textMid },
  summaryValue: { color: COLORS.textDark, fontWeight: '600' },
  totalRow: { marginTop: SPACING.sm, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  totalLabel: { color: COLORS.textDark, fontWeight: '700' },
  totalValue: { color: COLORS.textDark, fontWeight: '700', fontSize: 16 },
  // Estilos para tarjetas de espacios
  espacioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  espacioCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(102,126,234,0.05)',
  },
  espacioIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'rgba(102,126,234,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  espacioNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  espacioNumberSelected: {
    color: COLORS.primary,
  },
  espacioStatus: {
    fontSize: 13,
    color: COLORS.textMid,
    marginTop: 2,
  },
    // Estilos para tarjetas de tarifa
    tarifaCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: SPACING.md,
      marginBottom: SPACING.sm,
      borderRadius: 12,
      backgroundColor: COLORS.surface,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    tarifaCardSelected: {
      borderColor: COLORS.primary,
      backgroundColor: 'rgba(102,126,234,0.05)',
    },
    tarifaTipo: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.textDark,
    },
    tarifaTipoSelected: {
      color: COLORS.primary,
    },
    tarifaMonto: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.primary,
      marginTop: 4,
    },
    tarifaCondiciones: {
      fontSize: 12,
      color: COLORS.textMid,
      marginTop: 4,
    },
  // Estilos de modal
  bottomCTA: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, backgroundColor: COLORS.surface },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: SPACING.lg },
    confirmModal: { padding: SPACING.lg },
    confirmTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textDark, textAlign: 'center' },
    confirmText: { color: COLORS.textMid, textAlign: 'center', marginTop: SPACING.sm },
    confirmButtons: { flexDirection: 'row', marginTop: SPACING.lg },
});