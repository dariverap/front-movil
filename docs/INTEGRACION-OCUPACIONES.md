# 📱 Integración App Móvil - Flujo Reserva → Ocupación

## ✅ Cambios Realizados

### 1. **API Client (`src/lib/api.ts`)** ✅
Se agregaron las siguientes funciones para manejar ocupaciones:

```typescript
// Nuevas interfaces
export interface Ocupacion {
  id_ocupacion: number;
  id_reserva?: number;
  id_usuario: string;
  id_espacio: number;
  id_vehiculo?: number;
  hora_entrada: string;
  hora_salida?: string | null;
  costo_total?: number | null;
  // Datos de las vistas
  cliente?: string;
  vehiculo_placa?: string;
  parking?: string;
  numero_espacio?: string;
  horas_transcurridas?: number;
  costo_actual?: number;
  tarifa_hora?: number;
}

// Nuevas funciones
marcarEntrada(id_reserva: number) → POST /ocupaciones/marcar-entrada
marcarSalida(id_ocupacion: number) → POST /ocupaciones/marcar-salida
getOcupacionActiva() → GET /ocupaciones/activa
getHistorialOcupaciones() → GET /ocupaciones/historial
```

### 2. **Tema Actualizado (`src/lib/theme.ts`)** ✅
Se agregaron colores y estilos de tipografía necesarios:

```typescript
// Nuevos colores
success, successLight
warning, warningLight
error, errorLight
info, infoLight
text, textSecondary
border

// Nuevos estilos de texto
TYPE.h1, TYPE.h2, TYPE.h3
TYPE.title, TYPE.subtitle
TYPE.body, TYPE.small
```

### 3. **ReserveFlowScreen Actualizado** ✅
- ✅ Ya incluía `id_vehiculo` en la reserva (no había que cambiar nada)
- ✅ Ahora navega a `ReservationConfirmed` en lugar de mostrar Alert
- ✅ Pasa datos completos: reserva, parking, espacio, vehiculo

### 4. **Nueva Pantalla: `ReservationConfirmedScreen.tsx`** ✅
**Propósito:** Confirmación de reserva con botón "He llegado"

**Características:**
- ✅ Muestra detalles de la reserva creada
- ✅ Información del parking, espacio y vehículo
- ✅ Fecha/hora estimada de inicio y fin
- ✅ Botón "He llegado al parking" → llama `marcarEntrada()`
- ✅ Navegación a `ActiveParking` después de marcar entrada

**Flujo:**
```
ReserveFlow → [Crear reserva] → ReservationConfirmed
                                         ↓
                               [He llegado] → ActiveParking
```

### 5. **Nueva Pantalla: `ActiveParkingScreen.tsx`** ✅
**Propósito:** Mostrar ocupación activa con timer en tiempo real

**Características:**
- ✅ Timer que muestra tiempo transcurrido (actualizado cada minuto)
- ✅ Costo actual calculado en tiempo real
- ✅ Información del parking, espacio y vehículo
- ✅ Botón "Marcar salida" → llama `marcarSalida()`
- ✅ Pull-to-refresh para actualizar datos
- ✅ Cálculo de costo: CEIL(horas) × tarifa_hora

**Cálculo de costo:**
```typescript
// Ejemplo: 2.3 horas = 3 fracciones × S/4.00 = S/12.00
const fracciones = Math.ceil(horasTranscurridas);
const costo = fracciones * tarifa_hora;
```

### 6. **Navegación Actualizada (`App.tsx`)** ✅
Se agregaron las nuevas pantallas:

```typescript
<Stack.Screen name="ReservationConfirmed" component={ReservationConfirmedScreen} />
<Stack.Screen name="ActiveParking" component={ActiveParkingScreen} />
```

---

## 🔄 Flujo Completo de Usuario

```
┌─────────────────────────────────────────────────────────────┐
│ 1. MAPA                                                      │
│    - Usuario ve parkings en el mapa                         │
│    - Click en marcador → ParkingDetail                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. PARKING DETAIL                                            │
│    - Ver detalles del parking                               │
│    - Ver tarifas (hora, día, mes, noche)                    │
│    - Click "Reservar" → ReserveFlow                         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. RESERVE FLOW (4 pasos)                                   │
│    Paso 1: Seleccionar fecha y hora                         │
│    Paso 2: Seleccionar espacio disponible                   │
│    Paso 3: Seleccionar vehículo                             │
│    Paso 4: Confirmar y pagar                                │
│    → Crear reserva en DB (estado: 'pendiente')              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. RESERVATION CONFIRMED  ✅ NUEVO                          │
│    - Resumen de la reserva                                  │
│    - Información del parking y espacio                      │
│    - Botón "He llegado al parking"                          │
│    → Llama marcarEntrada(id_reserva)                        │
│    → Crea ocupacion en DB (hora_entrada = NOW())            │
│    → Cambia reserva.estado = 'activa'                       │
│    → Cambia espacio.estado = 'ocupado'                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. ACTIVE PARKING  ✅ NUEVO                                 │
│    - Timer en tiempo real (actualizado cada minuto)         │
│    - Costo actual: CEIL(horas) × tarifa                     │
│    - Información del parking, espacio, vehículo             │
│    - Pull-to-refresh                                        │
│    - Botón "Marcar salida"                                  │
│    → Llama marcarSalida(id_ocupacion)                       │
│    → Registra ocupacion.hora_salida = NOW()                 │
│    → Calcula ocupacion.costo_total                          │
│    → Cambia espacio.estado = 'disponible'                   │
│    → Cambia reserva.estado = 'completada'                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. PAGO (futuro)                                            │
│    - Mostrar costo final                                    │
│    - Seleccionar método de pago                             │
│    - Procesar pago                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗃️ Estados de las Tablas

### **Tabla `reserva`**
```
Estado inicial: 'pendiente'
Después de marcar entrada: 'activa'
Después de marcar salida: 'completada'
```

### **Tabla `espacio`**
```
Estado inicial: 'disponible'
Después de marcar entrada: 'ocupado'
Después de marcar salida: 'disponible'
```

### **Tabla `ocupacion`**
```
Al marcar entrada:
- id_reserva: ID de la reserva
- id_usuario: ID del usuario
- id_espacio: ID del espacio
- id_vehiculo: ID del vehículo
- hora_entrada: NOW()
- hora_salida: NULL
- costo_total: NULL

Al marcar salida:
- hora_salida: NOW()
- costo_total: CALCULADO automáticamente (trigger)
```

---

## 🔧 Endpoints del Backend que Necesitas Crear

### 1. **POST `/api/ocupaciones/marcar-entrada`**
```javascript
// Controller: ocupacion.controller.js
async function marcarEntrada(req, res) {
  const { id_reserva } = req.body;
  
  // Llamar a la función SQL
  const { data, error } = await supabase
    .rpc('marcar_entrada_parking', { p_id_reserva: id_reserva });
  
  if (error) throw error;
  
  res.json({ success: true, data: { id_ocupacion: data } });
}
```

### 2. **POST `/api/ocupaciones/marcar-salida`**
```javascript
async function marcarSalida(req, res) {
  const { id_ocupacion } = req.body;
  
  const { data, error } = await supabase
    .rpc('marcar_salida_parking', { p_id_ocupacion: id_ocupacion });
  
  if (error) throw error;
  
  res.json({ 
    success: true, 
    data: {
      costo_calculado: data[0].costo_calculado,
      tiempo_total_horas: data[0].tiempo_total_horas
    }
  });
}
```

### 3. **GET `/api/ocupaciones/activa`**
```javascript
async function getOcupacionActiva(req, res) {
  const userId = req.user.id; // Del token JWT
  
  const { data, error } = await supabase
    .from('vista_ocupaciones_activas')
    .select('*')
    .eq('id_usuario', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  
  res.json({ success: true, data: data || null });
}
```

### 4. **GET `/api/ocupaciones/historial`**
```javascript
async function getHistorialOcupaciones(req, res) {
  const userId = req.user.id;
  
  const { data, error } = await supabase
    .from('vista_historial_ocupaciones')
    .select('*')
    .eq('id_usuario', userId)
    .order('hora_salida', { ascending: false })
    .limit(50);
  
  if (error) throw error;
  
  res.json({ success: true, data });
}
```

### 5. **Actualizar `/api/reservas` (POST)**
```javascript
// Asegurarse de que incluya id_vehiculo
async function createReserva(req, res) {
  const { id_espacio, id_vehiculo, fecha_inicio, fecha_fin } = req.body;
  const id_usuario = req.user.id;
  
  const { data, error } = await supabase
    .from('reserva')
    .insert({
      id_usuario,
      id_espacio,
      id_vehiculo, // ✅ IMPORTANTE: Incluir esto
      hora_inicio: fecha_inicio,
      hora_fin: fecha_fin,
      estado: 'pendiente'
    })
    .select()
    .single();
  
  if (error) throw error;
  
  res.json({ success: true, data });
}
```

---

## 📋 Checklist de Implementación

### En el Backend (API Node.js):
- [ ] Ejecutar script SQL `mejora-flujo-reserva-ocupacion.sql` en Supabase
- [ ] Crear `src/controllers/ocupacion.controller.js`
- [ ] Crear `src/routes/ocupacion.routes.js`
- [ ] Agregar rutas en `src/index.js`: `app.use('/api/ocupaciones', ocupacionRoutes)`
- [ ] Actualizar `createReserva` para incluir `id_vehiculo` ✅ (ya incluido)
- [ ] Probar endpoints con Postman o test-api.ps1

### En la App Móvil:
- [x] Actualizar `src/lib/api.ts` con funciones de ocupación ✅
- [x] Actualizar `src/lib/theme.ts` con colores faltantes ✅
- [x] Crear `ReservationConfirmedScreen.tsx` ✅
- [x] Crear `ActiveParkingScreen.tsx` ✅
- [x] Actualizar `ReserveFlowScreen.tsx` para navegar a confirmación ✅
- [x] Agregar pantallas a navegación en `App.tsx` ✅
- [ ] Probar flujo completo en emulador

---

## 🧪 Pruebas Recomendadas

### 1. Prueba del Flujo Completo:
```
1. Login con usuario cliente
2. Ver mapa → Click en parking
3. Ver detalles → Click "Reservar"
4. Completar 4 pasos → Confirmar reserva
5. Ver pantalla de confirmación
6. Click "He llegado" → Ver ActiveParking con timer
7. Esperar 1-2 minutos → Ver que el timer se actualiza
8. Click "Marcar salida" → Ver costo calculado
```

### 2. Verificar en Base de Datos:
```sql
-- Ver reserva creada
SELECT * FROM reserva WHERE id_usuario = 'tu-uuid' ORDER BY fecha_reserva DESC LIMIT 1;

-- Ver ocupación activa
SELECT * FROM vista_ocupaciones_activas WHERE cliente LIKE '%Tu Nombre%';

-- Ver historial
SELECT * FROM vista_historial_ocupaciones WHERE cliente LIKE '%Tu Nombre%';
```

---

## 📊 Resumen de Archivos Creados/Modificados

### Creados:
1. ✅ `src/screens/ReservationConfirmedScreen.tsx` (295 líneas)
2. ✅ `src/screens/ActiveParkingScreen.tsx` (372 líneas)
3. ✅ `api-nodejs-parking/migrations/mejora-flujo-reserva-ocupacion.sql` (355 líneas)
4. ✅ `api-nodejs-parking/migrations/README-FLUJO-RESERVA-OCUPACION.md`
5. ✅ `api-nodejs-parking/migrations/VERIFICACION-SEGURIDAD.md`

### Modificados:
1. ✅ `src/lib/api.ts` (+ 45 líneas)
2. ✅ `src/lib/theme.ts` (+ colores y tipografías)
3. ✅ `src/screens/ReserveFlowScreen.tsx` (cambio en handleConfirmReservation)
4. ✅ `App.tsx` (+ 2 pantallas en navegación)

---

## 🚀 Próximos Pasos

1. **Crear controllers y routes de ocupaciones en el backend**
2. **Probar endpoints con Postman**
3. **Probar flujo completo en la app móvil**
4. **Implementar pantalla de historial de ocupaciones**
5. **Implementar proceso de pago**
6. **Agregar notificaciones push cuando llegue la hora estimada**

---

## 💡 Notas Importantes

- ✅ El script SQL es **100% seguro** - no modifica datos existentes
- ✅ Las columnas nuevas (`id_vehiculo`) tendrán valor `NULL` en registros antiguos
- ✅ El timer se actualiza cada 60 segundos para no saturar la CPU
- ✅ El costo se calcula con **redondeo hacia arriba** (por fracción)
- ✅ Los estados de reserva/espacio se actualizan automáticamente vía SQL functions
- ⚠️ Falta implementar selección real de fecha/hora (actualmente usa mocks)
- ⚠️ Falta implementar proceso de pago real
