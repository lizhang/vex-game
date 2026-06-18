export function createRoomManager() {
  const rooms = [];
  for (let i = 1; i <= 10; i++) {
    rooms.push({
      id: i,
      status: 'empty',
      players: [],
    });
  }

  function getRoomList() {
    return rooms.map((r) => ({
      id: r.id,
      status: r.status,
      playerCount: r.players.length,
      players: r.players.map((p) => ({ name: p.name, team: p.team })),
    }));
  }

  function getRoom(roomId) {
    return rooms.find((r) => r.id === roomId);
  }

  function getPlayerRoom(socketId) {
    return rooms.find((r) => r.players.some((p) => p.socketId === socketId));
  }

  function getPlayer(socketId) {
    for (const room of rooms) {
      const player = room.players.find((p) => p.socketId === socketId);
      if (player) return { room, player };
    }
    return null;
  }

  function joinRoom(roomId, socketId, playerName) {
    const room = getRoom(roomId);
    if (!room) return { success: false, reason: 'Room not found' };
    if (room.players.length >= 2) return { success: false, reason: 'Room is full' };
    if (room.status === 'playing' || room.status === 'countdown')
      return { success: false, reason: 'Game in progress' };

    room.players.push({ socketId, name: playerName, team: null });
    room.status = room.players.length === 1 ? 'waiting' : 'ready';
    return { success: true };
  }

  function leaveRoom(socketId) {
    const result = getPlayer(socketId);
    if (!result) return null;

    const { room, player } = result;
    room.players = room.players.filter((p) => p.socketId !== socketId);

    if (room.players.length === 0) {
      room.status = 'empty';
    } else {
      if (room.status === 'playing' || room.status === 'countdown') {
        room.status = 'gameover';
      } else {
        room.status = 'waiting';
      }
    }

    return { room, player, wasPlaying: room.status === 'gameover' };
  }

  function selectTeam(socketId, team) {
    const result = getPlayer(socketId);
    if (!result) return { success: false, reason: 'Not in a room' };

    const { room, player } = result;
    if (team !== 'red' && team !== 'blue')
      return { success: false, reason: 'Invalid team' };

    const taken = room.players.some(
      (p) => p.socketId !== socketId && p.team === team
    );
    if (taken) return { success: false, reason: 'Team already taken' };

    player.team = team;
    return { success: true };
  }

  function isRoomReady(room) {
    return (
      room.players.length === 2 &&
      room.players.every((p) => p.team !== null)
    );
  }

  function broadcastRoomList(io) {
    io.emit('room:list', getRoomList());
  }

  function broadcastRoomUpdate(io, room) {
    const roomData = {
      id: room.id,
      status: room.status,
      playerCount: room.players.length,
      players: room.players.map((p) => ({ name: p.name, team: p.team })),
    };
    for (const p of room.players) {
      io.to(p.socketId).emit('room:update', roomData);
    }
    broadcastRoomList(io);
  }

  function handleConnection(io, socket, gameManager) {
    socket.emit('room:list', getRoomList());

    socket.on('room:join', ({ roomId, playerName }) => {
      const result = joinRoom(roomId, socket.id, playerName);
      if (result.success) {
        const room = getRoom(roomId);
        socket.emit('room:joined', { roomId });
        broadcastRoomUpdate(io, room);
      } else {
        socket.emit('room:error', { message: result.reason });
      }
    });

    socket.on('room:leave', () => {
      const result = leaveRoom(socket.id);
      if (result) {
        const { room, wasPlaying } = result;
        if (wasPlaying) {
          gameManager.endGame(io, room, 'abandoned');
        }
        socket.emit('room:left');
        broadcastRoomUpdate(io, room);
      }
    });

    socket.on('room:select-team', ({ team }) => {
      const result = selectTeam(socket.id, team);
      if (result.success) {
        const playerResult = getPlayer(socket.id);
        if (playerResult) {
          broadcastRoomUpdate(io, playerResult.room);
        }
      } else {
        socket.emit('room:error', { message: result.reason });
      }
    });
  }

  function handleDisconnect(io, socket, gameManager) {
    const result = leaveRoom(socket.id);
    if (result) {
      const { room, wasPlaying } = result;
      if (wasPlaying) {
        gameManager.endGame(io, room, 'abandoned');
      }
      broadcastRoomUpdate(io, room);
    }
  }

  return {
    rooms,
    getRoomList,
    getRoom,
    getPlayerRoom,
    getPlayer,
    joinRoom,
    leaveRoom,
    selectTeam,
    isRoomReady,
    broadcastRoomList,
    broadcastRoomUpdate,
    handleConnection,
    handleDisconnect,
  };
}
