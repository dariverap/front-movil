# Configuración de la App Móvil - Parking System

## API Configuration

La app móvil consume la API Node.js ubicada en `../api-nodejs-parking`.

### Variables de entorno con react-native-config

La app usa `react-native-config` para gestionar variables de entorno desde un archivo `.env` (ya instalado y configurado).

**Configuración inicial:**

```bash
# 1. Copia el archivo de ejemplo
cp .env.example .env

# 2. Edita .env y configura la URL de tu API
# Ejemplo para Android Emulator:
API_BASE_URL=http://10.0.2.2:3000/api

# Para iOS Simulator:
# API_BASE_URL=http://localhost:3000/api

# Para dispositivo físico (usa la IP de tu computadora):
# API_BASE_URL=http://192.168.1.X:3000/api

# Para producción:
# API_BASE_URL=https://tu-api.com/api
```

**Después de cambiar `.env` debes recompilar la app** para que los cambios nativos se apliquen:

```bash
# Android
npm run android

# iOS (requiere macOS)
cd ios && pod install && cd ..
npm run ios
```

El archivo `src/lib/api.ts` lee automáticamente `API_BASE_URL` desde react-native-config.

> **Importante:** `.env` está en `.gitignore` para evitar subir credenciales al repositorio. Comparte `.env.example` con tu equipo.

## Solución de problemas con iconos

### Android

Los iconos faltantes se deben a que las fuentes no están vinculadas. Ya está configurado en `android/app/build.gradle`:

```gradle
apply from: file("../../node_modules/react-native-vector-icons/fonts.gradle")
```

**Para aplicar los cambios:**

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

### iOS

Las fuentes ya están incluidas automáticamente. Si hay problemas:

```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

## Ejecutar la aplicación

### Prerrequisitos

1. **API corriendo**: La API debe estar activa en `http://localhost:3000`
   ```bash
   cd api-nodejs-parking
   npm run dev
   ```

2. **Dependencias instaladas**:
   ```bash
   cd front-movil
   npm install
   ```

### Android

```bash
# Iniciar Metro Bundler
npm start

# En otra terminal, correr en Android
npm run android
```

### iOS (Solo macOS)

```bash
# Instalar pods
cd ios && pod install && cd ..

# Correr en iOS
npm run ios
```

## Funcionalidades Implementadas

### ✅ Autenticación
- Login con email y contraseña
- Registro de nuevos usuarios (rol: cliente)
- Validaciones de formularios
- Manejo de sesión con AsyncStorage
- Auto-login si hay sesión activa

### ✅ Integración con API
- Axios configurado con interceptores
- Token JWT automático en headers
- Manejo de errores 401 (sesión expirada)
- Timeouts de 15 segundos

### 🔄 Pendiente
- Recuperación de contraseña
- Perfil de usuario editable
- Búsqueda y reserva de parkings
- Historial de reservas
- Métodos de pago

## Estructura de archivos creados

```
src/
├── lib/
│   ├── api.ts           # Cliente HTTP con Axios
│   └── auth.ts          # Servicios de autenticación
├── hooks/
│   └── useAuth.tsx      # Contexto y hook de autenticación
└── screens/
    ├── LoginScreen.tsx     # Pantalla de login (actualizada)
    └── RegisterScreen.tsx  # Pantalla de registro (nueva)
```

## Debugging

### Ver logs en tiempo real

**Android:**
```bash
npx react-native log-android
```

**iOS:**
```bash
npx react-native log-ios
```

### Limpiar cache

Si hay problemas, limpiar cache:

```bash
# Limpiar Metro
npx react-native start --reset-cache

# Limpiar build Android
cd android && ./gradlew clean && cd ..

# Limpiar build iOS
cd ios && rm -rf Pods && pod install && cd ..
```

## Usuarios de prueba

Crear usuarios de prueba a través de la app de registro o usando el API directamente:

```json
{
  "email": "cliente@test.com",
  "password": "test123",
  "nombre": "Cliente",
  "apellido": "Prueba",
  "rol": "cliente"
}
```

## Próximos pasos

1. Implementar búsqueda de parkings (MapScreen)
2. Ver detalles de parking
3. Sistema de reservas
4. Integración de pagos
5. Notificaciones push
