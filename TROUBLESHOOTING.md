# Troubleshooting - Problemas Comunes

## Socket.IO Error 400 en Producción

### Síntomas
- Errores `400 (Bad Request)` en `/socket.io/?EIO=4&transport=polling`
- WebSocket falla con "WebSocket is closed before the connection is established"
- El chat no funciona en producción pero sí en desarrollo

### Causa
El problema es causado por una configuración incorrecta de CORS. Azure Container Apps tiene un dominio diferente al de desarrollo, y Socket.IO necesita que ese dominio esté explícitamente permitido en la configuración de CORS.

### Solución

#### 1. Verificar la variable de entorno `ALLOWED_ORIGINS`

En Azure Container Apps, asegúrate de que la variable de entorno `ALLOWED_ORIGINS` incluya el dominio completo de tu aplicación:

```bash
ALLOWED_ORIGINS=https://una-chat-app.bluepebble-d90e530f.westus2.azurecontainerapps.io
```

Si necesitas múltiples orígenes (desarrollo + producción):

```bash
ALLOWED_ORIGINS=http://localhost:3000,https://una-chat-app.bluepebble-d90e530f.westus2.azurecontainerapps.io
```

#### 2. Verificar que `BASE_URL` coincida con el dominio

La variable `BASE_URL` debe ser exactamente igual al dominio donde está desplegada la aplicación:

```bash
BASE_URL=https://una-chat-app.bluepebble-d90e530f.westus2.azurecontainerapps.io
```

#### 3. Actualizar el secreto en GitHub Actions

Si usas GitHub Actions para desplegar, actualiza el secreto `ALLOWED_ORIGINS`:

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Edita o crea el secreto `ALLOWED_ORIGINS`
4. Valor: `https://una-chat-app.bluepebble-d90e530f.westus2.azurecontainerapps.io`

#### 4. Redesplegar la aplicación

Después de actualizar las variables de entorno, redesplega la aplicación para que los cambios surtan efecto.

### Verificación

Para verificar que CORS está funcionando correctamente:

1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña Network
3. Busca las peticiones a `/socket.io/`
4. Verifica que las respuestas incluyan las cabeceras CORS:
   - `Access-Control-Allow-Origin: https://tu-dominio.azurecontainerapps.io`
   - `Access-Control-Allow-Credentials: true`

## Error 401 en `/profile`

### Síntomas
- Error `401 (Unauthorized)` al cargar la página
- Aparece en la consola del navegador

### Causa
Este error es **esperado y normal** cuando el usuario no ha iniciado sesión. La aplicación intenta obtener el perfil del usuario, y si no está autenticado, el servidor responde con 401.

### Solución
No requiere solución. El frontend maneja este error correctamente y permite al usuario usar el chat de forma anónima. Si deseas iniciar sesión, haz clic en el botón "Iniciar sesión".

## Problemas de CSP (Content Security Policy)

### Síntomas
- Errores en consola: "Refused to connect to '...' because it violates the following Content Security Policy directive"
- Recursos externos no se cargan

### Solución
La configuración actual de CSP permite:
- Socket.IO CDN (`https://cdn.socket.io`)
- jQuery CDN (`https://code.jquery.com`)
- WebSocket connections (`ws:`, `wss:`)

Si necesitas permitir otros recursos, edita la configuración de Helmet en `server.js`:

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      connectSrc: ["'self'", 'ws:', 'wss:', 'https://cdn.socket.io', 'https://tu-cdn.com'],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.socket.io", "https://tu-cdn.com"]
    }
  }
}));
```

## Comandos Útiles para Debugging

### Ver logs en Azure Container Apps

```bash
az containerapp logs show \
  --name una-chat-app \
  --resource-group UNA-CHAT \
  --follow
```

### Verificar variables de entorno en Azure

```bash
az containerapp show \
  --name una-chat-app \
  --resource-group UNA-CHAT \
  --query properties.template.containers[0].env
```

### Probar CORS localmente

```bash
curl -H "Origin: https://una-chat-app.bluepebble-d90e530f.westus2.azurecontainerapps.io" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  -I https://una-chat-app.bluepebble-d90e530f.westus2.azurecontainerapps.io/socket.io/
```

## Contacto y Soporte

Si el problema persiste después de seguir estos pasos:

1. Verifica los logs del servidor
2. Revisa las variables de entorno en Azure
3. Asegúrate de que el despliegue se completó correctamente
4. Limpia la caché del navegador y recarga la página
