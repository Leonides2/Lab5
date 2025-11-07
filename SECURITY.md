# Configuración de Seguridad del Servidor

## Medidas de Seguridad Implementadas

### 1. **Helmet** - Cabeceras de Seguridad HTTP
Helmet configura automáticamente varias cabeceras HTTP para proteger contra vulnerabilidades comunes:

- **Content Security Policy (CSP)**: Controla qué recursos pueden cargarse
  - `defaultSrc`: Solo permite recursos del mismo origen
  - `connectSrc`: Permite WebSocket (ws/wss) y CDN de Socket.IO para source maps
  - `styleSrc`: Permite estilos inline (necesario para algunos frameworks)
  - `scriptSrc`: Permite scripts inline y CDNs específicos (Socket.IO, jQuery)
  - `imgSrc`: Permite imágenes de HTTPS y data URIs
  - `frameSrc` y `objectSrc`: Bloqueados para prevenir clickjacking

- **Cross-Origin Policies**: Configurado para compatibilidad con Socket.IO
  - `crossOriginEmbedderPolicy`: Deshabilitado
  - `crossOriginResourcePolicy`: Permite cross-origin

### 2. **CORS** - Control de Acceso entre Orígenes
Configuración estricta de CORS usando el paquete `cors`:

```javascript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
```

**Configuración**:
- Orígenes permitidos configurables vía variable de entorno `ALLOWED_ORIGINS`
- Soporta múltiples orígenes separados por comas
- Permite credenciales (cookies, headers de autorización)
- Métodos HTTP específicos permitidos

### 3. **Rate Limiting** - Protección contra Ataques de Fuerza Bruta
Limita el número de peticiones por IP:

```javascript
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 5 // máximo 5 peticiones por ventana
});
```

### 4. **Límite de Payload** - Protección contra DoS
Limita el tamaño de las peticiones JSON y URL-encoded a 10KB:

```javascript
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
```

### 5. **Socket.IO CORS**
Configuración de CORS específica para Socket.IO:

```javascript
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});
```

## Orden de Middleware (Importante)

El orden de los middleware es crucial para la seguridad:

1. **Helmet** - Primero para establecer cabeceras de seguridad
2. **CORS** - Control de acceso entre orígenes
3. **Rate Limiting** - Limitar peticiones antes de procesarlas
4. **Body Parsers** - Parsear el cuerpo de las peticiones
5. **Authentication** - Verificar identidad del usuario
6. **Static Files** - Servir archivos estáticos al final

## Configuración de Variables de Entorno

Añade a tu archivo `.env`:

```bash
ALLOWED_ORIGINS=http://localhost:3000,https://tu-dominio.com
```

Para múltiples orígenes, sepáralos con comas sin espacios.

## Recomendaciones Adicionales

1. **HTTPS**: En producción, siempre usa HTTPS
2. **Variables de Entorno**: Nunca commitees el archivo `.env`
3. **Rate Limiting**: Ajusta los límites según tus necesidades
4. **CSP**: Revisa y ajusta las políticas según los recursos que uses
5. **Monitoreo**: Implementa logging de intentos de acceso sospechosos

## Testing de Seguridad

Puedes probar las cabeceras de seguridad con:

```bash
curl -I http://localhost:3000
```

O usar herramientas online como:
- [Security Headers](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
