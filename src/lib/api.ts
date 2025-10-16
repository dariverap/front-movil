// lib/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL as ENV_API_BASE_URL } from '@env';

// Leer API_BASE_URL desde @env (.env via react-native-dotenv) o usar fallback
const API_BASE_URL = ENV_API_BASE_URL || 'http://10.0.2.2:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error al obtener token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado - limpiar sesión
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      } catch (e) {
        console.error('Error al limpiar sesión:', e);
      }
    }
    return Promise.reject(error);
  }
);

// ============== API de Usuarios ==============
export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data.data || response.data;
};

export const updateProfile = async (data: { nombre?: string; apellido?: string; telefono?: string; email?: string }) => {
  const response = await api.put('/auth/profile', data);
  return response.data.data || response.data;
};

// ============== API de Vehículos ==============
export const getVehiculos = async () => {
  const response = await api.get('/vehiculos');
  return response.data.data || response.data;
};

export const getVehiculosByUsuario = async (userId: string) => {
  const response = await api.get(`/vehiculos/usuario/${userId}`);
  return response.data.data || response.data;
};

export const createVehiculo = async (data: { 
  marca: string; 
  modelo: string; 
  placa: string; 
  color?: string;
}) => {
  const response = await api.post('/vehiculos', data);
  return response.data.data || response.data;
};

export const updateVehiculo = async (id: number, data: { 
  marca?: string; 
  modelo?: string; 
  placa?: string; 
  color?: string;
}) => {
  const response = await api.put(`/vehiculos/${id}`, data);
  return response.data.data || response.data;
};

export const deleteVehiculo = async (id: number) => {
  const response = await api.delete(`/vehiculos/${id}`);
  return response.data.data || response.data;
};

// ============== API de Parkings ==============
export interface Parking {
  id_parking: number;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  capacidad_total: number;
  id_admin?: string;
}

export const getParkings = async (): Promise<Parking[]> => {
  const response = await api.get('/parking');
  return response.data.data || response.data;
};

export const getNearbyParkings = async (lat: number, lng: number, radius: number = 5): Promise<Parking[]> => {
  const response = await api.get('/parking/cercanos', {
    params: { lat, lng, radius }
  });
  return response.data.data || response.data;
};

export const getParkingById = async (id: number): Promise<Parking> => {
  const response = await api.get(`/parking/${id}`);
  return response.data.data || response.data;
};

export default api;
