import { createServer } from 'http';
import { Server } from 'socket.io';
import { createRoomManager } from './roomManager.js';
import { createGameManager } from './gameManager.js';

const PORT = process.env.PORT || 3001;

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

const roomManager = createRoomManager();
const gameManager = createGameManager(roomManager);

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  roomManager.handleConnection(io, socket, gameManager);
  gameManager.handleConnection(io, socket, roomManager);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    roomManager.handleDisconnect(io, socket, gameManager);
  });
});

const HOST = process.env.HOST || '0.0.0.0';

httpServer.listen(PORT, HOST, () => {
  console.log(`Game server listening on ${HOST}:${PORT}`);
});
