// components/HeaderMenu.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, RADIUS } from '../lib/theme';
import { logout } from '../lib/auth';

interface HeaderMenuProps {
  title: string;
  subtitle?: string;
  navigation: any;
  showNotifications?: boolean;
}

export default function HeaderMenu({ title, subtitle, navigation, showNotifications = false }: HeaderMenuProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setMenuVisible(false);
    });
  };

  const navigateTo = (screen: string) => {
    closeMenu();
    setTimeout(() => {
      navigation.navigate(screen);
    }, 300);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            closeMenu();
            await logout();
            // Resetear navegación a Login
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  return (
    <>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        {/* Botón de menú hamburguesa */}
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={openMenu}
          accessibilityLabel="Abrir menú"
        >
          <Icon name="menu" size={28} color={COLORS.textDark} />
        </TouchableOpacity>

        {/* Título y subtítulo */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        {/* Botón de notificaciones */}
        {showNotifications && (
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => {/* TODO: Implementar notificaciones */}}
            accessibilityLabel="Notificaciones"
          >
            <Icon name="notifications-outline" size={24} color={COLORS.textDark} />
            {/* Badge de notificaciones pendientes */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal del menú */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <Animated.View 
            style={[
              styles.menuContainer,
              {
                opacity: fadeAnim,
                transform: [{
                  translateX: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-300, 0],
                  }),
                }],
              }
            ]}
          >
            <Pressable style={styles.menuContent}>
              {/* Header del menú */}
              <View style={styles.menuHeader}>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={closeMenu}
                >
                  <Icon name="close" size={24} color={COLORS.textMid} />
                </TouchableOpacity>
              </View>

              {/* Logo centrado */}
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Icon name="car-sport" size={40} color="#FFF" />
                </View>
                <Text style={styles.menuTitle}>ParkingSys</Text>
              </View>

              {/* Opciones del menú */}
              <View style={styles.menuItems}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => navigateTo('Map')}
                >
                  <Icon name="map-outline" size={24} color={COLORS.primaryEnd} />
                  <Text style={styles.menuItemText}>Mapa</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => navigateTo('Home')}
                >
                  <Icon name="home-outline" size={24} color={COLORS.primaryEnd} />
                  <Text style={styles.menuItemText}>Inicio</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => navigateTo('Profile')}
                >
                  <Icon name="person-outline" size={24} color={COLORS.primaryEnd} />
                  <Text style={styles.menuItemText}>Mi Perfil</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => navigateTo('MyReservations')}
                >
                  <Icon name="calendar-outline" size={24} color={COLORS.primaryEnd} />
                  <Text style={styles.menuItemText}>Mis Reservas</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => navigateTo('History')}
                >
                  <Icon name="time-outline" size={24} color={COLORS.primaryEnd} />
                  <Text style={styles.menuItemText}>Historial</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => navigateTo('Profile')}
                >
                  <Icon name="settings-outline" size={24} color={COLORS.textMid} />
                  <Text style={styles.menuItemText}>Configuración</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {/* TODO: Ayuda - Puede ser una pantalla de FAQs */}}
                >
                  <Icon name="help-circle-outline" size={24} color={COLORS.textMid} />
                  <Text style={styles.menuItemText}>Ayuda</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => navigateTo('About')}
                >
                  <Icon name="information-circle-outline" size={24} color={COLORS.textMid} />
                  <Text style={styles.menuItemText}>Acerca de</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handleLogout}
                >
                  <Icon name="log-out-outline" size={24} color="#EF4444" />
                  <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Cerrar sesión</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMid,
    marginTop: 2,
  },
  notificationButton: {
    padding: SPACING.xs,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.primaryEnd,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
  },
  menuContent: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopRightRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: SPACING.md,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryEnd,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    shadowColor: COLORS.primaryEnd,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  menuItems: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginLeft: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: SPACING.sm,
    marginHorizontal: SPACING.xl,
  },
});
