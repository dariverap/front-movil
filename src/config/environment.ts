// Configuración de entornos de la aplicación
// __DEV__ es una variable global de React Native que indica si está en modo desarrollo

interface EnvironmentConfig {
  API_BASE_URL: string;
  TIMEOUT: number;
  DEBUG_API: boolean;
}

const environments: Record<'development' | 'production', EnvironmentConfig> = {
  development: {
    // Para desarrollo local, usar IP de tu máquina en la red local
    // Android emulador: http://10.0.2.2:3000/api
    // Dispositivo físico: http://TU_IP_LOCAL:3000/api
    API_BASE_URL: 'http://192.168.1.100:3000/api', // Cambiar por tu IP local
    TIMEOUT: 30000,
    DEBUG_API: true,
  },
  production: {
    // URL de producción en Azure
    API_BASE_URL: 'https://apiparking-hzcshhfhgggybuf2.brazilsouth-01.azurewebsites.net/api',
    TIMEOUT: 15000,
    DEBUG_API: false,
  },
};

// Determinar entorno actual basado en __DEV__
const CURRENT_ENV: 'development' | 'production' = __DEV__ ? 'development' : 'production';

// Exportar configuración del entorno actual
export const config = environments[CURRENT_ENV];

// Log de configuración en desarrollo
if (__DEV__) {
  console.log('[CONFIG] Entorno actual:', CURRENT_ENV);
  console.log('[CONFIG] API Base URL:', config.API_BASE_URL);
}

export default config;
