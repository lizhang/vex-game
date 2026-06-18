import { ROBOT_SIZE, COLORS } from '../constants.js';
import './Robot.css';

export default function Robot({ x, y, direction, carriedBag, team, isLocal = true, stunned = false }) {
  const dirIndicator = {
    up: { left: '35%', top: '2px', width: '30%', height: '8px' },
    down: { left: '35%', bottom: '2px', width: '30%', height: '8px' },
    left: { left: '2px', top: '35%', width: '8px', height: '30%' },
    right: { right: '2px', top: '35%', width: '8px', height: '30%' },
  };

  const teamColor = team ? COLORS[team] : '#2c3e50';

  return (
    <div
      className={`robot ${stunned ? 'robot--stunned' : ''}`}
      style={{
        left: x - ROBOT_SIZE / 2,
        top: y - ROBOT_SIZE / 2,
        width: ROBOT_SIZE,
        height: ROBOT_SIZE,
        background: teamColor,
        borderColor: team ? (team === 'red' ? '#c0392b' : '#2980b9') : '#1a252f',
      }}
    >
      {!isLocal && <div className="robot-grey-overlay" />}
      <div className="robot-direction" style={dirIndicator[direction] || dirIndicator.up} />
      {carriedBag && (
        <div
          className="robot-carried-bag"
          style={{ background: COLORS[carriedBag] }}
        />
      )}
      {stunned && (
        <div className="robot-stun-stars">
          <span className="stun-star">*</span>
          <span className="stun-star">*</span>
          <span className="stun-star">*</span>
        </div>
      )}
    </div>
  );
}
