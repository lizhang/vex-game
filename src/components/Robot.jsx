import { ROBOT_SIZE, COLORS } from '../constants.js';
import './Robot.css';

export default function Robot({ x, y, direction, carriedBag }) {
  const dirIndicator = {
    up: { left: '35%', top: '2px', width: '30%', height: '8px' },
    down: { left: '35%', bottom: '2px', width: '30%', height: '8px' },
    left: { left: '2px', top: '35%', width: '8px', height: '30%' },
    right: { right: '2px', top: '35%', width: '8px', height: '30%' },
  };

  return (
    <div
      className="robot"
      style={{
        left: x - ROBOT_SIZE / 2,
        top: y - ROBOT_SIZE / 2,
        width: ROBOT_SIZE,
        height: ROBOT_SIZE,
      }}
    >
      <div className="robot-direction" style={dirIndicator[direction] || dirIndicator.up} />
      {carriedBag && (
        <div
          className="robot-carried-bag"
          style={{ background: COLORS[carriedBag] }}
        />
      )}
    </div>
  );
}
