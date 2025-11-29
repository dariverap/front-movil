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
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import IconInput from '../components/IconInput';
import GlassCard from '../components/GlassCard';
import ButtonGradient from '../components/ButtonGradient';
import HeaderMenu from '../components/HeaderMenu';
import { COLORS, SPACING, RADIUS, TYPE } from '../lib/theme';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
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
  const [searchQuery, setSearchQuery] = useState('');
  // Estado del mapa para diagnóstico
  const [mapReady, setMapReady] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const [quickModal, setQuickModal] = React.useState(false);

  // Capturar errores de renderizado
  React.useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes?.('Text strings')) {
        console.log('[MapScreen] ERROR CAPTURADO:', ...args);
      }
      originalError(...args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  // Bottom sheet measurements (sin tab bar - más espacio disponible)
  const HEADER_HEIGHT = 120;
  const SHEET_COLLAPSED_HEIGHT = 160;
  const SHEET_EXPANDED_TOP = 120;
  const SHEET_MAX_TRANSLATE = SCREEN_HEIGHT - SHEET_EXPANDED_TOP;
  const SHEET_MIN_TRANSLATE = SCREEN_HEIGHT - SHEET_COLLAPSED_HEIGHT - 12;

  const translateY = React.useRef(new Animated.Value(SHEET_MIN_TRANSLATE)).current;
  const lastGestureY = React.useRef(SHEET_MIN_TRANSLATE);

  // Filtrar parkings por búsqueda
  const filteredParkings = React.useMemo(() => {
    if (!searchQuery.trim()) return parkings;
    
    const query = searchQuery.toLowerCase().trim();
    return parkings.filter(p => 
      p.nombre.toLowerCase().includes(query) ||
      p.direccion?.toLowerCase().includes(query)
    );
  }, [parkings, searchQuery]);

  // Cargar parkings al montar el componente
  useEffect(() => {
    loadParkings();
  }, []);

  const loadParkings = async () => {
    try {
      setLoading(true);
      console.log('[MapScreen] Iniciando carga de parkings...');
      const data = await getParkings();
      
      // Filtrar solo parkings activos (no eliminados)
      const activeParkings = data.filter(p => p.deleted_at === null || p.deleted_at === undefined);
      
      console.log('[MapScreen] Parkings cargados:', data.length, 'total,', activeParkings.length, 'activos');
      console.log('[MapScreen] Primer parking activo:', JSON.stringify(activeParkings[0]));
      
      setParkings(activeParkings);
      
      // Si hay parkings, centrar el mapa en el primero
      if (activeParkings.length > 0) {
        const firstParking = activeParkings[0];
        const lat = Number(firstParking.latitud);
        const lng = Number(firstParking.longitud);
        
        console.log('[MapScreen] Tipo de latitud:', typeof firstParking.latitud, 'valor:', firstParking.latitud);
        console.log('[MapScreen] Tipo de longitud:', typeof firstParking.longitud, 'valor:', firstParking.longitud);
        console.log('[MapScreen] Latitud convertida:', lat, 'válida:', !isNaN(lat));
        console.log('[MapScreen] Longitud convertida:', lng, 'válida:', !isNaN(lng));
        
        const newRegion = {
          latitude: lat,
          longitude: lng,
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
    // Navegar a la pantalla de detalles del parking
    navigation.navigate('ParkingDetail', { 
      parking: {
        id: parking.id_parking,
        title: parking.nombre || 'Parking',
        price: 3.5, // Precio por defecto, puedes ajustarlo según tu tarifa
        rating: 4.6, // Rating por defecto
        reviews: 124, // Reviews por defecto
        address: parking.direccion,
        latitude: parking.latitud,
        longitude: parking.longitud,
        capacity: parking.capacidad_total,
        ...parking // Pasar todos los datos del parking
      }
    });
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
          <Text style={styles.itemTitle}>{item.nombre || 'Sin nombre'}</Text>
          <Text style={styles.itemSubtitle} numberOfLines={1}>
            {item.direccion || 'Sin dirección'}
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
    setTimeout(() => {
      mapRef.current?.animateToRegion(userLocation, 1000);
    }, 0);
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
          <IconInput 
            placeholder="Buscar parking por nombre" 
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
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
            onMapReady={() => {
              console.log('[MapScreen] onMapReady');
              setMapReady(true);
            }}
            onMapLoaded={() => {
              console.log('[MapScreen] onMapLoaded');
              setMapLoaded(true);
            }}
            onError={(e) => {
              console.error('[MapScreen] Map error:', e?.nativeEvent);
              try {
                setMapError(JSON.stringify(e?.nativeEvent));
              } catch (_) {
                setMapError('Error desconocido en MapView');
              }
            }}
          >
            {parkings.map((parking) => (
              <Marker
                key={parking.id_parking}
                coordinate={{
                  latitude: Number(parking.latitud),
                  longitude: Number(parking.longitud),
                }}
                onPress={() => onMarkerPress(parking)}
              >
                <View style={{
                  width: 46,
                  height: 60,
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                  <View style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: '#764ba2',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 3,
                    borderColor: '#FFFFFF',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                    elevation: 5,
                  }}>
                    <MaterialCommunityIcons name="car" size={20} color="#FFFFFF" />
                  </View>
                  <View style={{
                    width: 0,
                    height: 0,
                    borderLeftWidth: 7,
                    borderRightWidth: 7,
                    borderTopWidth: 10,
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                    borderTopColor: '#764ba2',
                    marginTop: -1,
                  }} />
                </View>
              </Marker>
            ))}
          </MapView>
        )}

        {/* Overlay de diagnóstico para el mapa - Temporalmente deshabilitado */}
        {/* <View style={styles.mapDebugBadge} pointerEvents="none">
          <Text style={styles.mapDebugText}>
            {!mapReady ? 'Mapa: initializing…' : 
             (mapReady && !mapLoaded) ? 'Mapa: ready, loading tiles…' :
             mapError ? `Error: ${mapError}` :
             `Mapa: OK | Marcadores: ${parkings.length}`}
          </Text>
        </View> */}

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
          {/* Handle - solo esta área maneja el drag */}
          <View style={styles.handleContainer} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          {/* Sheet content - esta área permite scroll */}
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Parkings disponibles</Text>
            <Text style={styles.sheetSubtitle}>
              {filteredParkings.length === 0 
                ? (searchQuery ? `No se encontraron parkings con "${searchQuery}"` : 'No hay parkings disponibles')
                : `${filteredParkings.length} ${filteredParkings.length === 1 ? 'parking encontrado' : 'parkings encontrados'}`
              }
            </Text>

            <FlatList
              data={filteredParkings}
              keyExtractor={(item) => item.id_parking.toString()}
              renderItem={renderParkingItem}
              contentContainerStyle={{ paddingBottom: 60 }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
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
    ...StyleSheet.absoluteFillObject,
  },
  mapDebugBadge: {
    position: 'absolute',
    top: 140,
    right: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mapDebugText: {
    color: '#fff',
    fontSize: 11,
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
  // Estilos para marcador personalizado
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primaryEnd,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  markerPointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.primaryEnd,
    marginTop: -2,
  },
  calloutContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SPACING.sm,
    minWidth: 150,
    maxWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 12,
    color: COLORS.textMid,
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
    paddingVertical: SPACING.md,
    alignItems: 'center',
    paddingBottom: SPACING.sm,
  },
  handle: {
    width: 50,
    height: 5,
    backgroundColor: COLORS.textMid,
    borderRadius: 3,
    opacity: 0.5,
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