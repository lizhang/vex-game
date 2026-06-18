import { COLORS } from '../constants.js';
import './HUD.css';

export default function HUD({ timer, score, carriedBag, breakdown }) {
  const timerWarning = timer < 10;

  return (
    <div className="hud">
      <div className={`hud-timer ${timerWarning ? 'warning' : ''}`}>
        {Math.ceil(timer)}s
      </div>
      <div className="hud-score">
        Score: {score}
      </div>
      <div className="hud-carry">
        Carrying:{' '}
        {carriedBag ? (
          <span
            className="hud-bag-indicator"
            style={{ background: COLORS[carriedBag] }}
          />
        ) : (
          <span className="hud-empty">none</span>
        )}
      </div>
      {breakdown && (
        <div className="hud-breakdown">
          <span>F:{breakdown.floor}</span>
          <span>L1:{breakdown.l1}</span>
          <span>L2:{breakdown.l2}</span>
          <span>L3:{breakdown.l3}</span>
          <span>L4:{breakdown.l4}</span>
        </div>
      )}
    </div>
  );
}
