# Explicación Detallada: CORS y Socket.IO

## ¿Qué es CORS?

**CORS** (Cross-Origin Resource Sharing) es un mecanismo de seguridad que controla qué dominios pueden hacer peticiones a tu servidor.

### Ejemplo Simple

Imagina que tu servidor está en `https://mi-servidor.com`:

- ✅ **Permitido**: Peticiones desde `https://mi-servidor.com` (mismo origen)
- ❌ **Bloqueado**: Peticiones desde `https://otro-sitio.com` (origen diferente)

CORS te permite **especificar qué orígenes externos están permitidos**.

## Configuración de `allowedOrigins`

### Código
```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
```

### Explicación Paso a Paso

1. **`process.env.ALLOWED_ORIGINS`**: Lee la variable de entorno
   - Ejemplo: `"http://localhost:3000,https://mi-app.com"`

2. **`?.split(',')`**: Divide el string por comas (operador opcional)
   - Si existe: `["http://localhost:3000", "https://mi-app.com"]`
   - Si NO existe: `undefined`

3. **`|| ['http://localhost:3000']`**: Valor por defecto
   - Si el resultado anterior es `undefined`, usa `['http://localhost:3000']`

### Ejemplos

#### Ejemplo 1: Variable definida
```javascript
// .env
ALLOWED_ORIGINS=http://localhost:3000,https://mi-app.com,https://otra-app.com

// Resultado
allowedOrigins = [
  'http://localhost:3000',
  'https://mi-app.com',
  'https://otra-app.com'
]
```

#### Ejemplo 2: Variable NO definida
```javascript
// .env (sin ALLOWED_ORIGINS)

// Resultado
allowedOrigins = ['http://localhost:3000']
```

## Configuración de Socket.IO

### Código Completo
```javascript
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin) || origin === process.env.BASE_URL) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  allowEIO3: true
});
```

### Explicación Detallada

#### 1. `new Server(server, { ... })`
Crea una nueva instancia de Socket.IO y la conecta al servidor HTTP.

**Parámetros:**
- `server`: El servidor HTTP de Express
- `{ cors: {...} }`: Opciones de configuración

#### 2. `origin: (origin, callback) => { ... }`
Función que se ejecuta **cada vez** que alguien intenta conectarse.

**Parámetros:**
- `origin`: El dominio desde donde se hace la petición
  - Ejemplo: `"http://localhost:3000"` o `"https://mi-app.com"`
- `callback`: Función para responder si se permite o no

#### 3. Validación de Origen

```javascript
if (!origin) return callback(null, true);
```
**Caso 1: Sin origen**
- Peticiones de apps móviles, Postman, curl no tienen origen
- `callback(null, true)` = Permitir

```javascript
if (allowedOrigins.includes(origin) || origin === process.env.BASE_URL) {
  callback(null, true);
}
```
**Caso 2: Origen en la lista O mismo dominio**
- `allowedOrigins.includes(origin)`: ¿Está en la lista?
- `origin === process.env.BASE_URL`: ¿Es el mismo dominio?
- Si cualquiera es verdadero: Permitir

```javascript
else {
  callback(new Error('No permitido por CORS'));
}
```
**Caso 3: Origen no permitido**
- Rechazar la conexión con error

### Flujo Completo con Ejemplos

#### Ejemplo 1: Conexión desde localhost
```
1. Usuario abre: http://localhost:3000
2. JavaScript intenta conectar Socket.IO
3. origin = "http://localhost:3000"
4. allowedOrigins = ['http://localhost:3000']
5. allowedOrigins.includes("http://localhost:3000") = true
6. callback(null, true) → ✅ PERMITIDO
```

#### Ejemplo 2: Conexión desde dominio permitido
```
1. Usuario abre: https://mi-app.com
2. JavaScript intenta conectar Socket.IO
3. origin = "https://mi-app.com"
4. allowedOrigins = ['http://localhost:3000', 'https://mi-app.com']
5. allowedOrigins.includes("https://mi-app.com") = true
6. callback(null, true) → ✅ PERMITIDO
```

#### Ejemplo 3: Conexión desde dominio NO permitido
```
1. Usuario abre: https://sitio-malicioso.com
2. JavaScript intenta conectar Socket.IO
3. origin = "https://sitio-malicioso.com"
4. allowedOrigins = ['http://localhost:3000']
5. allowedOrigins.includes("https://sitio-malicioso.com") = false
6. origin === process.env.BASE_URL = false
7. callback(new Error('No permitido por CORS')) → ❌ BLOQUEADO
```

#### Ejemplo 4: Petición desde Postman
```
1. Postman hace petición
2. origin = undefined (no hay navegador)
3. if (!origin) return callback(null, true)
4. callback(null, true) → ✅ PERMITIDO
```

## Otras Opciones de Socket.IO

### `methods: ['GET', 'POST']`
Métodos HTTP permitidos para las peticiones de Socket.IO.

### `credentials: true`
Permite enviar cookies y headers de autenticación.

**Importante:** Si `credentials: true`, NO puedes usar `origin: '*'` (wildcard).

### `allowedHeaders: ['Content-Type', 'Authorization']`
Headers HTTP que el cliente puede enviar.

### `allowEIO3: true`
Habilita compatibilidad con versiones antiguas de Socket.IO (Engine.IO v3).

## Configuración de CORS para Express

```javascript
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || origin === process.env.BASE_URL) {
      callback(null, true);
    } else {
      callback(null, false); // Rechazar silenciosamente
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));
```

### Diferencia con Socket.IO

**Socket.IO:**
```javascript
callback(new Error('No permitido por CORS')); // Error explícito
```

**Express CORS:**
```javascript
callback(null, false); // Rechazar silenciosamente
```

## Configuración en Producción

### Archivo `.env` en desarrollo
```bash
ALLOWED_ORIGINS=http://localhost:3000
BASE_URL=http://localhost:3000
```

### Variables de entorno en Azure
```bash
ALLOWED_ORIGINS=https://mi-app.azurecontainerapps.io
BASE_URL=https://mi-app.azurecontainerapps.io
```

### Múltiples dominios
```bash
ALLOWED_ORIGINS=http://localhost:3000,https://mi-app.com,https://otra-app.com
```

## Preguntas Frecuentes

### ¿Por qué usar una función en lugar de un array?

**Opción 1: Array simple (menos flexible)**
```javascript
cors: {
  origin: ['http://localhost:3000', 'https://mi-app.com']
}
```

**Opción 2: Función (más flexible)** ✅
```javascript
cors: {
  origin: (origin, callback) => {
    // Puedes hacer validaciones complejas
    // Puedes leer de base de datos
    // Puedes hacer logging
    callback(null, true);
  }
}
```

### ¿Qué pasa si no configuro CORS?

Sin CORS, solo funcionará en el mismo dominio:
- ✅ `http://localhost:3000` → `http://localhost:3000` (OK)
- ❌ `http://localhost:3000` → `https://mi-servidor.com` (BLOQUEADO)

### ¿Por qué permitir peticiones sin origen?

Apps móviles, Postman, curl y otras herramientas no envían el header `Origin`. Si no permitimos `!origin`, estas herramientas no funcionarían.

### ¿Es seguro permitir peticiones sin origen?

Sí, porque:
1. Las peticiones sin origen no pueden leer la respuesta (no hay navegador)
2. Solo pueden hacer peticiones, no robar datos
3. Útil para testing y apps móviles

## Resumen Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE CORS                            │
└─────────────────────────────────────────────────────────────┘

Cliente (https://mi-app.com)
    │
    │ 1. Intenta conectar Socket.IO
    ├──────────────────────────────────────────────────────┐
    │                                                       │
    ▼                                                       │
Servidor (https://mi-servidor.com)                         │
    │                                                       │
    │ 2. Ejecuta función origin()                          │
    │    origin = "https://mi-app.com"                     │
    │                                                       │
    │ 3. Verifica allowedOrigins                           │
    │    ['http://localhost:3000', 'https://mi-app.com']   │
    │                                                       │
    │ 4. allowedOrigins.includes("https://mi-app.com")     │
    │    = true                                            │
    │                                                       │
    │ 5. callback(null, true)                              │
    │                                                       │
    ├──────────────────────────────────────────────────────┘
    │
    ▼
✅ CONEXIÓN PERMITIDA
```

## Ejemplo Práctico Completo

```javascript
// .env
ALLOWED_ORIGINS=http://localhost:3000,https://mi-app.com
BASE_URL=https://mi-servidor.com

// server.js
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
// Resultado: ['http://localhost:3000', 'https://mi-app.com']

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      console.log('Origen:', origin);
      
      // Caso 1: Postman (sin origen)
      if (!origin) {
        console.log('✅ Permitido: Sin origen');
        return callback(null, true);
      }
      
      // Caso 2: En la lista
      if (allowedOrigins.includes(origin)) {
        console.log('✅ Permitido: En la lista');
        return callback(null, true);
      }
      
      // Caso 3: Mismo dominio
      if (origin === process.env.BASE_URL) {
        console.log('✅ Permitido: Mismo dominio');
        return callback(null, true);
      }
      
      // Caso 4: No permitido
      console.log('❌ Bloqueado:', origin);
      callback(new Error('No permitido por CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});
```

## Conclusión

La configuración de CORS y Socket.IO protege tu servidor permitiendo solo conexiones de dominios confiables, mientras mantiene la flexibilidad para desarrollo local y herramientas de testing.
