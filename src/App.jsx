import { useState, useEffect, useCallback } from 'react';
import StartScreen from './components/StartScreen.jsx';
import GameScreen from './components/GameScreen.jsx';
import GameOverScreen from './components/GameOverScreen.jsx';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('start');
  const [finalScore, setFinalScore] = useState(0);
  const [finalBreakdown, setFinalBreakdown] = useState(null);

  const handleStart = useCallback(() => setScreen('playing'), []);
  const handleGameOver = useCallback((score, breakdown) => {
    setFinalScore(score);
    setFinalBreakdown(breakdown);
    setScreen('gameover');
  }, []);
  const handleReplay = useCallback(() => setScreen('start'), []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Enter') {
        if (screen === 'start') handleStart();
        else if (screen === 'gameover') handleReplay();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [screen, handleStart, handleReplay]);

  return (
    <div className="app">
      {screen === 'start' && <StartScreen onStart={handleStart} />}
      {screen === 'playing' && <GameScreen onGameOver={handleGameOver} />}
      {screen === 'gameover' && (
        <GameOverScreen score={finalScore} breakdown={finalBreakdown} />
      )}
    </div>
  );
}
