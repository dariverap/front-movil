// screens/ParkingDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, RADIUS, TYPE } from '../lib/theme';
import GlassCard from '../components/GlassCard';
import RatingStars from '../components/RatingStars';
import ButtonGradient from '../components/ButtonGradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { getTarifasByParkingId, Tarifa } from '../lib/api';

export default function ParkingDetailScreen({ navigation, route }: any) {
  const parking = route?.params?.parking || {
    title: 'Parking Central',
    price: 3.5,
    rating: 4.6,
    reviews: 124,
    address: 'Dirección no disponible',
    capacity: 0
  };

  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [loadingTarifas, setLoadingTarifas] = useState(true);
  const [tarifaHora, setTarifaHora] = useState<number | null>(null);

  useEffect(() => {
    loadTarifas();
  }, []);

  const loadTarifas = async () => {
    try {
      setLoadingTarifas(true);
      const data = await getTarifasByParkingId(parking.id || parking.id_parking);
      setTarifas(data);
      
      // Buscar tarifa por hora (la más común)
      const tarifaPorHora = data.find(t => t.tipo?.toLowerCase().includes('hora'));
      if (tarifaPorHora) {
        setTarifaHora(tarifaPorHora.monto);
      } else if (data.length > 0) {
        // Si no hay tarifa por hora, usar la primera disponible
        setTarifaHora(data[0].monto);
      }
    } catch (error) {
      console.error('[ParkingDetailScreen] Error cargando tarifas:', error);
      // Mantener el precio por defecto si falla
    } finally {
      setLoadingTarifas(false);
    }
  };

  function handleCancel() {
    Alert.alert('Salir', '¿Quieres volver y cancelar?', [
      { text: 'Seguir', style: 'cancel' },
      { text: 'Sí, salir', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topButton}>
            <Icon name="chevron-back" size={22} color={COLORS.textDark} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleCancel} style={styles.topButton}>
            <Text style={{ color: COLORS.textMid }}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Header with gradient overlay */}
          <View style={styles.headerImage}>
            <LinearGradient 
              colors={['rgba(118,75,162,0.6)', 'rgba(102,126,234,0.2)']} 
              style={StyleSheet.absoluteFill} 
            />
            <View style={styles.headerContent}>
              <Text style={styles.title}>{parking.title}</Text>
              <RatingStars rating={parking.rating || 4.6} count={parking.reviews || 124} />
            </View>
          </View>

          <View style={styles.content}>
            <GlassCard>
              <View style={styles.infoRow}>
                <View style={styles.iconWrap}>
                  <Icon name="location-outline" size={20} color={COLORS.primaryEnd} />
                </View>
                <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
                  <Text style={styles.infoTitle}>Dirección</Text>
                  <Text style={styles.infoSubtitle} numberOfLines={2}>
                    {parking.address || 'Dirección no disponible'}
                  </Text>
                </View>
              </View>

              <View style={[styles.infoRow, { marginTop: SPACING.md }]}>
                <View style={styles.iconWrap}>
                  <Icon name="car-sport-outline" size={20} color={COLORS.primaryEnd} />
                </View>
                <View style={{ marginLeft: SPACING.sm }}>
                  <Text style={styles.infoTitle}>Capacidad</Text>
                  <Text style={styles.infoSubtitle}>{parking.capacity || 0} espacios</Text>
                </View>
              </View>

              <View style={[styles.infoRow, { marginTop: SPACING.md }]}>
                <View style={styles.iconWrap}>
                  <Icon name="time-outline" size={20} color={COLORS.primaryEnd} />
                </View>
                <View style={{ marginLeft: SPACING.sm }}>
                  <Text style={styles.infoTitle}>Horario</Text>
                  <Text style={styles.infoSubtitle}>24/7</Text>
                </View>
              </View>

              <View style={[styles.infoRow, { marginTop: SPACING.md }]}>
                <View style={styles.iconWrap}>
                  <Icon name="shield-checkmark-outline" size={20} color={COLORS.primaryEnd} />
                </View>
                <View style={{ marginLeft: SPACING.sm }}>
                  <Text style={styles.infoTitle}>Seguridad</Text>
                  <Text style={styles.infoSubtitle}>Cámaras y personal</Text>
                </View>
              </View>
            </GlassCard>

            {/* Características - COMENTADO (mockup) */}
            {/* 
            <Text style={styles.sectionTitle}>Características</Text>
            <View style={styles.featuresRow}>
              <GlassCard style={{ flex: 1, marginRight: SPACING.sm }}>
                <Icon name="car-sport" size={24} color={COLORS.primaryEnd} />
                <Text style={styles.featureText}>Cubierto</Text>
              </GlassCard>

              <GlassCard style={{ flex: 1 }}>
                <Icon name="flash-outline" size={24} color={COLORS.primaryEnd} />
                <Text style={styles.featureText}>Carga EV</Text>
              </GlassCard>
            </View>
            */}

            {/* Tarifas disponibles */}
            <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>Tarifas</Text>
            {loadingTarifas ? (
              <GlassCard>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={[styles.infoSubtitle, { textAlign: 'center', marginTop: 8 }]}>
                  Cargando tarifas...
                </Text>
              </GlassCard>
            ) : tarifas.length > 0 ? (
              <GlassCard>
                {tarifas.map((tarifa, index) => (
                  <View key={tarifa.id_tarifa}>
                    {index > 0 && <View style={styles.tarifaDivider} />}
                    <View style={styles.tarifaRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tarifaTipo}>{tarifa.tipo}</Text>
                        {tarifa.condiciones && (
                          <Text style={styles.tarifaCondiciones} numberOfLines={2}>
                            {tarifa.condiciones}
                          </Text>
                        )}
                      </View>
                      <Text style={styles.tarifaMonto}>S/ {tarifa.monto.toFixed(2)}</Text>
                    </View>
                  </View>
                ))}
              </GlassCard>
            ) : (
              <GlassCard>
                <Text style={[styles.infoSubtitle, { textAlign: 'center' }]}>
                  No hay tarifas disponibles
                </Text>
              </GlassCard>
            )}

            <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>Resumen</Text>
            <GlassCard>
              <View style={styles.priceRow}>
                <View>
                  <Text style={styles.priceTitle}>Precio por hora</Text>
                  <Text style={styles.priceValue}>
                    {loadingTarifas 
                      ? 'Cargando...' 
                      : tarifaHora 
                        ? `S/ ${tarifaHora.toFixed(2)}`
                        : 'No disponible'
                    }
                  </Text>
                </View>
                <ButtonGradient 
                  title="Reservar" 
                  onPress={() => navigation.navigate('ReserveFlow', { 
                    parking: {
                      ...parking,
                      tarifas,
                      tarifaHora
                    }
                  })} 
                />
              </View>
            </GlassCard>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg },
  topButton: { padding: 8 },
  headerImage: { 
    height: 220, 
    justifyContent: 'flex-end',
    backgroundColor: COLORS.primaryStart,
    borderBottomLeftRadius: 24, 
    borderBottomRightRadius: 24 
  },
  headerContent: { padding: SPACING.lg },
  title: { color: COLORS.white, fontSize: 22, fontWeight: '700' },
  content: { padding: SPACING.lg, paddingTop: SPACING.md },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  infoTitle: { fontWeight: '700', color: COLORS.textDark },
  infoSubtitle: { color: COLORS.textMid },
  sectionTitle: { marginTop: SPACING.md, color: COLORS.textDark, fontWeight: '700' },
  featuresRow: { flexDirection: 'row', marginTop: SPACING.sm },
  featureText: { marginTop: SPACING.sm, color: COLORS.textMid },
  // Estilos para tarifas
  tarifaRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs 
  },
  tarifaDivider: { 
    height: 1, 
    backgroundColor: 'rgba(0,0,0,0.1)', 
    marginVertical: SPACING.sm 
  },
  tarifaTipo: { 
    fontWeight: '600', 
    color: COLORS.textDark, 
    fontSize: 15,
    textTransform: 'capitalize'
  },
  tarifaCondiciones: { 
    color: COLORS.textMid, 
    fontSize: 12, 
    marginTop: 2 
  },
  tarifaMonto: { 
    fontWeight: '700', 
    color: COLORS.primary, 
    fontSize: 16,
    marginLeft: SPACING.sm 
  },
  // Estilos de precio
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceTitle: { color: COLORS.textMid },
  priceValue: { color: COLORS.textDark, fontWeight: '700', marginTop: 4 },
});