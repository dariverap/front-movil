// screens/MapScreen.tsx
import React from 'react';
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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import IconInput from '../components/IconInput';
import GlassCard from '../components/GlassCard';
import ButtonGradient from '../components/ButtonGradient';
import HeaderMenu from '../components/HeaderMenu';
import { COLORS, SPACING, RADIUS, TYPE } from '../lib/theme';
import Icon from 'react-native-vector-icons/Ionicons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SAMPLE_PARKINGS = [
  { id: 'p1', title: 'Parking Central', price: 3.5, lat: 37.78825, lng: -122.4324, distance: '120 m' },
  { id: 'p2', title: 'Plaza Norte', price: 2.0, lat: 37.7895, lng: -122.435, distance: '320 m' },
  { id: 'p3', title: 'Estación Sur', price: 4.0, lat: 37.786, lng: -122.430, distance: '450 m' },
];

export default function MapScreen({ navigation }: any) {
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

  function onMarkerPress(item: any) {
    navigation.navigate('ParkingDetail', { parking: item });
  }

  function renderParkingItem({ item }: any) {
    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => navigation.navigate('ParkingDetail', { parking: item })}
      >
        <View>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemSubtitle}>{item.distance} · ${item.price.toFixed(2)}</Text>
        </View>
        <View style={styles.itemRight}>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
          <Icon name="chevron-forward" size={20} color={COLORS.textMid} />
        </View>
      </TouchableOpacity>
    );
  }

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

        {/* Map placeholder */}
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>Mapa interactivo</Text>
          <Text style={styles.mapSubText}>Los marcadores aparecerían aquí con react-native-maps</Text>
          <View style={{ height: 14 }} />
          <ButtonGradient title="Ver lista de parkings" onPress={() => animateTo(SHEET_EXPANDED_TOP)} />
        </View>

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
          {...panResponder.panHandlers}
        >
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeaderRow}>
            <Text style={styles.sheetTitle}>Parkings cerca</Text>
            <Text style={styles.sheetSubtitle}>{SAMPLE_PARKINGS.length} opciones</Text>
          </View>

          <FlatList
            data={SAMPLE_PARKINGS}
            keyExtractor={(i) => i.id}
            renderItem={renderParkingItem}
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            showsVerticalScrollIndicator={false}
          />
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
  mapPlaceholder: { 
    flex: 1, 
    borderRadius: 20, 
    backgroundColor: COLORS.backgroundSoft, 
    alignItems: 'center', 
    justifyContent: 'center', 
    margin: SPACING.md,
    padding: SPACING.lg 
  },
  mapText: { color: COLORS.textDark, fontSize: TYPE.title, fontWeight: '600' },
  mapSubText: { color: COLORS.textMid, textAlign: 'center', marginTop: 8 },
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
    overflow: 'hidden',
  },
  sheetHandle: { width: 40, height: 6, borderRadius: 4, backgroundColor: 'rgba(45,55,72,0.06)', alignSelf: 'center', marginVertical: 10 },
  sheetHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingBottom: 8 },
  sheetTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  sheetSubtitle: { color: COLORS.textMid },
  listItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: '#eef2f6' },
  itemTitle: { fontWeight: '700', color: COLORS.textDark },
  itemSubtitle: { color: COLORS.textMid, marginTop: 4 },
  itemRight: { alignItems: 'flex-end' },
  itemPrice: { fontWeight: '800', color: COLORS.textDark },
});