import { BAG_RADIUS } from '../constants.js';
import { pyramids, l4Goals, floorGoals } from './fieldLayout.js';

export function checkScoring(bag) {
  // Check L4 goals first (yellow only, 16pts)
  for (const goal of l4Goals) {
    if (bag.x >= goal.x && bag.x <= goal.x + goal.w &&
        bag.y >= goal.y && bag.y <= goal.y + goal.h) {
      if (bag.color === 'yellow') {
        return { tier: 'l4', points: 16 };
      }
      return null;
    }
  }

  // Check pyramids (innermost first: L3, L2, L1)
  for (const pyr of pyramids) {
    const colorMatch = bag.color === pyr.color || bag.color === 'yellow';

    if (inRect(bag.x, bag.y, pyr.l3)) {
      if (!onBoundary(bag.x, bag.y, pyr.l3)) {
        return colorMatch ? { tier: 'l3', points: 12 } : null;
      }
      // On L3 boundary, fall through to L2
    }

    if (inRect(bag.x, bag.y, pyr.l2)) {
      if (!onBoundary(bag.x, bag.y, pyr.l2)) {
        return colorMatch ? { tier: 'l2', points: 6 } : null;
      }
      // On L2 boundary, fall through to L1
    }

    if (inRect(bag.x, bag.y, pyr.l1)) {
      return colorMatch ? { tier: 'l1', points: 3 } : null;
    }
  }

  // Check floor goals (fully inside + color match)
  for (const goal of floorGoals) {
    const colorMatch = bag.color === goal.color || bag.color === 'yellow';
    if (fullyInside(bag.x, bag.y, BAG_RADIUS, goal)) {
      return colorMatch ? { tier: 'floor', points: 1 } : null;
    }
  }

  return null;
}

function inRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w &&
         y >= rect.y && y <= rect.y + rect.h;
}

function onBoundary(x, y, rect) {
  const eps = 0.5;
  return Math.abs(x - rect.x) < eps || Math.abs(x - (rect.x + rect.w)) < eps ||
         Math.abs(y - rect.y) < eps || Math.abs(y - (rect.y + rect.h)) < eps;
}

function fullyInside(x, y, radius, rect) {
  return (x - radius) >= rect.x && (x + radius) <= (rect.x + rect.w) &&
         (y - radius) >= rect.y && (y + radius) <= (rect.y + rect.h);
}
