# Verificación de Variables de Entorno - React Native Config

Este documento describe cómo verificar que `react-native-config` está funcionando correctamente.

## Estado de la configuración

✅ **react-native-config instalado:** v1.5.9  
✅ **Configuración Android aplicada:** `android/app/build.gradle` actualizado  
✅ **API client actualizado:** `src/lib/api.ts` usa `Config.API_BASE_URL`  
✅ **Tipos TypeScript creados:** `src/types/react-native-config.d.ts`

## Verificación rápida

### 1. Comprobar que el archivo `.env` existe

Tu archivo `.env` debe contener:
```
API_BASE_URL=http://10.0.2.2:3000/api
```

### 2. Confirmar que gradle lee el .env

Al ejecutar `npm run android`, deberías ver en la salida:
```
> Configure project :app
Reading env from: .env
```

### 3. Verificar en runtime (opcional)

Puedes añadir temporalmente en `src/screens/LoginScreen.tsx` o cualquier pantalla:

```typescript
import Config from 'react-native-config';

// En el componente:
console.log('API_BASE_URL desde Config:', Config.API_BASE_URL);
```

Luego ejecuta la app y revisa los logs en Metro:
```bash
# En otra terminal, mientras la app corre:
npx react-native log-android
```

## Troubleshooting

### Si Config.API_BASE_URL está undefined:

1. **Verifica que `.env` existe** en la raíz de `front-movil/`
2. **Limpia el build:**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npm run android
   ```
3. **Recuerda:** cambios en `.env` requieren recompilar (no solo reiniciar Metro)

### Para iOS (requiere macOS):

```bash
cd ios
pod install
cd ..
npm run ios
```

## Próximos pasos

- ✅ La app ahora lee `API_BASE_URL` desde `.env`
- ✅ Puedes crear diferentes archivos `.env.staging`, `.env.production` para builds específicos
- ✅ Otras variables sensibles (API keys) pueden añadirse al `.env` de la misma forma

## Ejemplo de uso en código

```typescript
// src/lib/api.ts (ya configurado)
import Config from 'react-native-config';

const API_BASE_URL = Config.API_BASE_URL || 'http://10.0.2.2:3000/api';
```

El fallback (`|| 'http://...'`) asegura que siempre haya un valor por defecto si `.env` no está presente.
