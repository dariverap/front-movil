// screens/MapScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Dimensions,
  PanResponder,
  Platform,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import IconInput from '../components/IconInput';
import GlassCard from '../components/GlassCard';
import ButtonGradient from '../components/ButtonGradient';
import HeaderMenu from '../components/HeaderMenu';
import { COLORS, SPACING, RADIUS, TYPE } from '../lib/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import { getParkings, getNearbyParkings, Parking } from '../lib/api';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// Coordenadas por defecto (ajusta según tu ciudad)
const DEFAULT_REGION = {
  latitude: -12.0464, // Lima, Perú
  longitude: -77.0428,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export default function MapScreen({ navigation }: any) {
  const mapRef = useRef<MapView>(null);
  
  // Estados
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParking, setSelectedParking] = useState<Parking | null>(null);
  const [userLocation, setUserLocation] = useState(DEFAULT_REGION);
  const insets = useSafeAreaInsets();
  const [quickModal, setQuickModal] = React.useState(false);

  // Bottom sheet measurements (sin tab bar - más espacio disponible)
  const HEADER_HEIGHT = 120;
  const SHEET_COLLAPSED_HEIGHT = 160;
  const SHEET_EXPANDED_TOP = 120;
  const SHEET_MAX_TRANSLATE = SCREEN_HEIGHT - SHEET_EXPANDED_TOP;
  const SHEET_MIN_TRANSLATE = SCREEN_HEIGHT - SHEET_COLLAPSED_HEIGHT - 12;

  const translateY = React.useRef(new Animated.Value(SHEET_MIN_TRANSLATE)).current;
  const lastGestureY = React.useRef(SHEET_MIN_TRANSLATE);

  // Cargar parkings al montar el componente
  useEffect(() => {
    loadParkings();
  }, []);

  const loadParkings = async () => {
    try {
      setLoading(true);
      console.log('[MapScreen] Iniciando carga de parkings...');
      const data = await getParkings();
      console.log('[MapScreen] Parkings cargados:', data.length, 'parkings');
      console.log('[MapScreen] Primer parking:', data[0]);
      setParkings(data);
      
      // Si hay parkings, centrar el mapa en el primero
      if (data.length > 0) {
        const firstParking = data[0];
        const newRegion = {
          latitude: Number(firstParking.latitud),
          longitude: Number(firstParking.longitud),
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        console.log('[MapScreen] Centrando mapa en:', newRegion);
        setUserLocation(newRegion);
      }
    } catch (error: any) {
      console.error('[MapScreen] Error al cargar parkings:', error);
      console.error('[MapScreen] Error details:', error.message);
      Alert.alert(
        'Error',
        'No se pudieron cargar los parkings. Verifica tu conexión.',
        [{ text: 'Reintentar', onPress: loadParkings }, { text: 'Cancelar' }]
      );
    } finally {
      setLoading(false);
      console.log('[MapScreen] Fin de carga, loading=false');
    }
  };

  // PanResponder for drag behavior
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newY = gestureState.dy + lastGestureY.current;
        if (newY >= SHEET_EXPANDED_TOP && newY <= SHEET_MIN_TRANSLATE) {
          translateY.setValue(newY);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const shouldExpand = gestureState.vy < -0.3 || gestureState.moveY < (SHEET_MIN_TRANSLATE + SHEET_EXPANDED_TOP) / 2;
        animateTo(shouldExpand ? SHEET_EXPANDED_TOP : SHEET_MIN_TRANSLATE);
        lastGestureY.current = shouldExpand ? SHEET_EXPANDED_TOP : SHEET_MIN_TRANSLATE;
      },
    })
  ).current;

  function animateTo(y: number) {
    Animated.timing(translateY, { toValue: y, duration: 300, useNativeDriver: true }).start();
    lastGestureY.current = y;
  }

  React.useEffect(() => {
    translateY.setValue(SHEET_MIN_TRANSLATE);
    lastGestureY.current = SHEET_MIN_TRANSLATE;
  }, []);

  function onMarkerPress(parking: Parking) {
    setSelectedParking(parking);
    // Centrar el mapa en el parking seleccionado
    mapRef.current?.animateToRegion({
      latitude: Number(parking.latitud),
      longitude: Number(parking.longitud),
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
    // Expandir el bottom sheet
    animateTo(SHEET_EXPANDED_TOP);
  }

  function renderParkingItem({ item }: { item: Parking }) {
    // Calcular distancia aproximada
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      Number(item.latitud),
      Number(item.longitud)
    );

    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => onMarkerPress(item)}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>{item.nombre}</Text>
          <Text style={styles.itemSubtitle} numberOfLines={1}>
            {item.direccion}
          </Text>
          <Text style={styles.itemDistance}>{distance.toFixed(1)} km</Text>
        </View>
        <View style={styles.itemRight}>
          <Icon name="location" size={24} color={COLORS.primary} />
          <Icon name="chevron-forward" size={20} color={COLORS.textMid} />
        </View>
      </TouchableOpacity>
    );
  }

  // Función para calcular distancia (fórmula de haversine simplificada)
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Centrar el mapa en la ubicación del usuario
  const centerOnUser = () => {
    mapRef.current?.animateToRegion(userLocation, 1000);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Header con menú hamburguesa */}
      <HeaderMenu 
        title="Parkly" 
        subtitle="Busca tu parking ideal" 
        navigation={navigation}
        showNotifications 
      />
      
      <View style={styles.content}>
        {/* Barra de búsqueda sobre el mapa */}
        <View style={styles.searchContainer}>
          <IconInput placeholder="Buscar zona o dirección" />
        </View>

        {/* Mapa con markers reales */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Cargando parkings...</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={userLocation}
            showsUserLocation
            showsMyLocationButton={false}
          >
            {parkings.map((parking) => (
              <Marker
                key={parking.id_parking}
                coordinate={{
                  latitude: Number(parking.latitud),
                  longitude: Number(parking.longitud),
                }}
                title={parking.nombre}
                description={parking.direccion}
                onPress={() => onMarkerPress(parking)}
              >
                <View style={styles.markerContainer}>
                  <Icon name="car" size={24} color={COLORS.white} />
                </View>
              </Marker>
            ))}
          </MapView>
        )}

        {/* Botón para centrar en ubicación del usuario */}
        <TouchableOpacity
          style={[styles.locationButton, { top: 180 }]}
          onPress={centerOnUser}
        >
          <Icon name="locate" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Floating action button - más cerca del borde inferior */}
        <TouchableOpacity
          accessibilityLabel="Reserva rápida"
          style={[styles.fab, { bottom: 28 }]}
          onPress={() => setQuickModal(true)}
        >
          <Icon name="car-sport" size={22} color={COLORS.white} />
        </TouchableOpacity>

        {/* Quick modal */}
        <Modal visible={quickModal} animationType="slide" transparent onRequestClose={() => setQuickModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.quickModal, { marginBottom: insets.bottom + 12 }]}>
              <Text style={styles.quickTitle}>Reserva rápida</Text>
              <Text style={styles.quickSubtitle}>Selecciona una plaza cercana en segundos.</Text>

              <View style={{ height: 12 }} />
              <ButtonGradient title="Buscar plazas cercanas" onPress={() => { setQuickModal(false); animateTo(SHEET_EXPANDED_TOP); }} />

              <View style={{ height: 8 }} />
              <ButtonGradient title="Cancelar" variant="ghost" onPress={() => setQuickModal(false)} />
            </View>
          </View>
        </Modal>

        {/* Bottom sheet (draggable) */}
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY: translateY }],
            },
          ]}
        >
          {/* Handle */}
          <View {...panResponder.panHandlers} style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Sheet content */}
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Parkings disponibles</Text>
            <Text style={styles.sheetSubtitle}>
              {parkings.length} {parkings.length === 1 ? 'parking encontrado' : 'parkings encontrados'}
            </Text>

            <FlatList
              data={parkings}
              keyExtractor={(item) => item.id_parking.toString()}
              renderItem={renderParkingItem}
              contentContainerStyle={{ paddingBottom: 60 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1 },
  searchContainer: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 10,
  },
  map: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    ...TYPE.body,
    color: COLORS.textMid,
  },
  markerContainer: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  locationButton: {
    position: 'absolute',
    right: SPACING.md,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryStart,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(13,12,22,0.45)', justifyContent: 'flex-end' },
  quickModal: { backgroundColor: COLORS.surface, marginHorizontal: SPACING.lg, borderRadius: 16, padding: SPACING.lg, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 10 },
  quickTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textDark },
  quickSubtitle: { color: COLORS.textMid, marginTop: 6 },
  sheet: {
    position: 'absolute',
    left: 12,
    right: 12,
    height: SCREEN_HEIGHT,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 12,
  },
  handleContainer: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 3,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  sheetTitle: {
    ...TYPE.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sheetSubtitle: {
    ...TYPE.body,
    color: COLORS.textMid,
    marginBottom: SPACING.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  itemTitle: {
    ...TYPE.h4,
    color: COLORS.text,
    marginBottom: 4,
  },
  itemSubtitle: {
    ...TYPE.small,
    color: COLORS.textMid,
    marginBottom: 4,
  },
  itemDistance: {
    ...TYPE.small,
    color: COLORS.primary,
    fontWeight: '600',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});