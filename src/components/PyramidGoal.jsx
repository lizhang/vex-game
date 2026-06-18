import { COLORS } from '../constants.js';
import './PyramidGoal.css';

export default function PyramidGoal({ pyramid }) {
  const c = pyramid.color === 'red' ? COLORS.pyramidRed : COLORS.pyramidBlue;

  return (
    <>
      <div
        className="pyramid-tier"
        style={{
          left: pyramid.l1.x,
          top: pyramid.l1.y,
          width: pyramid.l1.w,
          height: pyramid.l1.h,
          background: c.l1,
        }}
      />
      <div
        className="pyramid-tier"
        style={{
          left: pyramid.l2.x,
          top: pyramid.l2.y,
          width: pyramid.l2.w,
          height: pyramid.l2.h,
          background: c.l2,
        }}
      />
      <div
        className="pyramid-tier"
        style={{
          left: pyramid.l3.x,
          top: pyramid.l3.y,
          width: pyramid.l3.w,
          height: pyramid.l3.h,
          background: c.l3,
        }}
      />
    </>
  );
}
