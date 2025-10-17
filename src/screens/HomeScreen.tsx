import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, TYPE } from '../lib/theme';
import ButtonGradient from '../components/ButtonGradient';
import HeaderMenu from '../components/HeaderMenu';
import Icon from 'react-native-vector-icons/Ionicons';
import { getProfile } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primaryEnd} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <HeaderMenu 
        title={`Hola, ${profile?.nombre || 'Usuario'}`} 
        subtitle="Bienvenido a Parkly" 
        navigation={navigation}
        showNotifications 
      />
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.logoWrap}>
          <Icon name="car" size={64} color={COLORS.primaryEnd} />
        </View>
        
        <Text style={styles.welcomeTitle}>¡Estaciona con facilidad!</Text>
        <Text style={styles.welcomeText}>
          Encuentra y reserva estacionamientos cercanos con facilidad
        </Text>

        <View style={styles.ctaArea}>
          <ButtonGradient 
            title="🗺️ Explorar mapa" 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Map')} 
          />
          <ButtonGradient 
            title="📋 Mis reservas" 
            style={[styles.primaryButton, { marginTop: SPACING.md }]}
            variant="outline"
            onPress={() => navigation.navigate('MyReservations' as never)}
          />
          <ButtonGradient 
            title="👤 Mi perfil" 
            style={[styles.primaryButton, { marginTop: SPACING.md }]}
            variant="outline"
            onPress={() => navigation.navigate('Profile')} 
          />
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
  contentContainer: {
    flexGrow: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  welcomeText: {
    ...TYPE.h4,
    color: COLORS.textMid,
    textAlign: 'center',
    marginBottom: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  ctaArea: {
    width: '100%',
    maxWidth: 400,
  },
  primaryButton: {
    width: '100%',
  },
});