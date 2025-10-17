// screens/ReservationConfirmedScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import ButtonGradient from '../components/ButtonGradient';
import GlassCard from '../components/GlassCard';
import { COLORS, SPACING, TYPE } from '../lib/theme';
import { marcarEntrada } from '../lib/api';

export default function ReservationConfirmedScreen({ navigation, route }: any) {
  const { reserva, parking, espacio, vehiculo } = route?.params || {};
  const [processing, setProcessing] = useState(false);

  if (!reserva) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorText}>No se encontró información de la reserva</Text>
          <ButtonGradient title="Volver al inicio" onPress={() => navigation.navigate('Map')} />
        </View>
      </SafeAreaView>
    );
  }

  const handleMarcarLlegada = async () => {
    Alert.alert(
      '¿Has llegado al parking?',
      'Al marcar tu llegada, comenzará a correr el tiempo de tu estacionamiento.',
      [
        { text: 'Aún no', style: 'cancel' },
        {
          text: 'Sí, he llegado',
          onPress: async () => {
            try {
              setProcessing(true);
              const resultado = await marcarEntrada(reserva.id_reserva);
              
              Alert.alert(
                '¡Entrada registrada!',
                'Tu tiempo de estacionamiento ha comenzado.',
                [
                  {
                    text: 'Ver detalles',
                    onPress: () => navigation.navigate('ActiveParking', { 
                      id_ocupacion: resultado.id_ocupacion 
                    }),
                  },
                ]
              );
            } catch (error: any) {
              console.error('[ReservationConfirmed] Error al marcar entrada:', error);
              Alert.alert(
                'Error',
                error.response?.data?.message || 'No se pudo registrar tu entrada. Intenta nuevamente.'
              );
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('es-PE', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header de éxito */}
        <View style={styles.successHeader}>
          <View style={styles.iconContainer}>
            <Icon name="checkmark-circle" size={80} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>¡Reserva Exitosa!</Text>
          <Text style={styles.successSubtitle}>
            Tu espacio ha sido reservado
          </Text>
        </View>

        {/* Detalles de la reserva */}
        <GlassCard style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Icon name="business-outline" size={20} color={COLORS.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Parking</Text>
              <Text style={styles.detailValue}>{String(parking?.nombre || 'N/A')}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Icon name="location-outline" size={20} color={COLORS.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Dirección</Text>
              <Text style={styles.detailValue}>{String(parking?.direccion || 'N/A')}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Icon name="car-sport-outline" size={20} color={COLORS.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Espacio</Text>
              <Text style={styles.detailValue}>{String(espacio?.numero_espacio || 'N/A')}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Icon name="car-outline" size={20} color={COLORS.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Vehículo</Text>
              <Text style={styles.detailValue}>
                {vehiculo ? `${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.placa}` : 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Icon name="calendar-outline" size={20} color={COLORS.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Inicio estimado</Text>
              <Text style={styles.detailValue}>{formatDate(reserva?.hora_inicio || '')}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <Icon name="time-outline" size={20} color={COLORS.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Fin estimado</Text>
              <Text style={styles.detailValue}>{formatDate(reserva?.hora_fin || '')}</Text>
            </View>
          </View>
        </GlassCard>

        {/* Información importante */}
        <GlassCard style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Icon name="information-circle-outline" size={24} color={COLORS.warning} />
            <Text style={styles.infoTitle}>Importante</Text>
          </View>
          <Text style={styles.infoText}>
            • Cuando llegues físicamente al parking, presiona "He llegado" para iniciar el conteo de tiempo.{'\n\n'}
            • El costo se calculará según el tiempo real de uso.{'\n\n'}
            • Recuerda marcar tu salida al finalizar.
          </Text>
        </GlassCard>

        {/* Botones de acción */}
        <View style={styles.actions}>
          <ButtonGradient
            title={processing ? 'Registrando...' : 'He llegado al parking'}
            onPress={handleMarcarLlegada}
            disabled={processing}
            style={styles.primaryButton}
          />

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Map')}
            disabled={processing}
          >
            <Text style={styles.secondaryButtonText}>Ir al mapa</Text>
          </TouchableOpacity>
        </View>
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
  successHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconContainer: {
    marginBottom: SPACING.md,
  },
  successTitle: {
    ...TYPE.h1,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  successSubtitle: {
    ...TYPE.body,
    color: COLORS.textSecondary,
  },
  detailsCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  infoCard: {
    marginBottom: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.warningLight,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  infoTitle: {
    ...TYPE.h3,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  infoText: {
    ...TYPE.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  actions: {
    gap: SPACING.md,
  },
  primaryButton: {
    marginBottom: 0,
  },
  secondaryButton: {
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...TYPE.body,
    color: COLORS.text,
    fontWeight: '600',
  },
});
