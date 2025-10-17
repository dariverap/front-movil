# 🗺️ Implementación del Mapa con Parkings Reales

Documentación de la implementación del mapa interactivo que muestra los parkings registrados en la base de datos.

## 📋 Cambios Realizados

### 1. ✅ Dependencias Instaladas

```bash
npm install react-native-maps
```

**react-native-maps**: Librería para mostrar mapas nativos (Google Maps en Android, Apple Maps en iOS)

### 2. ✅ API Service (`src/lib/api.ts`)

Se agregaron las funciones para obtener parkings desde el backend:

```typescript
export interface Parking {
  id_parking: number;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  capacidad_total: number;
  id_admin?: string;
}

// Obtener todos los parkings
export const getParkings = async (): Promise<Parking[]> => {
  const response = await api.get('/parking');
  return response.data.data || response.data;
};

// Obtener parkings cercanos
export const getNearbyParkings = async (lat: number, lng: number, radius: number = 5): Promise<Parking[]> => {
  const response = await api.get('/parking/cercanos', {
    params: { lat, lng, radius }
  });
  return response.data.data || response.data;
};

// Obtener parking por ID
export const getParkingById = async (id: number): Promise<Parking> => {
  const response = await api.get(`/parking/${id}`);
  return response.data.data || response.data;
};
```

### 3. ✅ MapScreen Actualizado (`src/screens/MapScreen.tsx`)

#### Cambios principales:

**Imports agregados:**
```typescript
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { getParkings, Parking } from '../lib/api';
```

**Estados nuevos:**
```typescript
const [parkings, setParkings] = useState<Parking[]>([]);
const [loading, setLoading] = useState(true);
const [selectedParking, setSelectedParking] = useState<Parking | null>(null);
const [userLocation, setUserLocation] = useState(DEFAULT_REGION);
```

**Funciones clave:**

1. **loadParkings()**: Carga parkings desde la API
   ```typescript
   const loadParkings = async () => {
     try {
       setLoading(true);
       const data = await getParkings();
       setParkings(data);
       
       // Centrar mapa en el primer parking
       if (data.length > 0) {
         const firstParking = data[0];
         setUserLocation({
           latitude: Number(firstParking.latitud),
           longitude: Number(firstParking.longitud),
           latitudeDelta: 0.0922,
           longitudeDelta: 0.0421,
         });
       }
     } catch (error) {
       Alert.alert('Error', 'No se pudieron cargar los parkings');
     } finally {
       setLoading(false);
     }
   };
   ```

2. **calculateDistance()**: Calcula distancia entre dos coordenadas (fórmula de Haversine)
   ```typescript
   function calculateDistance(lat1, lon1, lat2, lon2): number {
     const R = 6371; // Radio de la Tierra en km
     // ... cálculo de distancia
     return R * c;
   }
   ```

3. **onMarkerPress()**: Maneja el click en un marker
   ```typescript
   function onMarkerPress(parking: Parking) {
     setSelectedParking(parking);
     mapRef.current?.animateToRegion({
       latitude: Number(parking.latitud),
       longitude: Number(parking.longitud),
       latitudeDelta: 0.01,
       longitudeDelta: 0.01,
     }, 1000);
     animateTo(SHEET_EXPANDED_TOP);
   }
   ```

**Componente MapView:**
```tsx
<MapView
  ref={mapRef}
  provider={PROVIDER_GOOGLE}
  style={styles.map}
  initialRegion={userLocation}
  showsUserLocation
  showsMyLocationButton={false}
>
  {parkings.map((parking) => (
    <Marker
      key={parking.id_parking}
      coordinate={{
        latitude: Number(parking.latitud),
        longitude: Number(parking.longitud),
      }}
      title={parking.nombre}
      description={parking.direccion}
      onPress={() => onMarkerPress(parking)}
    >
      <View style={styles.markerContainer}>
        <Icon name="car" size={24} color={COLORS.white} />
      </View>
    </Marker>
  ))}
</MapView>
```

### 4. ✅ Configuración de Android

**AndroidManifest.xml** actualizado con permisos de ubicación y API Key de Google Maps:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<application>
  <!-- Google Maps API Key -->
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
  ...
</application>
```

## 🔑 Obtener Google Maps API Key

### Pasos:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo o selecciona uno existente
3. Habilita **Maps SDK for Android**
4. Ve a **Credentials** → **Create Credentials** → **API Key**
5. Copia la API Key generada
6. Restringe la API Key (opcional pero recomendado):
   - Por aplicación Android (usa el package name: `com.parklymobile`)
   - Por IP (si es para desarrollo)

### Configurar la API Key:

Reemplaza `YOUR_GOOGLE_MAPS_API_KEY` en `AndroidManifest.xml` con tu key real:

```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"/>
```

## 📊 Estructura de Datos

### Backend Response (`GET /api/parking`):

```json
{
  "success": true,
  "data": [
    {
      "id_parking": 1,
      "nombre": "Parking Central Lima",
      "direccion": "Av. Javier Prado 123, San Isidro",
      "latitud": -12.0897,
      "longitud": -77.0282,
      "capacidad_total": 50,
      "id_admin": "uuid-del-admin"
    },
    {
      "id_parking": 2,
      "nombre": "Plaza Norte Parking",
      "direccion": "Av. Túpac Amaru 210, Independencia",
      "latitud": -12.0089,
      "longitud": -77.0612,
      "capacidad_total": 120,
      "id_admin": "uuid-del-admin"
    }
  ]
}
```

## 🎨 Funcionalidades Implementadas

### ✅ En la Vista del Mapa:

1. **Carga automática de parkings**: Al montar el componente
2. **Markers personalizados**: Icono de carro con estilo circular
3. **Loading state**: Spinner mientras carga los datos
4. **Error handling**: Alert si falla la carga
5. **Centrado automático**: El mapa se centra en el primer parking disponible

### ✅ En el Bottom Sheet:

1. **Lista de parkings**: FlatList con todos los parkings
2. **Cálculo de distancia**: Muestra distancia en km desde la ubicación actual
3. **Interacción**: Click en un item centra el mapa en ese parking
4. **Contador dinámico**: "X parkings encontrados"

### ✅ Controles del Mapa:

1. **Botón de localización**: Centra el mapa en la ubicación del usuario
2. **FAB de reserva rápida**: Acceso directo a reservas
3. **Barra de búsqueda**: (preparada para implementar búsqueda)

## 🚀 Siguiente Pasos (Pendientes)

### 1. Implementar Búsqueda por Dirección
- Integrar Google Places API
- Autocompletar direcciones
- Filtrar parkings por búsqueda

### 2. Obtener Ubicación Real del Usuario
- Usar `react-native-geolocation-service`
- Pedir permisos de ubicación
- Actualizar `userLocation` con la ubicación real

### 3. Mostrar Disponibilidad en Markers
- Color del marker según disponibilidad:
  - Verde: >50% espacios disponibles
  - Amarillo: 20-50% disponibles
  - Rojo: <20% disponibles
  - Gris: Sin espacios

### 4. Implementar Filtros
- Por precio
- Por disponibilidad
- Por distancia
- Por servicios (techado, seguridad, etc.)

### 5. Detalles del Parking
- Vista detallada al hacer click en un parking
- Galería de fotos
- Horarios
- Tarifas
- Servicios
- Botón de reserva

### 6. Optimización
- Cluster de markers (cuando hay muchos parkings cercanos)
- Lazy loading de parkings (solo cargar los visibles en el mapa)
- Cache de datos

## 🐛 Troubleshooting

### Problema: "Google Play Services not available"
**Solución**: Asegúrate de que el emulador tenga Google Play Services instalado. Usa un emulador con Google APIs.

### Problema: "Mapa en blanco"
**Solución**: 
1. Verifica que la API Key esté correctamente configurada
2. Verifica que Maps SDK for Android esté habilitado en Google Cloud
3. Revisa los logs de Android con `npx react-native log-android`

### Problema: "Markers no aparecen"
**Solución**:
1. Verifica que el backend esté devolviendo datos
2. Revisa la consola: `console.log('Parkings cargados:', data)`
3. Verifica que `latitud` y `longitud` sean números válidos

### Problema: "Cannot read property 'latitud' of undefined"
**Solución**: Asegúrate de convertir a número: `Number(parking.latitud)`

## 📝 Notas Técnicas

### Coordenadas por Defecto
Actualmente usa Lima, Perú como centro por defecto:
```typescript
const DEFAULT_REGION = {
  latitude: -12.0464,  // Lima, Perú
  longitude: -77.0428,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};
```

### Fórmula de Haversine
Calcula la distancia entre dos puntos en la superficie de una esfera (la Tierra):
- **R = 6371 km**: Radio de la Tierra
- Precisión: ±0.5% en distancias cortas (<1000 km)

### Performance
- **FlatList**: Renderizado eficiente de lista de parkings
- **useRef**: Evita re-renders innecesarios del mapa
- **Animated**: Animaciones nativas para mejor performance

## ✅ Estado Actual

- [x] react-native-maps instalado
- [x] API endpoints implementados
- [x] MapView integrado
- [x] Markers personalizados
- [x] Bottom sheet con lista de parkings
- [x] Cálculo de distancia
- [x] Loading states
- [x] Error handling
- [x] Permisos de ubicación en AndroidManifest
- [ ] Google Maps API Key configurada (pendiente - usuario debe hacerlo)
- [ ] Ubicación real del usuario
- [ ] Búsqueda de direcciones
- [ ] Filtros de parkings
- [ ] Vista de detalle del parking

---

**Última actualización**: 15 de octubre de 2025
**Versión**: 1.0.0
