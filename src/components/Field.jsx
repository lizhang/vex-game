import { FIELD_WIDTH, FIELD_HEIGHT, COLORS } from '../constants.js';
import { gridLinesX, gridLinesY } from '../game/fieldLayout.js';
import './Field.css';

export default function Field({ children }) {
  return (
    <div className="field" style={{ width: FIELD_WIDTH, height: FIELD_HEIGHT }}>
      {gridLinesX.map(x => (
        <div
          key={`gx-${x}`}
          className="grid-line-v"
          style={{ left: x }}
        />
      ))}
      {gridLinesY.map(y => (
        <div
          key={`gy-${y}`}
          className="grid-line-h"
          style={{ top: y }}
        />
      ))}
      {children}
    </div>
  );
}
