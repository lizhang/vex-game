import { memo } from 'react';
import { COLORS, BAG_RADIUS } from '../constants.js';
import './BeanBag.css';

export default memo(function BeanBag({ bag }) {
  if (bag.state === 'carried' || bag.state === 'flying') return null;

  const bg = COLORS[bag.color];
  const isScored = bag.state === 'scored';

  return (
    <div
      className={`bean-bag ${isScored ? 'scored' : ''}`}
      style={{
        left: bag.x - BAG_RADIUS,
        top: bag.y - BAG_RADIUS,
        width: BAG_RADIUS * 2,
        height: BAG_RADIUS * 2,
        background: bg,
      }}
    />
  );
})
