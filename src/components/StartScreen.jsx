import './StartScreen.css';

export default function StartScreen({ onStart }) {
  return (
    <div className="start-screen">
      <h1 className="start-title">VEX IQ Level Up</h1>
      <p className="start-subtitle">2026-2027 Robotics Competition</p>
      <p className="start-prompt">Press Enter to Start</p>
      <div className="start-controls">
        <p>Arrow Keys - Move Robot</p>
        <p>Enter - Pick Up Bag</p>
        <p>Space - Aim &amp; Throw</p>
        <p>Escape - Cancel Aim</p>
      </div>
    </div>
  );
}
