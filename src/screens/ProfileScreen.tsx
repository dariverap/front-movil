// screens/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import VehicleCard from '../components/VehicleCard';
import ButtonGradient from '../components/ButtonGradient';
import VehicleFormModal from '../components/VehicleFormModal';
import HeaderMenu from '../components/HeaderMenu';
import { COLORS, SPACING, TYPE } from '../lib/theme';
import { getProfile, updateProfile, getVehiculosByUsuario, createVehiculo, updateVehiculo, deleteVehiculo } from '../lib/api';
import { useAuth } from '../hooks/useAuth';

export default function ProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);

  useEffect(() => {
    loadProfileAndVehicles();
  }, []);

  async function loadProfileAndVehicles() {
    try {
      setLoading(true);
      const profileData = await getProfile();
      
      console.log('Perfil cargado:', profileData);
      
      setNombre(profileData.nombre || '');
      setApellido(profileData.apellido || '');
      setEmail(profileData.email || '');
      setTelefono(profileData.telefono || '');
      setUserId(profileData.id);

      // Cargar vehículos del usuario
      if (profileData.id) {
        console.log('Cargando vehículos para usuario:', profileData.id);
        const vehiculosData = await getVehiculosByUsuario(profileData.id);
        console.log('Vehículos cargados:', vehiculosData);
        setVehicles(vehiculosData);
      }
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      Alert.alert('Error', 'No se pudieron cargar los datos del perfil');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    try {
      setSaving(true);
      await updateProfile({ 
        nombre, 
        apellido, 
        telefono, 
        email 
      });
      setEditingProfile(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert('Error', error.response?.data?.message || 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  }

  function openAddVehicle() {
    setEditingVehicle(null);
    setVehicleModalVisible(true);
  }

  function openEditVehicle(v: any) {
    setEditingVehicle(v);
    setVehicleModalVisible(true);
  }

  async function handleSaveVehicle(payload: any) {
    try {
      setSaving(true);
      
      console.log('Datos del vehículo a guardar:', payload);
      
      // Mapear los campos del formulario a los campos de la API
      const vehiculoData = {
        marca: payload.make || '',
        modelo: payload.model || '',
        placa: payload.plate || '',
        color: payload.color || '',
      };

      console.log('Datos mapeados para la API:', vehiculoData);

      if (payload.id) {
        // Actualizar vehículo existente
        await updateVehiculo(payload.id, vehiculoData);
        Alert.alert('Éxito', 'Vehículo actualizado correctamente');
      } else {
        // Crear nuevo vehículo
        const newVehiculo = await createVehiculo(vehiculoData);
        console.log('Vehículo creado:', newVehiculo);
        Alert.alert('Éxito', 'Vehículo agregado correctamente');
      }
      
      // Recargar la lista completa de vehículos para tener los IDs correctos
      await loadProfileAndVehicles();
      setVehicleModalVisible(false);
    } catch (error: any) {
      console.error('Error al guardar vehículo:', error);
      console.error('Respuesta del error:', error.response?.data);
      Alert.alert('Error', error.response?.data?.message || 'No se pudo guardar el vehículo');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteVehicle(id: string) {
    Alert.alert('Eliminar vehículo', '¿Deseas eliminar este vehículo?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Eliminar', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await deleteVehiculo(parseInt(id));
            // Recargar la lista para reflejar el cambio
            await loadProfileAndVehicles();
            Alert.alert('Éxito', 'Vehículo eliminado correctamente');
          } catch (error: any) {
            console.error('Error al eliminar vehículo:', error);
            Alert.alert('Error', error.response?.data?.message || 'No se pudo eliminar el vehículo');
          }
        }
      },
    ]);
  }

  async function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Estás seguro que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Cerrar sesión', 
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      },
    ]);
  }

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
        title="Mi Perfil" 
        subtitle="Gestiona tu información" 
        navigation={navigation}
      />
      
      <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: insets.bottom + 40 }}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Datos Personales</Text>
          {!editingProfile && (
            <TouchableOpacity 
              onPress={() => setEditingProfile(true)}
              style={styles.editButton}
            >
              <Text style={styles.editButtonText}>✏️ Editar</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.label}>Nombre</Text>
        <TextInput 
          style={[styles.input, !editingProfile && styles.inputDisabled]} 
          value={nombre} 
          onChangeText={setNombre}
          placeholder="Tu nombre"
          editable={editingProfile}
        />

        <Text style={styles.label}>Apellido</Text>
        <TextInput 
          style={[styles.input, !editingProfile && styles.inputDisabled]} 
          value={apellido} 
          onChangeText={setApellido}
          placeholder="Tu apellido"
          editable={editingProfile}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput 
          style={[styles.input, !editingProfile && styles.inputDisabled]} 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address"
          placeholder="tu@email.com"
          editable={editingProfile}
        />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput 
          style={[styles.input, !editingProfile && styles.inputDisabled]} 
          value={telefono} 
          onChangeText={setTelefono}
          keyboardType="phone-pad"
          placeholder="Número de teléfono"
          editable={editingProfile}
        />

        {editingProfile && (
          <View style={{ marginTop: SPACING.md, flexDirection: 'row', gap: SPACING.sm }}>
            <View style={{ flex: 1 }}>
              <ButtonGradient 
                title={saving ? "Guardando..." : "Guardar"} 
                onPress={handleSaveProfile}
                disabled={saving}
              />
            </View>
            <View style={{ flex: 1 }}>
              <ButtonGradient 
                title="Cancelar" 
                variant="outline"
                onPress={() => {
                  setEditingProfile(false);
                  loadProfileAndVehicles(); // Recargar datos originales
                }}
              />
            </View>
          </View>
        )}

        <View style={{ height: SPACING.lg }} />

        <Text style={styles.section}>Tus vehículos</Text>
        <View style={{ marginTop: SPACING.sm }}>
          {vehicles.length === 0 ? (
            <Text style={{ color: COLORS.textMid, fontStyle: 'italic' }}>
              No tienes vehículos registrados
            </Text>
          ) : (
            vehicles.map((v, index) => {
              const vehicleId = v.id_vehiculo || v.id;
              const uniqueKey = vehicleId ? String(vehicleId) : `vehicle-${index}`;
              
              return (
                <VehicleCard 
                  key={uniqueKey} 
                  id={vehicleId?.toString() || ''} 
                  make={v.marca + (v.modelo ? ` • ${v.modelo}` : '')} 
                  plate={v.placa} 
                  color={v.color} 
                  onEdit={() => openEditVehicle({
                    id: vehicleId,
                    make: v.marca,
                    model: v.modelo,
                    plate: v.placa,
                    color: v.color,
                  })} 
                  onDelete={() => handleDeleteVehicle(vehicleId?.toString() || '')} 
                />
              );
            })
          )}

          <View style={{ marginTop: SPACING.md }}>
            <ButtonGradient 
              title="Agregar vehículo" 
              variant="outline" 
              onPress={openAddVehicle} 
              disabled={saving}
            />
          </View>
        </View>

        <View style={{ height: SPACING.lg }} />

        <ButtonGradient 
          title="Cerrar sesión" 
          variant="ghost" 
          onPress={handleLogout} 
        />
      </ScrollView>

      <VehicleFormModal 
        visible={vehicleModalVisible} 
        onClose={() => setVehicleModalVisible(false)} 
        onSave={handleSaveVehicle} 
        existing={editingVehicle} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.textDark },
  editButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    backgroundColor: COLORS.primaryStart + '15',
  },
  editButtonText: {
    color: COLORS.primaryEnd,
    fontWeight: '600',
    fontSize: 14,
  },
  label: { marginTop: SPACING.md, color: COLORS.textMid, fontSize: 14 },
  input: { 
    marginTop: SPACING.xs, 
    borderWidth: 1, 
    borderColor: 'rgba(0,0,0,0.05)', 
    padding: SPACING.sm, 
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: COLORS.textMid,
  },
  section: { marginTop: SPACING.lg, fontWeight: '700', color: COLORS.textDark },
});