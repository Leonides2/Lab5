// Dependencias
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateMessage, getRandomColor } from './libs/unalib.js';
import logger from './libs/logger.js';
import pkg from 'express-openid-connect';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';

// Configuración general
dotenv.config({quiet: true});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// Configuración de Auth0 (autenticación)
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
};


// Inicialización de Express y servidor HTTP
const app = express();
const server = http.createServer(app);

// Lista de orígenes permitidos para CORS
// Ejemplo: 'http://localhost:3000,https://mi-app.com' se convierte en ['http://localhost:3000', 'https://mi-app.com']
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

// Configuración de Socket.IO con CORS
// Socket.IO es la librería que permite comunicación en tiempo real (chat)
const io = new Server(server, {
  cors: {
    // Función que valida si un origen está permitido
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (apps móviles, curl, Postman)
      if (!origin) return callback(null, true);
      
      // Verificar si el origen está en la lista de permitidos O es el mismo dominio (BASE_URL)
      if (allowedOrigins.includes(origin) || origin === process.env.BASE_URL) {
        callback(null, true); // Permitir la conexión
      } else {
        callback(new Error('No permitido por CORS')); // Rechazar la conexión
      }
    },
    methods: ['GET', 'POST'], // Métodos HTTP permitidos
    credentials: true, // Permitir cookies y headers de autenticación
    allowedHeaders: ['Content-Type', 'Authorization'] // Headers permitidos
  },
  allowEIO3: true // Habilitar compatibilidad con clientes antiguos de Socket.IO
});

// Middleware - La seguridad va primero
// Helmet configura cabeceras HTTP de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'ws:', 'wss:', 'https://cdn.socket.io'], // Permitir WebSocket y CDN de Socket.IO
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.socket.io", "https://code.jquery.com"],
      imgSrc: ["'self'", 'data:', 'https:'], // Permitir imágenes de HTTPS y data URIs
      frameSrc: ["'self'", 'https://www.youtube.com', 'https://www.youtube-nocookie.com'], // Permitir iframes solo de YouTube
      mediaSrc: ["'self'", 'https:', 'blob:'], // Permitir video/audio de cualquier fuente HTTPS
      objectSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false, // Deshabilitado para compatibilidad con Socket.IO
  crossOriginResourcePolicy: { policy: 'cross-origin' } // Permitir recursos cross-origin para Socket.IO
}));

// Configuración de CORS (Cross-Origin Resource Sharing)
// Controla qué dominios pueden hacer peticiones a este servidor
const corsOptions = {
  // Función que valida el origen de cada petición
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (apps móviles, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Verificar si el origen está en la lista permitida O es el mismo dominio
    if (allowedOrigins.includes(origin) || origin === process.env.BASE_URL) {
      callback(null, true); // Permitir
    } else {
      callback(null, false); // Rechazar silenciosamente
    }
  },
  credentials: true, // Permitir cookies y headers de autenticación
  optionsSuccessStatus: 200, // Código de éxito para navegadores antiguos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'] // Headers permitidos
};
app.use(cors(corsOptions));


// Parsers de cuerpo de peticiones
app.use(express.json({ limit: '10kb' })); // Limitar tamaño de JSON a 10KB (previene DoS)
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Limitar tamaño de formularios

// Autenticación con Auth0
app.use(pkg.auth(config));

// Servir archivos estáticos (HTML, CSS, JS, imágenes)
app.use(express.static('./public'));



app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/profile', (req, res) => {
  try {
    if (!req.oidc.isAuthenticated()) {
      return res.status(401).json({ authenticated: false });
    }

    const user = req.oidc.user;
    res.json({
      authenticated: true,
      name: user.name || user.nickname || user.email.split('@')[0],
      email: user.email,
      picture: user.picture
    });
  } catch (error) {
    logger.error('Error en /profile:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Manejo de conexiones de Socket.IO (chat en tiempo real)
io.on('connection', (socket) => {
  const userColor = getRandomColor();
  
  socket.on('chat message', (msgData) => {
    try {
      if (!msgData || typeof msgData !== 'object') {
        throw new Error('Formato de mensaje inválido');
      }
      
      const processedMsg = validateMessage(JSON.stringify({
        nombre: msgData.nombre || 'Anónimo',
        mensaje: String(msgData.mensaje || '').substring(0, 1000),
        color: userColor,
        timestamp: new Date().toISOString()
      }));
      
      io.emit('chat message', JSON.parse(processedMsg));
    } catch (error) {
      logger.info('Error al procesar el mensaje:', error);
      socket.emit('error', { message: 'Error al procesar el mensaje' });
    }
  });
  
  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', { 
      username: data.username || 'Alguien' 
    });
  });
  
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing');
  });
  
  socket.on('disconnect', () => {
    logger.info('Usuario desconectado');
  });
});

// Manejo de errores globales
process.on('uncaughtException', (error) => {
  logger.error('Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Iniciar el servidor
server.listen(PORT, '0.0.0.0', () => {
  logger.info(`Servidor escuchando en http://localhost:${PORT}`);
  logger.info(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});

export default server;