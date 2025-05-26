import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupPlanningPokerSocket } from './sockets/planningPokerSocket.js';
import { setupTextEditorSocket } from './sockets/textEditorSocket.js';
import type { CustomSocket, ClientToServerEvents, ServerToClientEvents } from './types/common.js';

// Configuración de __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicializar la aplicación Express
const app = express();
const server = http.createServer(app);

// Configuración de CORS
app.use(cors());

// Servir archivos estáticos (para el frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Socket.IO con tipos
export const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
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
io.use((socket: CustomSocket, next) => {
  const { type } = socket.handshake.query;
  
  if (type === 'planning' || type === 'editor') {
    socket.type = type;
    next();
  } else {
    next(new Error('Tipo de conexión no válido. Debe ser "planning" o "editor"'));
  }
});

// Manejar conexiones de socket
io.on('connection', (socket: CustomSocket) => {
  console.log('Nueva conexión:', socket.id, 'Tipo:', socket.type);
  
  // Enrutar a los manejadores correspondientes según el tipo de conexión
  if (socket.type === 'planning') {
    setupPlanningPokerSocket(io, socket);
  } else if (socket.type === 'editor') {
    setupTextEditorSocket(io, socket);
  }
  
  // Manejar errores
  socket.on('error', (error: Error) => {
    console.error('Error en el socket:', error);
  });
});

// Ruta de prueba
app.get('/api/status', (req, res) => {
  res.json({ status: 'Servidor en funcionamiento' });
});

// Manejo de errores
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

// Manejar errores no capturados
process.on('uncaughtException', (error: Error) => {
  console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('Promesa rechazada no manejada:', promise, 'Razón:', reason);
});
