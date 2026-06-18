import { useState, useEffect } from 'react';
import { COLORS } from '../constants.js';
import './RoomScreen.css';

export default function RoomScreen({ socket, roomId, playerName, onLeave, onGameStart }) {
  const [room, setRoom] = useState(null);

  useEffect(() => {
    const s = socket.current;
    if (!s) return;

    const handleRoomUpdate = (data) => {
      if (data.id === roomId) setRoom(data);
    };
    const handleLeft = () => onLeave();

    s.on('room:update', handleRoomUpdate);
    s.on('room:left', handleLeft);

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

  const myPlayer = room.players.find((p) => p.name === playerName);
  const otherPlayer = room.players.find((p) => p.name !== playerName);
  const canStart = room.playerCount === 2 && room.players.every((p) => p.team);

  return (
    <div className="room-screen">
      <h2>Room {roomId}</h2>

      <div className="players-panel">
        <div className="player-slot">
          <h3>You</h3>
          <div className="player-name">{myPlayer?.name || '—'}</div>
          <div className="team-select">
            <button
              className={`team-btn team-red ${myPlayer?.team === 'red' ? 'selected' : ''}`}
              style={myPlayer?.team === 'red' ? { background: COLORS.red } : {}}
              onClick={() => selectTeam('red')}
            >
              Red
            </button>
            <button
              className={`team-btn team-blue ${myPlayer?.team === 'blue' ? 'selected' : ''}`}
              style={myPlayer?.team === 'blue' ? { background: COLORS.blue } : {}}
              onClick={() => selectTeam('blue')}
            >
              Blue
            </button>
          </div>
        </div>

        <div className="player-slot">
          <h3>Teammate</h3>
          {otherPlayer ? (
            <>
              <div className="player-name">{otherPlayer.name}</div>
              <div
                className="team-badge"
                style={otherPlayer.team ? { background: COLORS[otherPlayer.team], color: '#fff' } : {}}
              >
                {otherPlayer.team ? otherPlayer.team.toUpperCase() : 'Choosing...'}
              </div>
            </>
          ) : (
            <div className="waiting-text">Waiting for player...</div>
          )}
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
