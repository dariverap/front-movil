// lib/auth.ts
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  rol?: string; // Para móvil siempre será 'cliente'
}

export interface User {
  id?: string; // Usado por algunos endpoints
  id_usuario: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: 'cliente' | 'empleado' | 'admin_parking' | 'admin_general';
  fecha_registro: string;
}

/**
 * Iniciar sesión - Consume POST /api/auth/login
 */
export async function login(credentials: LoginCredentials) {
  try {
    const response = await api.post('/auth/login', credentials);
    const data = response.data;
    
    // Extraer token y usuario de la respuesta
    const token = data?.token || data?.data?.token;
    const user = data?.usuario || data?.user || data?.data?.usuario || data?.data?.user;
    
    if (!token) {
      throw new Error('No se recibió token de autenticación');
    }
    
    // Guardar token y usuario en AsyncStorage
    await AsyncStorage.setItem('token', token);
    if (user) {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    }
    
    return { token, user, success: true };
  } catch (error: any) {
    console.error('Error en login:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Error al iniciar sesión'
    );
  }
}

/**
 * Registrar nuevo usuario - Consume POST /api/auth/register
 * Para móvil, el rol siempre será 'cliente'
 */
export async function register(userData: RegisterData) {
  try {
    // Asegurar que el rol sea 'cliente' para la app móvil
    const dataToSend = {
      ...userData,
      rol: 'cliente'
    };
    
    const response = await api.post('/auth/register', dataToSend);
    const data = response.data;
    
    // Extraer información de la respuesta
    const token = data?.token || data?.data?.token;
    const user = data?.usuario || data?.user || data?.data?.usuario || data?.data?.user;
    
    // Si el registro incluye auto-login (devuelve token)
    if (token) {
      await AsyncStorage.setItem('token', token);
      if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }
    }
    
    return { 
      success: true, 
      user,
      token,
      message: data?.message || 'Registro exitoso'
    };
  } catch (error: any) {
    console.error('Error en registro:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'Error al registrar usuario'
    );
  }
}

/**
 * Obtener usuario actual - Consume GET /api/auth/profile
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await api.get('/auth/profile');
    const data = response.data;
    
    // Extraer usuario de diferentes formatos de respuesta
    const user = data?.data || data?.usuario || data?.user || data;
    
    if (user) {
      // Actualizar cache local
      await AsyncStorage.setItem('user', JSON.stringify(user));
      return user;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error al obtener usuario:', error);
    // Si hay error 401, limpiar sesión
    if (error.response?.status === 401) {
      await logout();
    }
    return null;
  }
}

/**
 * Cerrar sesión - Limpiar datos locales
 */
export async function logout() {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
}

/**
 * Obtener usuario desde cache local
 */
export async function getCachedUser(): Promise<User | null> {
  try {
    const userString = await AsyncStorage.getItem('user');
    if (userString) {
      return JSON.parse(userString);
    }
    return null;
  } catch (error) {
    console.error('Error al obtener usuario en cache:', error);
    return null;
  }
}

/**
 * Verificar si hay sesión activa
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  } catch (error) {
    return false;
  }
}

/**
 * Recuperar contraseña - Consume POST /api/auth/forgot-password
 */
export async function forgotPassword(email: string) {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return {
      success: true,
      message: response.data?.message || 'Correo de recuperación enviado'
    };
  } catch (error: any) {
    console.error('Error en recuperar contraseña:', error);
    throw new Error(
      error.response?.data?.message || 
      'Error al enviar correo de recuperación'
    );
  }
}
