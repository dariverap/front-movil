// screens/ParkingDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, RADIUS, TYPE } from '../lib/theme';
import GlassCard from '../components/GlassCard';
import RatingStars from '../components/RatingStars';
import ButtonGradient from '../components/ButtonGradient';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ParkingDetailScreen({ navigation, route }: any) {
  const parking = route?.params?.parking || {
    title: 'Parking Central',
    price: 3.5,
    rating: 4.6,
    reviews: 124
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

            <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>Resumen</Text>
            <GlassCard>
              <View style={styles.priceRow}>
                <View>
                  <Text style={styles.priceTitle}>Total estimado</Text>
                  <Text style={styles.priceValue}>${parking.price?.toFixed(2) || '4.50'} · 2 horas</Text>
                </View>
                <ButtonGradient 
                  title="Reservar" 
                  onPress={() => navigation.navigate('ReserveFlow', { parking })} 
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
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceTitle: { color: COLORS.textMid },
  priceValue: { color: COLORS.textDark, fontWeight: '700', marginTop: 4 },
});