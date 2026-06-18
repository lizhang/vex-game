import { COLORS } from '../constants.js';
import './L4Goal.css';

export default function L4Goal({ goal }) {
  return (
    <div
      className="l4-goal"
      style={{
        left: goal.x,
        top: goal.y,
        width: goal.w,
        height: goal.h,
        background: COLORS.l4,
      }}
    />
  );
}
