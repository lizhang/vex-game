import './CountdownOverlay.css';

export default function CountdownOverlay({ count }) {
  return (
    <div className="countdown-overlay">
      <div className="countdown-text">{count > 0 ? count : 'GO!'}</div>
    </div>
  );
}
