// MyReservationsScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, RADIUS } from '../lib/theme';
import GlassCard from '../components/GlassCard';
import { getMisReservas, cancelarReserva, type Reserva } from '../lib/api';

export default function MyReservationsScreen() {
  const navigation = useNavigation();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReservas = async () => {
    try {
      const data = await getMisReservas();
      console.log('[MyReservations] Reservas cargadas:', JSON.stringify(data, null, 2));
      setReservas(data);
    } catch (error) {
      console.error('[MyReservations] Error cargando reservas:', error);
      Alert.alert('Error', 'No se pudieron cargar tus reservas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadReservas();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadReservas();
  };

  const handleCancelar = (reserva: Reserva) => {
    Alert.alert(
      'Cancelar reserva',
      `¿Estás seguro de cancelar la reserva en ${reserva.espacio?.parking.nombre}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelarReserva(reserva.id_reserva);
              Alert.alert('Éxito', 'Reserva cancelada correctamente');
              loadReservas();
            } catch (error) {
              console.error('[MyReservations] Error cancelando:', error);
              Alert.alert('Error', 'No se pudo cancelar la reserva');
            }
          },
        },
      ]
    );
  };

  const handleVerDetalle = (reserva: Reserva) => {
    if (reserva.estado === 'activa') {
      navigation.navigate('ReservationConfirmed' as never, { reserva } as never);
    }
  };

  const formatFecha = (fecha: string) => {
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fecha;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activa': return '#10b981';
      case 'completada': return '#6b7280';
      case 'cancelada': return '#ef4444';
      default: return COLORS.textMid;
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'activa': return 'Activa';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      default: return estado;
    }
  };

  const reservaActiva = reservas.find(r => r.estado === 'activa');
  const historial = reservas.filter(r => r.estado !== 'activa');

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis Reservas</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Reservas</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Reserva Activa */}
        {reservaActiva && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reserva Activa</Text>
            <GlassCard style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.parkingInfo}>
                  <Icon name="car" size={20} color={COLORS.primary} />
                  <Text style={styles.parkingName}>
                    {reservaActiva.espacio?.parking.nombre}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: getEstadoColor('activa') + '20' }]}>
                  <Text style={[styles.badgeText, { color: getEstadoColor('activa') }]}>
                    Activa
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Icon name="location" size={16} color={COLORS.textMid} />
                  <Text style={styles.infoText}>
                    Espacio {reservaActiva.espacio?.numero_espacio}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="car-sport" size={16} color={COLORS.textMid} />
                  <Text style={styles.infoText}>
                    {reservaActiva.vehiculo?.placa} - {reservaActiva.vehiculo?.marca}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Icon name="time" size={16} color={COLORS.textMid} />
                  <Text style={styles.infoText}>
                    {formatFecha(reservaActiva.hora_inicio)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary]}
                  onPress={() => handleVerDetalle(reservaActiva)}
                >
                  <Text style={styles.buttonTextPrimary}>Ver Detalles</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.buttonOutline]}
                  onPress={() => handleCancelar(reservaActiva)}
                >
                  <Text style={styles.buttonTextOutline}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </View>
        )}

        {/* Historial */}
        {historial.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historial</Text>
            {historial.map((reserva) => (
              <GlassCard key={reserva.id_reserva} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.parkingInfo}>
                    <Icon name="car" size={18} color={COLORS.textMid} />
                    <Text style={styles.parkingName}>
                      {reserva.espacio?.parking.nombre}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: getEstadoColor(reserva.estado) + '20' }]}>
                    <Text style={[styles.badgeText, { color: getEstadoColor(reserva.estado) }]}>
                      {getEstadoTexto(reserva.estado)}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.historyDate}>
                    {formatFecha(reserva.fecha_reserva)}
                  </Text>
                  <Text style={styles.historyInfo}>
                    Espacio {reserva.espacio?.numero_espacio} • {reserva.vehiculo?.placa}
                  </Text>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {reservas.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="calendar-outline" size={64} color={COLORS.textMid} />
            <Text style={styles.emptyTitle}>No tienes reservas</Text>
            <Text style={styles.emptyText}>
              Encuentra un estacionamiento en el mapa y haz tu primera reserva
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: SPACING.lg },
  section: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: SPACING.md,
  },
  card: { marginBottom: SPACING.md, padding: SPACING.lg },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  parkingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  parkingName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cardBody: { marginBottom: SPACING.md },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  infoText: { fontSize: 14, color: COLORS.textMid, marginLeft: SPACING.sm },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADIUS.medium,
    alignItems: 'center',
  },
  buttonPrimary: { backgroundColor: COLORS.primary },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.textMid,
  },
  buttonTextPrimary: { fontSize: 14, fontWeight: '600', color: '#fff' },
  buttonTextOutline: { fontSize: 14, fontWeight: '600', color: COLORS.textMid },
  historyDate: {
    fontSize: 13,
    color: COLORS.textMid,
    marginBottom: 4,
  },
  historyInfo: { fontSize: 14, color: COLORS.textDark },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMid,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
});
