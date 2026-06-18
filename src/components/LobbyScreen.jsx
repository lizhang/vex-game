import { useState, useEffect } from 'react';
import './LobbyScreen.css';

export default function LobbyScreen({ socket, onJoined }) {
  const [playerName, setPlayerName] = useState('');
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const s = socket.current;
    if (!s) return;

    const handleRoomList = (list) => setRooms(list);
    const handleJoined = ({ roomId }) => onJoined(roomId, playerName);
    const handleError = ({ message }) => setError(message);

    s.on('room:list', handleRoomList);
    s.on('room:joined', handleJoined);
    s.on('room:error', handleError);

    return () => {
      s.off('room:list', handleRoomList);
      s.off('room:joined', handleJoined);
      s.off('room:error', handleError);
    };
  }, [socket, onJoined, playerName]);

  function joinRoom(roomId) {
    if (!playerName.trim()) {
      setError('Enter your name first');
      return;
    }
    setError('');
    socket.current.emit('room:join', { roomId, playerName: playerName.trim() });
  }

  function getStatusLabel(room) {
    if (room.status === 'empty') return 'Open';
    if (room.status === 'waiting') return '1/2 Waiting';
    if (room.status === 'ready') return '2/2 Ready';
    if (room.status === 'playing' || room.status === 'countdown') return 'In Game';
    if (room.status === 'gameover') return 'Game Over';
    return room.status;
  }

  function canJoin(room) {
    return room.playerCount < 2 && room.status !== 'playing' && room.status !== 'countdown';
  }

  return (
    <div className="lobby-screen">
      <h1>VEX IQ Level Up</h1>
      <h2>Multiplayer Lobby</h2>

      <div className="name-input">
        <label>Your Name:</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          maxLength={20}
        />
      </div>

      {error && <div className="lobby-error">{error}</div>}

      <div className="room-list">
        <h3>Game Rooms</h3>
        {rooms.map((room) => (
          <div key={room.id} className={`room-item ${canJoin(room) ? 'joinable' : 'unavailable'}`}>
            <span className="room-name">Room {room.id}</span>
            <span className={`room-status status-${room.status}`}>{getStatusLabel(room)}</span>
            <span className="room-players">
              {room.players.map((p) => p.name).join(', ') || '—'}
            </span>
            <button
              onClick={() => joinRoom(room.id)}
              disabled={!canJoin(room)}
            >
              Join
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
