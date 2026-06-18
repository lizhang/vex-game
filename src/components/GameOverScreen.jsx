import { useState } from 'react';
import './GameOverScreen.css';

export default function GameOverScreen({ score, breakdown, endReason, onPlayAgain, onLeave }) {
  const [waitingForOther, setWaitingForOther] = useState(false);

  function handlePlayAgain() {
    setWaitingForOther(true);
    onPlayAgain();
  }

  return (
    <div className="gameover-screen">
      <h1 className="gameover-title">Game Over</h1>
      {endReason === 'abandoned' && (
        <div className="gameover-reason">Teammate disconnected</div>
      )}
      <div className="gameover-score">Final Score: {score}</div>
      {breakdown && (
        <div className="gameover-breakdown">
          <div>Floor Goals: {breakdown.floor} pts ({breakdown.floorCount} bags)</div>
          <div>L1: {breakdown.l1} pts ({breakdown.l1Count} bags)</div>
          <div>L2: {breakdown.l2} pts ({breakdown.l2Count} bags)</div>
          <div>L3: {breakdown.l3} pts ({breakdown.l3Count} bags)</div>
          <div>L4: {breakdown.l4} pts ({breakdown.l4Count} bags)</div>
        </div>
      )}
      <div className="gameover-actions">
        {waitingForOther ? (
          <div className="gameover-waiting">Waiting for other player...</div>
        ) : (
          <button className="play-again-btn" onClick={handlePlayAgain}>
            Play Again
          </button>
        )}
        <button className="leave-room-btn" onClick={onLeave}>
          Leave Room
        </button>
      </div>
    </div>
  );
}
