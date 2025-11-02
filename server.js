
// Dependencias
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateMessage, getRandomColor } from './libs/unalib.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración del servidor
const PORT = process.env.PORT || 3000;

// Almacenamiento de usuarios conectados
const users = new Map();

// Middleware para servir archivos estáticos
function setupMiddleware(app) {
  app.use(express.static('./public'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
}

// Ruta principal
function setupRoutes(app) {
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
}

// Configuración de CORS para desarrollo
function setupCors(app) {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
}

// Manejo de conexiones de Socket.IO
function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado');
    
    // Generar un color aleatorio para el usuario
    const userColor = getRandomColor();
    
    // Manejar mensajes de chat
    socket.on('chat message', (msgData) => {
      try {
        // Validar datos del mensaje
        if (!msgData || typeof msgData !== 'object') {
          throw new Error('Formato de mensaje inválido');
        }
        
        // Procesar el mensaje usando la librería unalib
        const processedMsg = validateMessage(JSON.stringify({
          nombre: msgData.nombre || 'Anónimo',
          mensaje: String(msgData.mensaje || '').substring(0, 1000), // Limitar longitud
          color: userColor,
          timestamp: new Date().toISOString()
        }));
        
        // Enviar el mensaje procesado a todos los clientes
        io.emit('chat message', JSON.parse(processedMsg));
        
      } catch (error) {
        console.error('Error al procesar el mensaje:', error);
        socket.emit('error', { message: 'Error al procesar el mensaje' });
      }
    });
    
    // Manejar notificaciones de escritura
    socket.on('typing', (data) => {
      socket.broadcast.emit('typing', { 
        username: data.username || 'Alguien' 
      });
    });
    
    socket.on('stop typing', () => {
      socket.broadcast.emit('stop typing');
    });
    
    // Manejar desconexiones
    socket.on('disconnect', () => {
      console.log('Usuario desconectado');
    });
  });
}

function createApp() {
  const app = express();
  setupMiddleware(app);
  setupCors(app);
  setupRoutes(app);
  return app;
}

function createServer(app) {
  return http.createServer(app);
}

function createSocket(server) {
  return new Server(server);
}

// Manejo de errores globales
function setupProcessHandlers() {
  process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
  });
  
  process.on('unhandledRejection', (reason) => {
    console.error('Promesa rechazada no manejada:', reason);
  });
}

function startServer(server, port = PORT) {
  server.listen(port, '0.0.0.0', () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
    console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  });
  return server;
}

// Secuencia de arranque por defecto (equivalente al comportamiento previo)
const app = createApp();
const server = createServer(app);
const io = createSocket(server);
setupSocketHandlers(io);
setupProcessHandlers();
startServer(server, PORT);

export {
  setupMiddleware,
  setupRoutes,
  setupCors,
  setupSocketHandlers,
  createApp,
  createServer,
  createSocket,
  setupProcessHandlers,
  startServer,
  users,
  PORT
};
