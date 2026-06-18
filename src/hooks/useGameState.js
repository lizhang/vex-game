import { useRef, useState, useCallback } from 'react';
import { ROBOT_START_X, ROBOT_START_Y, MATCH_DURATION } from '../constants.js';
import { initialBags } from '../game/fieldLayout.js';

function createInitialState() {
  return {
    robot: {
      x: ROBOT_START_X,
      y: ROBOT_START_Y,
      direction: 'up',
      carriedBag: null,
    },
    bags: initialBags.map(b => ({
      ...b,
      state: 'field',
      vx: 0,
      vy: 0,
    })),
    timer: MATCH_DURATION,
    score: 0,
    breakdown: {
      floor: 0, l1: 0, l2: 0, l3: 0, l4: 0,
      floorCount: 0, l1Count: 0, l2Count: 0, l3Count: 0, l4Count: 0,
    },
    aimState: 'idle',
    aimAngle: 0,
    aimPower: 0,
    aimPowerDir: 1,
    phase: 'playing',
    scorePopups: [],
  };
}

export default function useGameState() {
  const stateRef = useRef(createInitialState());
  const [renderState, setRenderState] = useState(() => structuredClone(stateRef.current));

  const pushSnapshot = useCallback(() => {
    setRenderState(structuredClone(stateRef.current));
  }, []);

  const reset = useCallback(() => {
    stateRef.current = createInitialState();
    pushSnapshot();
  }, [pushSnapshot]);

  return { stateRef, renderState, pushSnapshot, reset };
}
