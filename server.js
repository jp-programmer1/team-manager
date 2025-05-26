const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

// Importar controladores de sockets
const setupPlanningPokerSocket = require('./src/sockets/planningPokerSocket');
const setupTextEditorSocket = require('./src/sockets/textEditorSocket');

// Inicializar la aplicación Express
const app = express();
const server = http.createServer(app);

// Configuración de CORS
app.use(cors());

// Servir archivos estáticos (para el frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  // Habilita la compresión para mejorar el rendimiento
  perMessageDeflate: {
    threshold: 32768
  }
});

// Middleware para identificar el tipo de socket
io.use((socket, next) => {
  const { type } = socket.handshake.query;
  socket.type = type; // 'planning' o 'editor'
  next();
});

// Manejar conexiones de socket
io.on('connection', (socket) => {
  console.log('Nueva conexión:', socket.id, 'Tipo:', socket.type);
  
  // Enrutar a los manejadores correspondientes según el tipo de conexión
  if (socket.type === 'planning') {
    setupPlanningPokerSocket(io, socket);
  } else if (socket.type === 'editor') {
    setupTextEditorSocket(io, socket);
  }
  
  // Manejar errores
  socket.on('error', (error) => {
    console.error('Error en el socket:', error);
  });
});

// Ruta de prueba
app.get('/api/status', (req, res) => {
  res.json({ status: 'Servidor en funcionamiento' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  console.log('Modos disponibles:');
  console.log(`- Planning Poker: Conectar a /?type=planning`);
  console.log(`- Editor de Texto: Conectar a /?type=editor`);
});

// Manejar cierre del servidor
process.on('SIGTERM', () => {
  console.log('Apagando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});
