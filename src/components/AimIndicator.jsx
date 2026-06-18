import './AimIndicator.css';

export default function AimIndicator({ x, y, angle, power, showPower }) {
  const arrowLen = 60;
  const endX = x + Math.cos(angle) * arrowLen;
  const endY = y + Math.sin(angle) * arrowLen;

  return (
    <>
      <svg className="aim-line" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
        <line
          x1={x} y1={y} x2={endX} y2={endY}
          stroke="#e74c3c"
          strokeWidth="3"
          strokeDasharray="6,4"
        />
        <polygon
          points={arrowHead(endX, endY, angle)}
          fill="#e74c3c"
        />
      </svg>
      {showPower && (
        <div className="power-bar-container" style={{ left: x - 20, top: y - 40 }}>
          <div className="power-bar-fill" style={{ width: `${power * 100}%` }} />
        </div>
      )}
    </>
  );
}

function arrowHead(tipX, tipY, angle) {
  const size = 10;
  const a1 = angle + Math.PI * 0.8;
  const a2 = angle - Math.PI * 0.8;
  const x1 = tipX + Math.cos(a1) * size;
  const y1 = tipY + Math.sin(a1) * size;
  const x2 = tipX + Math.cos(a2) * size;
  const y2 = tipY + Math.sin(a2) * size;
  return `${tipX},${tipY} ${x1},${y1} ${x2},${y2}`;
}
