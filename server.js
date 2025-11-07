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
import rateLimit from 'express-rate-limit';

// Rate limit configuration
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5 // limit each IP to 5 requests per windowMs
});

// Configuration
dotenv.config();
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
const io = new Server(server);

// Middleware
app.use(express.static('./public'));
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pkg.auth(config));


// Configuración de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [
        '\'self\'',
      ],
      styleSrc: [
        '\'self\'', 
        '\'unsafe-inline\'', 
      ],
      fontSrc: [
        '\'self\'', 
      ],
      scriptSrc: [
        '\'self\'', 
        '\'unsafe-inline\'', 
      ]
    }
  }
}));



app.get('/', (req, res) => {

  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/profile', (req, res) => {
  if (!req.oidc.isAuthenticated()) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const user = req.oidc.user;
  res.json({
    name: user.name || user.nickname || user.email.split('@')[0],
    email: user.email,
    picture: user.picture
  });
});

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
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
  logger.info('Error no capturado:', error);
});

process.on('unhandledRejection', (reason) => {
  logger.info('Promesa rechazada no manejada:', reason);
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  logger.info(`Servidor escuchando en http://localhost:${PORT}`);
  logger.info(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});

export default server;