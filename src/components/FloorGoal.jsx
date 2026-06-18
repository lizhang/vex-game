import { COLORS } from '../constants.js';
import './FloorGoal.css';

export default function FloorGoal({ goal }) {
  const bg = goal.color === 'red' ? COLORS.floorGoalRed : COLORS.floorGoalBlue;

  return (
    <div
      className="floor-goal"
      style={{
        left: goal.x,
        top: goal.y,
        width: goal.w,
        height: goal.h,
        background: bg,
        opacity: 0.3,
      }}
    />
  );
}
