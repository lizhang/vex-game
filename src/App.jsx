import { useState, useEffect, useCallback } from 'react';
import useSocket from './hooks/useSocket.js';
import LobbyScreen from './components/LobbyScreen.jsx';
import RoomScreen from './components/RoomScreen.jsx';
import CountdownOverlay from './components/CountdownOverlay.jsx';
import GameScreen from './components/GameScreen.jsx';
import GameOverScreen from './components/GameOverScreen.jsx';
import './App.css';

export default function App() {
  const { socket, connected } = useSocket();
  const [screen, setScreen] = useState('lobby');
  const [roomId, setRoomId] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [myTeam, setMyTeam] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [gameOverData, setGameOverData] = useState(null);
  const [initialRoomData, setInitialRoomData] = useState(null);

  const goToLobby = useCallback(() => {
    setScreen('lobby');
    setRoomId(null);
    setMyTeam(null);
    setCountdown(null);
    setGameOverData(null);
    setInitialRoomData(null);
  }, []);

  const handleJoined = useCallback((id, name, roomData) => {
    setRoomId(id);
    setPlayerName(name);
    setInitialRoomData(roomData);
    setScreen('room');
  }, []);

  useEffect(() => {
    const s = socket.current;
    if (!s) return;

    const handleCountdown = ({ count }) => {
      setCountdown(count);
      setScreen('countdown');
    };

    const handleGo = () => {
      setCountdown(0);
      setTimeout(() => {
        setCountdown(null);
        setScreen('playing');
      }, 800);
    };

    const handleGameOver = (data) => {
      console.log('game:over received', data);
      setGameOverData(data);
      setScreen('gameover');
    };

    const handleReady = () => {
      setScreen('room');
      setGameOverData(null);
    };

    const handleRoomUpdate = (data) => {
      if (data.id === roomId) {
        const me = data.players.find((p) => p.name === playerName);
        if (me && me.team) setMyTeam(me.team);
      }
    };

    s.on('countdown', handleCountdown);
    s.on('game:go', handleGo);
    s.on('game:over', handleGameOver);
    s.on('game:ready', handleReady);
    s.on('room:update', handleRoomUpdate);

    return () => {
      s.off('countdown', handleCountdown);
      s.off('game:go', handleGo);
      s.off('game:over', handleGameOver);
      s.off('game:ready', handleReady);
      s.off('room:update', handleRoomUpdate);
    };
  }, [socket, roomId, playerName]);

  if (!connected) {
    return (
      <div className="app">
        <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
          Connecting to server...
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {screen === 'lobby' && (
        <LobbyScreen socket={socket} onJoined={handleJoined} />
      )}

      {screen === 'room' && (
        <RoomScreen
          socket={socket}
          roomId={roomId}
          playerName={playerName}
          onLeave={goToLobby}
          initialRoom={initialRoomData}
        />
      )}

      {(screen === 'countdown' || screen === 'playing') && (
        <>
          {countdown !== null && <CountdownOverlay count={countdown} />}
          {screen === 'playing' && (
            <GameScreen
              socket={socket}
              myTeam={myTeam}
              playerName={playerName}
            />
          )}
        </>
      )}

      {screen === 'gameover' && gameOverData && (
        <GameOverScreen
          score={gameOverData.score}
          breakdown={gameOverData.breakdown}
          endReason={gameOverData.endReason}
          onPlayAgain={() => socket.current.emit('game:play-again')}
          onLeave={() => {
            socket.current.emit('room:leave');
            goToLobby();
          }}
        />
      )}
    </div>
  );
}
