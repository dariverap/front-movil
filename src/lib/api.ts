// lib/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL as ENV_API_BASE_URL } from '@env';

// Leer API_BASE_URL desde @env (.env via react-native-dotenv) o usar fallback
const API_BASE_URL = ENV_API_BASE_URL || 'http://10.0.2.2:3000/api';

console.log('[API] Configuración inicial - Base URL:', API_BASE_URL);

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
      console.log('[API] Request:', config.method?.toUpperCase(), config.url);
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[API] Token agregado a headers');
      } else {
        console.warn('[API] No hay token disponible');
      }
    } catch (error) {
      console.error('[API] Error al obtener token:', error);
    }
    return config;
  },
  (error) => {
    console.error('[API] Error en interceptor request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.log('[API] Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('[API] Error Response:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      // Token inválido o expirado - limpiar sesión
      console.warn('[API] Token inválido, limpiando sesión');
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      } catch (e) {
        console.error('[API] Error al limpiar sesión:', e);
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
  deleted_at?: string | null;
  deleted_by?: string | null;
  motivo_baja?: string | null;
}

export interface Tarifa {
  id_tarifa: number;
  id_parking: number;
  tipo: string; // 'hora', 'dia', 'mes', etc.
  monto: number;
  condiciones?: string | null;
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

export const getTarifasByParkingId = async (parkingId: number): Promise<Tarifa[]> => {
  const response = await api.get(`/parking/${parkingId}/tarifas`);
  return response.data.data || response.data;
};

// ============== API de Espacios ==============
export interface Espacio {
  id_espacio: number;
  id_parking: number;
  numero_espacio: string;
  estado: 'disponible' | 'ocupado' | 'reservado' | 'mantenimiento';
}

export const getEspaciosByParkingId = async (parkingId: number): Promise<Espacio[]> => {
  const response = await api.get(`/espacios/parking/${parkingId}`);
  return response.data.data || response.data;
};

export const getEspaciosDisponibles = async (parkingId: number): Promise<Espacio[]> => {
  const response = await api.get(`/espacios/parking/${parkingId}/disponibles`);
  return response.data.data || response.data;
};

// ============== API de Reservas ==============
export interface Reserva {
  id_reserva: number;
  id_usuario: string;
  id_espacio: number;
  id_vehiculo?: number;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'pendiente' | 'confirmada' | 'activa' | 'cancelada' | 'completada' | 'expirada';
  estado_visible?: 'pendiente' | 'confirmada' | 'activa' | 'cancelada' | 'completada' | 'expirada';
  tiene_ocupacion_activa?: boolean;
  puede_cancelar?: boolean;
  espacio?: {
    id_espacio: number;
    numero_espacio: string;
    estado: string;
    parking: {
      id_parking: number;
      nombre: string;
      direccion: string;
      latitud: number;
      longitud: number;
    };
  };
  vehiculo?: {
    id_vehiculo: number;
    placa: string;
    marca: string;
    modelo: string;
    color: string;
  };
}

export const createReserva = async (data: {
  id_espacio: number;
  id_vehiculo: number;
  fecha_inicio: string; // ISO string
  fecha_fin: string; // ISO string
}): Promise<Reserva> => {
  const response = await api.post('/reservas', data);
  return response.data.data || response.data;
};

export const getMisReservas = async (): Promise<Reserva[]> => {
  const response = await api.get('/reservas/mis-reservas');
  return response.data.data || response.data;
};

export const cancelarReserva = async (id: number): Promise<void> => {
  console.log(`[API] Cancelando reserva ${id}...`);
  const response = await api.patch(`/reservas/${id}/estado`, { estado: 'cancelada' });
  console.log('[API] Respuesta cancelación:', response.data);
};

export const verificarDisponibilidad = async (data: {
  id_espacio: number;
  fecha_inicio: string;
  fecha_fin: string;
}): Promise<{ disponible: boolean }> => {
  const response = await api.post('/reservas/verificar-disponibilidad', data);
  return response.data;
};

// ============== API de Ocupaciones ==============
export interface Ocupacion {
  id_ocupacion: number;
  id_reserva?: number;
  id_usuario: string;
  id_espacio: number;
  id_vehiculo?: number;
  id_parking?: number;
  hora_entrada: string;
  hora_salida?: string | null;
  hora_salida_solicitada?: string | null;
  hora_salida_confirmada?: string | null;
  costo_total?: number | null;
  monto_calculado?: number | null;
  tiempo_total_minutos?: number | null;
  // Datos relacionados (de las vistas)
  cliente?: string;
  vehiculo_placa?: string;
  vehiculo_marca?: string;
  vehiculo_modelo?: string;
  parking?: string;
  numero_espacio?: string;
  horas_transcurridas?: number;
  costo_actual?: number;
  tarifa_hora?: number;
}

export const marcarEntrada = async (id_reserva: number): Promise<{ id_ocupacion: number }> => {
  const response = await api.post('/ocupaciones/marcar-entrada', { id_reserva });
  return response.data.data || response.data;
};

export const marcarSalida = async (id_ocupacion: number): Promise<{ 
  costo_calculado: number; 
  tiempo_total_horas: number;
}> => {
  const response = await api.post('/ocupaciones/marcar-salida', { id_ocupacion });
  return response.data.data || response.data;
};

export const solicitarSalida = async (id_ocupacion: number): Promise<{
  monto: number;
  tiempo_minutos: number;
  id_pago: number;
}> => {
  const response = await api.post(`/pagos/ocupaciones/${id_ocupacion}/solicitar-salida`);
  return response.data.data || response.data;
};

export const getOcupacionActiva = async (): Promise<Ocupacion | null> => {
  const response = await api.get('/ocupaciones/activa');
  // Backend devuelve { success, data }
  if (response?.data && 'data' in response.data) {
    return response.data.data || null;
  }
  return response.data || null;
};

export const getHistorialOcupaciones = async (): Promise<Ocupacion[]> => {
  const response = await api.get('/ocupaciones/historial');
  return response.data.data || response.data;
};

// ============== API de Historial Unificado ==============
export interface HistorialOperacion {
  id_operacion: string;
  id_reserva?: number;
  id_ocupacion?: number;
  tipo: 'reserva' | 'walk_in';
  estado_final: string;
  usuario: {
    id_usuario: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
  } | null;
  vehiculo: {
    id_vehiculo: number;
    placa: string;
    marca?: string;
    modelo?: string;
    color?: string;
  } | null;
  espacio: {
    id_espacio: number;
    numero_espacio: string;
    id_parking: number;
  } | null;
  fechas: {
    creada_at: string | null;
    hora_programada_inicio: string | null;
    hora_programada_fin: string | null;
    entrada_at: string | null;
    salida_at: string | null;
    pago_at: string | null;
  };
  duracion_minutos: number | null;
  pago: {
    id_pago: number;
    monto: number;
    estado: string;
    metodo: string | null;
    metodo_tipo: string | null;
    comprobante: {
      tipo: string | null;
      serie: string | null;
      numero: string | null;
      emitido_en: string | null;
    };
  } | null;
}

export const getHistorialUsuario = async (
  userId: string,
  filters?: {
    estado?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    q?: string;
    limit?: number;
  }
): Promise<HistorialOperacion[]> => {
  console.log('[API] getHistorialUsuario - userId:', userId);
  console.log('[API] getHistorialUsuario - filters:', filters);
  
  const params = new URLSearchParams();
  if (filters?.estado) params.append('estado', filters.estado);
  if (filters?.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
  if (filters?.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
  if (filters?.q) params.append('q', filters.q);
  if (filters?.limit) params.append('limit', String(filters.limit));

  const query = params.toString();
  const url = `/usuarios/${userId}/historial${query ? `?${query}` : ''}`;
  
  console.log('[API] getHistorialUsuario - URL completa:', url);
  
  try {
    const response = await api.get(url);
    console.log('[API] getHistorialUsuario - Response status:', response.status);
    console.log('[API] getHistorialUsuario - Response data:', response.data);
    return response.data.data || response.data;
  } catch (error: any) {
    console.error('[API] getHistorialUsuario - Error:', error);
    console.error('[API] getHistorialUsuario - Error response:', error.response?.data);
    throw error;
  }
};

export default api;
