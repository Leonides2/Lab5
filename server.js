
// Dependencias
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const unalib = require('./libs/unalib');

// Configuración del servidor
const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Almacenamiento de usuarios conectados
const users = new Map();

// Middleware para servir archivos estáticos
app.use(express.static('.'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Configuración de CORS para desarrollo
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Manejo de conexiones de Socket.IO
io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado');
  
  // Generar un color aleatorio para el usuario
  const userColor = '#' + Math.floor(Math.random()*16777215).toString(16);
  
  // Manejar mensajes de chat
  socket.on('chat message', (msgData) => {
    try {
      // Validar datos del mensaje
      if (!msgData || typeof msgData !== 'object') {
        throw new Error('Formato de mensaje inválido');
      }
      
      // Procesar el mensaje usando la librería unalib
      const processedMsg = unalib.validateMessage(JSON.stringify({
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

// Manejo de errores globales
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
});

// Iniciar el servidor
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});
