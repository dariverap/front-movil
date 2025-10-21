// screens/ActiveParkingScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import ButtonGradient from '../components/ButtonGradient';
import GlassCard from '../components/GlassCard';
import { COLORS, SPACING, TYPE } from '../lib/theme';
import { getOcupacionActiva, marcarSalida, solicitarSalida } from '../lib/api';

export default function ActiveParkingScreen({ navigation, route }: any) {
  const [ocupacion, setOcupacion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [salidaSolicitada, setSalidaSolicitada] = useState(false);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [costoActual, setCostoActual] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadOcupacion();
      const interval = setInterval(() => {
        updateTiempoYCosto();
      }, 60000); // Actualizar cada minuto

      return () => clearInterval(interval);
    }, [])
  );

  const loadOcupacion = async () => {
    try {
      setLoading(true);
      const data = await getOcupacionActiva();
      
      if (!data) {
        Alert.alert(
          'Sin ocupación activa',
          'No tienes ningún estacionamiento activo en este momento.',
          [{ text: 'OK', onPress: () => navigation.navigate('Map') }]
        );
        return;
      }

      // En algunos casos el cliente puede recibir {success, data}
      const payload: any = (data && (data as any).success !== undefined && (data as any).data !== undefined)
        ? (data as any).data
        : data;

      setOcupacion(payload);
      if (payload) {
        calculateTiempoYCosto(payload);
        if (payload.hora_salida_solicitada) {
          setSalidaSolicitada(true);
        }
      }
      console.log('[ActiveParking] Ocupación cargada:', JSON.stringify(payload ?? data, null, 2));
    } catch (error) {
      console.error('[ActiveParking] Error cargando ocupación:', error);
      Alert.alert('Error', 'No se pudo cargar la información del estacionamiento.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOcupacion();
    setRefreshing(false);
  };

  const calculateTiempoYCosto = (data: any) => {
    if (!data.hora_entrada) return;

    const entrada = new Date(data.hora_entrada);
    const ahora = new Date();
    const horasTranscurridas = (ahora.getTime() - entrada.getTime()) / (1000 * 60 * 60);
    
    setTiempoTranscurrido(horasTranscurridas);

    // Calcular costo (fracción hacia arriba)
    const tarifa = data.tarifa_hora || 4.0;
    const fracciones = Math.ceil(horasTranscurridas);
    setCostoActual(fracciones * tarifa);
  };

  const updateTiempoYCosto = () => {
    if (ocupacion) {
      calculateTiempoYCosto(ocupacion);
    }
  };

  const handleMarcarSalida = () => {
    Alert.alert(
      '¿Marcar salida?',
      `Se te cobrará S/ ${costoActual.toFixed(2)} por ${formatHoras(tiempoTranscurrido)} de uso.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Marcar salida',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              const resultado = await marcarSalida(ocupacion.id_ocupacion);
              
              Alert.alert(
                '¡Salida registrada!',
                `Tiempo total: ${resultado.tiempo_total_horas.toFixed(2)} horas\nCosto: S/ ${resultado.costo_calculado.toFixed(2)}`,
                [
                  {
                    text: 'Ver historial',
                    onPress: () => navigation.navigate('History'),
                  },
                  {
                    text: 'Ir al inicio',
                    onPress: () => navigation.navigate('Map'),
                  },
                ]
              );
            } catch (error: any) {
              console.error('[ActiveParking] Error al marcar salida:', error);
              Alert.alert(
                'Error',
                error.response?.data?.message || 'No se pudo registrar tu salida. Intenta nuevamente.'
              );
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleSolicitarSalida = () => {
    if (!ocupacion || !ocupacion.id_ocupacion) {
      Alert.alert('Error', 'No se pudo obtener la información de la ocupación. Intenta recargar la pantalla.');
      return;
    }

    Alert.alert(
      '¿Solicitar salida?',
      `Monto a pagar: S/ ${costoActual.toFixed(2)}\nTiempo: ${formatHoras(tiempoTranscurrido)}\n\nDirígete a caja para validar el pago.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Solicitar salida',
          onPress: async () => {
            try {
              setProcessing(true);
              console.log('[ActiveParking] Solicitando salida para ocupación:', ocupacion.id_ocupacion);
              const resultado = await solicitarSalida(ocupacion.id_ocupacion);
              setSalidaSolicitada(true);
              // Actualizar ocupacion en memoria para reflejar la bandera
              setOcupacion((prev: any) => prev ? { ...prev, hora_salida_solicitada: new Date().toISOString() } : prev);
              Alert.alert(
                'Salida solicitada',
                `Monto: S/ ${resultado.monto.toFixed(2)}\nTiempo: ${Math.floor(resultado.tiempo_minutos / 60)}h ${resultado.tiempo_minutos % 60}m\n\nDirígete a caja para validar el pago y poder salir.`,
                [
                  {
                    text: 'Entendido',
                    onPress: () => navigation.navigate('Map'),
                  },
                ]
              );
            } catch (error: any) {
              console.error('[ActiveParking] Error al solicitar salida:', error);
              Alert.alert(
                'Error',
                error.response?.data?.message || 'No se pudo solicitar la salida. Intenta nuevamente.'
              );
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const formatHoras = (horas: number): string => {
    const h = Math.floor(horas);
    const m = Math.round((horas - h) * 60);
    
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} h`;
    return `${h} h ${m} min`;
  };

  const formatFecha = (dateString: string): string => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando información...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!ocupacion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="car-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.errorText}>No hay estacionamiento activo</Text>
          <ButtonGradient title="Volver al mapa" onPress={() => navigation.navigate('Map')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Header con estado */}
        <View style={styles.header}>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Estacionamiento activo</Text>
          </View>
        </View>

        {/* Tarjeta principal: Tiempo y costo */}
        <GlassCard style={styles.mainCard}>
          <View style={styles.timerSection}>
            <Icon name="time-outline" size={32} color={COLORS.primary} />
            <Text style={styles.timerLabel}>Tiempo transcurrido</Text>
            <Text style={styles.timerValue}>{formatHoras(tiempoTranscurrido)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.costSection}>
            <Icon name="cash-outline" size={32} color={COLORS.success} />
            <Text style={styles.costLabel}>Costo actual</Text>
            <Text style={styles.costValue}>S/ {costoActual.toFixed(2)}</Text>
            <Text style={styles.costNote}>
              Tarifa: S/ {(ocupacion.tarifa_hora || 4.0).toFixed(2)}/hora
            </Text>
          </View>
        </GlassCard>

        {/* Detalles del parking */}
        <GlassCard style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Detalles del estacionamiento</Text>

          <View style={styles.detailRow}>
            <Icon name="business-outline" size={20} color={COLORS.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Parking</Text>
              <Text style={styles.detailValue}>{String(ocupacion.parking || 'N/A')}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="car-sport-outline" size={20} color={COLORS.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Espacio</Text>
              <Text style={styles.detailValue}>{String(ocupacion.numero_espacio || 'N/A')}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="car-outline" size={20} color={COLORS.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Vehículo</Text>
              <Text style={styles.detailValue}>
                {ocupacion.vehiculo_placa || 'N/A'}
              </Text>
              {(ocupacion.vehiculo_marca || ocupacion.vehiculo_modelo) && (
                <Text style={styles.detailSubtext}>
                  {ocupacion.vehiculo_marca} {ocupacion.vehiculo_modelo}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="log-in-outline" size={20} color={COLORS.textSecondary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Hora de entrada</Text>
              <Text style={styles.detailValue}>
                {formatFecha(ocupacion.hora_entrada || '')}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Información */}
        <GlassCard style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Icon name="information-circle-outline" size={20} color={COLORS.info} />
            <Text style={styles.infoTitle}>Información importante</Text>
          </View>
          <Text style={styles.infoText}>
            {ocupacion.estado === 'finalizada' 
              ? 'Tu reserva ha sido completada. Puedes revisar los detalles en tu historial.'
              : 'Estás estacionado en el parking. El personal se encargará de procesar tu salida cuando estés listo para irte.'}
          </Text>
        </GlassCard>

        {/* Botón de salida - COMENTADO (Ahora el admin procesa la salida desde web) */}
        {/* 
        <ButtonGradient
          title={processing ? 'Procesando...' : 'Solicitar salida'}
          onPress={handleSolicitarSalida}
          disabled={processing || salidaSolicitada}
          style={styles.exitButton}
        />
        */}

        {/* Mensaje de estado */}
        <GlassCard style={[styles.infoCard, { backgroundColor: ocupacion.estado === 'finalizada' ? COLORS.successLight : COLORS.infoLight }]}>
          <View style={styles.infoHeader}>
            <Icon 
              name={ocupacion.estado === 'finalizada' ? 'checkmark-circle-outline' : 'time-outline'} 
              size={24} 
              color={ocupacion.estado === 'finalizada' ? COLORS.success : COLORS.info} 
            />
            <Text style={[styles.infoTitle, { color: ocupacion.estado === 'finalizada' ? COLORS.success : COLORS.info }]}>
              {ocupacion.estado === 'finalizada' ? 'Reserva completada' : 'En el parking'}
            </Text>
          </View>
          <Text style={styles.infoText}>
            {ocupacion.estado === 'finalizada'
              ? 'Puedes salir del parking. Gracias por usar nuestro servicio.'
              : 'Cuando estés listo para salir, dirígete a la salida. El personal procesará tu pago.'}
          </Text>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPE.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    ...TYPE.body,
    color: COLORS.textSecondary,
    marginVertical: SPACING.lg,
    textAlign: 'center',
  },
  header: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: SPACING.sm,
  },
  statusText: {
    ...TYPE.small,
    color: COLORS.success,
    fontWeight: '600',
  },
  mainCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.xl,
  },
  timerSection: {
    alignItems: 'center',
  },
  timerLabel: {
    ...TYPE.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  timerValue: {
    ...TYPE.h1,
    fontSize: 48,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  costSection: {
    alignItems: 'center',
  },
  costLabel: {
    ...TYPE.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  costValue: {
    ...TYPE.h1,
    fontSize: 40,
    color: COLORS.success,
    marginTop: SPACING.xs,
  },
  costNote: {
    ...TYPE.small,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  detailsCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  sectionTitle: {
    ...TYPE.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  detailContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  detailLabel: {
    ...TYPE.small,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    ...TYPE.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  detailSubtext: {
    ...TYPE.small,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  infoCard: {
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.infoLight,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoTitle: {
    ...TYPE.body,
    color: COLORS.text,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  infoText: {
    ...TYPE.small,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  exitButton: {
    marginBottom: 0,
  },
});
