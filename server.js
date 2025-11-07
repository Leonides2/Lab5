// Dependencies
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

// Configuration
dotenv.config({quiet: true});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// Auth0 configuration
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
};


// Initialize app and server
const app = express();
const server = http.createServer(app);

// CORS configuration for Socket.IO
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list or is same origin
      if (allowedOrigins.includes(origin) || origin === process.env.BASE_URL) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  allowEIO3: true // Enable compatibility with older clients
});

// Middleware - Security first
// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'ws:', 'wss:', 'https://cdn.socket.io'], // Allow WebSocket and Socket.IO CDN
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.socket.io", "https://code.jquery.com"],
      imgSrc: ["'self'", 'data:', 'https:'], // Allow images from HTTPS and data URIs
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false, // Disable for Socket.IO compatibility
  crossOriginResourcePolicy: { policy: 'cross-origin' } // Allow cross-origin for Socket.IO
}));

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or is same origin
    if (allowedOrigins.includes(origin) || origin === process.env.BASE_URL) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));


// Body parsers
app.use(express.json({ limit: '10kb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Authentication
app.use(pkg.auth(config));

// Static files
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

// Socket.IO connection handling
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

// Error handling
process.on('uncaughtException', (error) => {
  logger.error('Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  logger.info(`Servidor escuchando en http://localhost:${PORT}`);
  logger.info(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});

export default server;