import { COLORS } from '../constants.js';
import './YellowBar.css';

export default function YellowBar({ bar }) {
  const top = Math.min(bar.y1, bar.y2);
  const height = Math.abs(bar.y2 - bar.y1);

  return (
    <div
      className="yellow-bar"
      style={{
        left: bar.x - 2,
        top,
        width: 4,
        height,
        background: COLORS.yellowBar,
      }}
    />
  );
}
