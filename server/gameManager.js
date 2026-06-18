import { ROBOT_SIZE, PICKUP_RANGE, MATCH_DURATION } from '../src/constants.js';
import { initialBags } from '../src/game/fieldLayout.js';
import { updateProjectile } from '../src/game/physics.js';
import { checkScoring } from '../src/game/scoring.js';

const STUN_DURATION = 1000;
const ROBOT_START_RED = { x: 25, y: 550 };
const ROBOT_START_BLUE = { x: 775, y: 75 };

const gameStates = new Map();

function createGameState(room) {
  const robots = {};
  for (const p of room.players) {
    const start = p.team === 'red' ? ROBOT_START_RED : ROBOT_START_BLUE;
    robots[p.socketId] = {
      x: start.x,
      y: start.y,
      direction: p.team === 'red' ? 'up' : 'down',
      carriedBag: null,
      team: p.team,
      stunnedUntil: 0,
    };
  }

  return {
    roomId: room.id,
    robots,
    bags: initialBags.map((b) => ({ ...b, state: 'field', vx: 0, vy: 0 })),
    score: 0,
    breakdown: {
      floor: 0, l1: 0, l2: 0, l3: 0, l4: 0,
      floorCount: 0, l1Count: 0, l2Count: 0, l3Count: 0, l4Count: 0,
    },
    startTime: null,
    timerInterval: null,
    phase: 'waiting',
  };
}

export function createGameManager(roomManager) {
  function startCountdown(io, room) {
    const state = createGameState(room);
    gameStates.set(room.id, state);
    room.status = 'countdown';
    state.phase = 'countdown';

    let count = 3;
    const countdownInterval = setInterval(() => {
      if (count > 0) {
        emitToRoom(io, room, 'countdown', { count });
        count--;
      } else {
        clearInterval(countdownInterval);
        emitToRoom(io, room, 'game:go', {});
        startGame(io, room);
      }
    }, 1000);

    roomManager.broadcastRoomUpdate(io, room);
  }

  function startGame(io, room) {
    const state = gameStates.get(room.id);
    if (!state) return;

    room.status = 'playing';
    state.phase = 'playing';
    state.startTime = Date.now();

    state.timerInterval = setInterval(() => {
      const elapsed = (Date.now() - state.startTime) / 1000;
      const remaining = Math.max(0, MATCH_DURATION - elapsed);

      emitToRoom(io, room, 'timer:update', {
        remaining: Math.ceil(remaining),
      });

      if (remaining <= 0) {
        endGame(io, room, 'completed');
      }
    }, 1000);

    emitStateToRoom(io, room, state);
    roomManager.broadcastRoomUpdate(io, room);
  }

  function endGame(io, room, reason) {
    const state = gameStates.get(room.id);
    if (!state) return;

    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }

    const elapsed = state.startTime
      ? Math.min(MATCH_DURATION, (Date.now() - state.startTime) / 1000)
      : 0;

    state.phase = 'finished';
    room.status = 'gameover';
    room.playAgain = new Set();

    emitToRoom(io, room, 'game:over', {
      score: state.score,
      breakdown: state.breakdown,
      endReason: reason,
      duration: Math.round(elapsed),
    });

    roomManager.broadcastRoomUpdate(io, room);
  }

  function handlePlayAgain(io, socket, roomManager) {
    const result = roomManager.getPlayer(socket.id);
    if (!result) return;

    const { room } = result;
    if (room.status !== 'gameover') return;

    if (!room.playAgain) room.playAgain = new Set();
    room.playAgain.add(socket.id);

    if (room.playAgain.size >= room.players.length && room.players.length === 2) {
      room.status = 'ready';
      room.playAgain = new Set();
      gameStates.delete(room.id);
      emitToRoom(io, room, 'game:ready', {});
      roomManager.broadcastRoomUpdate(io, room);
    } else {
      socket.emit('game:waiting-play-again', {});
    }
  }

  function emitToRoom(io, room, event, data) {
    for (const p of room.players) {
      io.to(p.socketId).emit(event, data);
    }
  }

  function emitStateToRoom(io, room, state) {
    for (const p of room.players) {
      const otherSocketId = room.players.find(
        (op) => op.socketId !== p.socketId
      )?.socketId;
      const otherRobot = otherSocketId ? state.robots[otherSocketId] : null;

      io.to(p.socketId).emit('state:update', {
        myRobot: state.robots[p.socketId],
        otherRobot: otherRobot
          ? {
              x: otherRobot.x,
              y: otherRobot.y,
              direction: otherRobot.direction,
              carriedBag: otherRobot.carriedBag,
              team: otherRobot.team,
              stunned: Date.now() < otherRobot.stunnedUntil,
            }
          : null,
        bags: state.bags,
        score: state.score,
        breakdown: state.breakdown,
      });
    }
  }

  function isStunned(robot) {
    return Date.now() < robot.stunnedUntil;
  }

  function checkBump(io, room, state, movingSocketId) {
    const ids = Object.keys(state.robots);
    if (ids.length < 2) return false;

    const otherSocketId = ids.find((id) => id !== movingSocketId);
    const r1 = state.robots[movingSocketId];
    const r2 = state.robots[otherSocketId];

    const dx = r1.x - r2.x;
    const dy = r1.y - r2.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < ROBOT_SIZE) {
      const pushDist = ROBOT_SIZE;
      let nx, ny;
      if (dist === 0) {
        nx = 1;
        ny = 0;
      } else {
        nx = dx / dist;
        ny = dy / dist;
      }

      r1.x += nx * pushDist / 2;
      r1.y += ny * pushDist / 2;
      r2.x -= nx * pushDist / 2;
      r2.y -= ny * pushDist / 2;

      const now = Date.now();
      r1.stunnedUntil = now + STUN_DURATION;
      r2.stunnedUntil = now + STUN_DURATION;
      r1.carriedBag = null;
      r2.carriedBag = null;

      for (const p of room.players) {
        io.to(p.socketId).emit('bump', {
          myPos: { x: state.robots[p.socketId].x, y: state.robots[p.socketId].y },
          stunDuration: STUN_DURATION,
        });
      }

      return true;
    }
    return false;
  }

  function handleConnection(io, socket, roomMgr) {
    socket.on('game:start', () => {
      const result = roomMgr.getPlayer(socket.id);
      if (!result) return;
      const { room } = result;

      if (!roomMgr.isRoomReady(room)) return;
      if (room.status !== 'ready') return;

      startCountdown(io, room);
    });

    socket.on('game:play-again', () => {
      handlePlayAgain(io, socket, roomMgr);
    });

    socket.on('player:move', ({ x, y, direction }) => {
      const result = roomMgr.getPlayer(socket.id);
      if (!result) return;
      const state = gameStates.get(result.room.id);
      if (!state || state.phase !== 'playing') return;

      const robot = state.robots[socket.id];
      if (!robot || isStunned(robot)) return;

      robot.x = x;
      robot.y = y;
      robot.direction = direction;

      if (checkBump(io, result.room, state, socket.id)) return;

      const otherPlayer = result.room.players.find(
        (p) => p.socketId !== socket.id
      );
      if (otherPlayer) {
        io.to(otherPlayer.socketId).emit('opponent:move', {
          x: robot.x,
          y: robot.y,
          direction: robot.direction,
          carriedBag: robot.carriedBag,
          stunned: isStunned(robot),
        });
      }
    });

    socket.on('player:pickup', ({ bagId }) => {
      const result = roomMgr.getPlayer(socket.id);
      if (!result) return;
      const state = gameStates.get(result.room.id);
      if (!state || state.phase !== 'playing') return;

      const robot = state.robots[socket.id];
      if (!robot || isStunned(robot)) return;
      if (robot.carriedBag) {
        socket.emit('pickup:denied', { bagId, reason: 'Already carrying a bag' });
        return;
      }

      const bag = state.bags.find((b) => b.id === bagId);
      if (!bag || (bag.state !== 'field' && bag.state !== 'landed')) {
        socket.emit('pickup:denied', { bagId, reason: 'Bag not available' });
        return;
      }

      const dx = robot.x - bag.x;
      const dy = robot.y - bag.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > PICKUP_RANGE) {
        socket.emit('pickup:denied', { bagId, reason: 'Too far' });
        return;
      }

      bag.state = 'carried';
      robot.carriedBag = bag.id;
      socket.emit('pickup:confirm', { bagId });
      emitStateToRoom(io, result.room, state);
    });

    socket.on('player:throw', ({ bagId, angle, power }) => {
      const result = roomMgr.getPlayer(socket.id);
      if (!result) return;
      const state = gameStates.get(result.room.id);
      if (!state || state.phase !== 'playing') return;

      const robot = state.robots[socket.id];
      if (!robot || isStunned(robot)) return;
      if (robot.carriedBag !== bagId) return;

      const bag = state.bags.find((b) => b.id === bagId);
      if (!bag) return;

      const THROW_MIN_SPEED = 100;
      const THROW_MAX_SPEED = 500;
      const speed = THROW_MIN_SPEED + (THROW_MAX_SPEED - THROW_MIN_SPEED) * power;

      bag.state = 'flying';
      bag.x = robot.x;
      bag.y = robot.y;
      bag.vx = Math.cos(angle) * speed;
      bag.vy = Math.sin(angle) * speed;
      robot.carriedBag = null;

      const SIM_DELTA = 1 / 60;
      const MAX_SIM_STEPS = 600;
      let steps = 0;
      while (bag.state === 'flying' && steps < MAX_SIM_STEPS) {
        updateProjectile(bag, SIM_DELTA);
        steps++;
      }

      let scoreResult = null;
      if (bag.state === 'landed') {
        scoreResult = checkScoring(bag);
        if (scoreResult) {
          bag.state = 'scored';
          state.score += scoreResult.points;
          state.breakdown[scoreResult.tier] += scoreResult.points;
          state.breakdown[scoreResult.tier + 'Count'] += 1;
        }
      }

      emitToRoom(io, result.room, 'throw:result', {
        bagId,
        bag: { x: bag.x, y: bag.y, state: bag.state },
        scoreResult,
        score: state.score,
        breakdown: state.breakdown,
      });

      emitStateToRoom(io, result.room, state);
    });
  }

  return {
    handleConnection,
    endGame,
    gameStates,
  };
}
