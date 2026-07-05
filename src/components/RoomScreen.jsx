import { useState, useEffect } from 'react';
import { COLORS } from '../constants.js';
import './RoomScreen.css';

export default function RoomScreen({ socket, roomId, playerName, onLeave, initialRoom }) {
  const [room, setRoom] = useState(initialRoom || null);

  useEffect(() => {
    const s = socket.current;
    if (!s) return;

    const handleRoomUpdate = (data) => {
      if (data.id === roomId) setRoom(data);
    };
    const handleLeft = () => onLeave();

    s.on('room:update', handleRoomUpdate);
    s.on('room:left', handleLeft);

    s.emit('room:request-update', { roomId });

    return () => {
      s.off('room:update', handleRoomUpdate);
      s.off('room:left', handleLeft);
    };
  }, [socket, roomId, onLeave]);

  function selectTeam(team) {
    socket.current.emit('room:select-team', { team });
  }

  function startGame() {
    socket.current.emit('game:start');
  }

  function leaveRoom() {
    socket.current.emit('room:leave');
  }

  if (!room) return <div className="room-screen">Loading room...</div>;

  console.log('RoomScreen', { playerName, roomPlayers: room.players });
  const myPlayer = room.players.find((p) => p.name === playerName);
  const otherPlayer = room.players.find((p) => p.name !== playerName);
  const canStart = room.playerCount >= 1 && room.players.every((p) => p.team);
  const otherTeam = otherPlayer?.team;
  const redTaken = otherTeam === 'red';
  const blueTaken = otherTeam === 'blue';

  return (
    <div className="room-screen">
      <h2>Room {roomId}</h2>

      <div className="players-panel">
        <div className="player-slot">
          <div className="player-name">{myPlayer?.name || '—'} <span className="player-tag">(you)</span></div>
          <div className="team-select">
            <button
              className={`team-btn team-red ${myPlayer?.team === 'red' ? 'selected' : ''}`}
              style={myPlayer?.team === 'red' ? { background: COLORS.red } : {}}
              onClick={() => selectTeam(myPlayer?.team === 'red' ? null : 'red')}
              disabled={redTaken}
            >
              Red
            </button>
            <button
              className={`team-btn team-blue ${myPlayer?.team === 'blue' ? 'selected' : ''}`}
              style={myPlayer?.team === 'blue' ? { background: COLORS.blue } : {}}
              onClick={() => selectTeam(myPlayer?.team === 'blue' ? null : 'blue')}
              disabled={blueTaken}
            >
              Blue
            </button>
          </div>
        </div>

        <div className="player-slot">
          <div className="player-name">{otherPlayer?.name || 'Waiting...'} {otherPlayer && <span className="player-tag">(teammate)</span>}</div>
          <div className="team-select">
            <button
              className={`team-btn team-red ${otherPlayer?.team === 'red' ? 'selected' : ''}`}
              style={otherPlayer?.team === 'red' ? { background: COLORS.red } : {}}
              disabled
            >
              Red
            </button>
            <button
              className={`team-btn team-blue ${otherPlayer?.team === 'blue' ? 'selected' : ''}`}
              style={otherPlayer?.team === 'blue' ? { background: COLORS.blue } : {}}
              disabled
            >
              Blue
            </button>
          </div>
        </div>
      </div>

      <div className="room-actions">
        <button
          className="start-btn"
          onClick={startGame}
          disabled={!canStart}
        >
          Start Game
        </button>
        <button className="leave-btn" onClick={leaveRoom}>
          Leave Room
        </button>
      </div>
    </div>
  );
}
