# Configuración de Sentry para MenuPlus Frontend

## ✅ Configuración Completada

Sentry ha sido configurado exitosamente para trabajar con tu monitoring stack en Docker.

## 📋 Resumen de la Configuración

### 1. Dependencias Instaladas
- `@sentry/astro` - Integración oficial para Astro
- `@sentry/node` - Para el server-side rendering

### 2. Archivos de Configuración Creados

#### `sentry.client.config.js`
- Configuración para el cliente
- Filtrado de errores de extensiones
- Session Replay configurado

#### `sentry.server.config.js`
- Configuración para el servidor
- Tracing de peticiones HTTP
- Filtrado de health checks

### 3. Integraciones Realizadas

#### Astro (`astro.config.mjs`)
- Integración de Sentry añadida

#### BaseLayout.astro
- Importación de Sentry inicial

#### useErrorHandler.js
- Integración con el hook existente de manejo de errores
- Envío automático de errores a Sentry
- Breadcrumbs para seguimiento

#### Archivos de utilidad
- `src/sentry.js` - Inicialización básica
- `src/hooks/useSentryError.js` - Hook personalizado
- `src/utils/sentryTest.js` - Utilidades de prueba

## 🚀 Próximos Pasos

### 1. Acceder a Sentry

Ahora Sentry está disponible a través de tu dominio:
```
https://menusesqr.online/sentry
Usuario: admin@monitoring.local
Password: admin123
```

### 2. Obtener el DSN Correcto

1. Crea un nuevo proyecto llamado "menu-plus-front" en Sentry
2. Copia el DSN proporcionado (tendrá el formato: `https://public-key@menusesqr.online/sentry/project-id`)
3. Actualiza el DSN en los siguientes archivos:
   - `.env` (PUBLIC_SENTRY_DSN)
   - `sentry.client.config.js`
   - `sentry.server.config.js`

Nota: El DSN actual está configurado como `https://menusesqr.online/sentry`, pero necesitarás el DSN completo con el project ID para que funcione correctamente.

### 3. Variables de Entorno

Actualiza tu archivo `.env` con el DSN real:

```env
# Sentry Configuration
PUBLIC_SENTRY_DSN=https://public-key@menusesqr.online/sentry/project-id
SENTRY_ENVIRONMENT=production
```

### 4. Probar la Integración

Añade esto a cualquier componente en desarrollo para probar:

```javascript
import { testSentryIntegration } from '../utils/sentryTest.js';

// En un useEffect o evento
testSentryIntegration();
```

### 5. Monitoreo

Una vez configurado con el DSN real:

- **Errores de JavaScript**: Se capturarán automáticamente
- **Errores de API**: Se capturan a través del hook `useErrorHandler`
- **Eventos de usuario**: Puedes registrar con `trackUserEvent()`
- **Performance**: Tracing automático de carga de página y transacciones

## 📊 Qué está monitoreando Sentry

1. **Errores de JavaScript** no controlados
2. **Errores de API** capturados por el hook de errores
3. **Rendimiento** de la aplicación
4. **Session Replay** para errores
5. **Breadcrumbs** de navegación y eventos importantes

## 🔧 Personalización Adicional

### Para agregar más información del usuario:

```javascript
import { useSentryError } from '../hooks/useSentryError.js';

const { setUser } = useSentryError();

// Cuando el usuario inicia sesión
setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});
```

### Para capturar errores manualmente:

```javascript
import { useSentryError } from '../hooks/useSentryError.js';

const { captureException } = useSentryError();

try {
  // Tu código que puede fallar
} catch (error) {
  captureException(error, {
    customContext: 'additional info',
  });
}
```

## 🚨 Notas Importantes

1. **Solo se envían errores de producción/serios** a Sentry
2. **Los errores de validación** se registran como mensajes informativos
3. **Los errores de extensiones del navegador** son filtrados automáticamente
4. **Los health checks** del servidor son ignorados

---

## ✅ Configuración de Nginx Completada

Hemos configurado Nginx para que Sentry sea accesible a través de:
```
https://menusesqr.online/sentry
```

La configuración incluye:
- **Proxy inverso** de Sentry (puerto 9002 → /sentry/)
- **Soporte para WebSockets** (para actualizaciones en vivo)
- **Manejo de redirecciones** y cookies
- **Headers de seguridad** compatibles
- **Buffer optimizado** para archivos grandes

La configuración está lista para funcionar con tu monitoring stack en Docker y accesible a través de tu dominio! 🎉

## 🔗 Enlaces Útiles

- **Sentry**: https://menusesqr.online/sentry
- **Login**: admin@monitoring.local / admin123
- **Documentación**: Ver `SENTRY_SETUP.md` en el proyecto