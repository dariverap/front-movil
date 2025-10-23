# Configuración de API para React Native

## Problema: "Cargando historial..." se queda colgado

### Diagnóstico

Si la pantalla de Historial se queda en "Cargando historial..." indefinidamente, verifica lo siguiente:

### 1. URL de la API (Archivo `.env`)

La URL debe coincidir con tu entorno de desarrollo:

#### Android Emulator (AVD - Android Studio)
```
API_BASE_URL=http://10.0.2.2:3000/api
```

#### Genymotion Emulator
```
API_BASE_URL=http://10.0.3.2:3000/api
```

#### Dispositivo Físico (misma red WiFi)
```
API_BASE_URL=http://192.168.X.X:3000/api
```
Reemplaza `192.168.X.X` con la IP de tu computadora. Para obtenerla:
- Windows: `ipconfig` en CMD
- Mac/Linux: `ifconfig` o `ip addr`

### 2. Verificar que el servidor backend esté corriendo

```bash
cd api-nodejs-parking
npm start
```

Debe mostrar: `Servidor corriendo en http://localhost:3000`

### 3. Ver logs en tiempo real

**En React Native (Metro Bundler):**
Los logs aparecerán automáticamente en la terminal donde ejecutas:
```bash
npm start
```

**En el Logcat de Android (más detallado):**
```bash
npx react-native log-android
```

Busca líneas que empiecen con `[API]` o `[HistoryScreen]`

### 4. Verificar conectividad

Prueba hacer un request manual desde tu navegador o Postman:

```
GET http://10.0.2.2:3000/api/auth/profile
```

Con el header:
```
Authorization: Bearer TU_TOKEN_AQUI
```

### 5. Verificar token de autenticación

Si el token no es válido o ha expirado, el endpoint rechazará la petición.

Para ver el token guardado, agrega este código temporal en `HistoryScreen.tsx`:

```typescript
useEffect(() => {
  AsyncStorage.getItem('token').then(token => {
    console.log('[DEBUG] Token:', token ? 'Existe' : 'No existe');
  });
}, []);
```

### 6. Logs implementados

Con los cambios recientes, verás estos logs:

**Backend:**
```
[getHistorialUsuario] Inicio - id: <USER_ID> requester: <USER_ID>
[getHistorialUsuario] Llamando modelo con filtros: {...}
[getHistorialUsuario] Operaciones encontradas: X
```

**Frontend:**
```
[API] Configuración inicial - Base URL: http://10.0.2.2:3000/api
[API] Request: GET /usuarios/<ID>/historial
[API] Token agregado a headers
[API] Response: 200 /usuarios/<ID>/historial
[HistoryScreen] Historial recibido: X items
```

### 7. Solución rápida

1. **Cambiar la IP en `.env`:**
   ```
   API_BASE_URL=http://10.0.2.2:3000/api
   ```

2. **Recargar la app completamente:**
   - Cerrar la app en el emulador
   - En la terminal de Metro: presiona `r` para reload
   - O presiona `Ctrl+M` en Android y selecciona "Reload"

3. **Limpiar caché si es necesario:**
   ```bash
   cd front-movil
   npm start -- --reset-cache
   ```

### 8. Probar el endpoint directamente

Si usas Postman o similar, prueba:

```http
GET http://localhost:3000/api/usuarios/641720f7-89ce-437e-99b2-7e4c7ee586ab/historial?limit=100
Authorization: Bearer <TU_TOKEN>
```

Debería devolver:
```json
{
  "success": true,
  "data": [ ... ]
}
```

### 9. Errores comunes

| Error | Causa | Solución |
|-------|-------|----------|
| Network Error | IP incorrecta o servidor no está corriendo | Verifica la IP en `.env` y que el backend esté activo |
| 401 Unauthorized | Token inválido o expirado | Cierra sesión y vuelve a iniciar sesión |
| 403 Forbidden | Usuario intentando acceder al historial de otro | Verifica que `user.id_usuario` coincida con el ID en la URL |
| Timeout | Servidor muy lento o query muy pesada | Reduce el `limit` en los filtros |

### 10. Reiniciar desde cero

Si nada funciona:

```bash
# Backend
cd api-nodejs-parking
rm -rf node_modules package-lock.json
npm install
npm start

# Frontend (otra terminal)
cd front-movil
rm -rf node_modules package-lock.json
npm install
npm start -- --reset-cache

# En otra terminal, rebuild
cd front-movil
npx react-native run-android
```
