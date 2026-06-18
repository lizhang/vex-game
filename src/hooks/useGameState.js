import { useRef, useState, useCallback } from 'react';
import { ROBOT_START_RED, ROBOT_START_BLUE, MATCH_DURATION } from '../constants.js';
import { initialBags } from '../game/fieldLayout.js';

function createInitialState(myTeam) {
  const start = myTeam === 'blue' ? ROBOT_START_BLUE : ROBOT_START_RED;
  return {
    robot: {
      x: start.x,
      y: start.y,
      direction: myTeam === 'blue' ? 'down' : 'up',
      carriedBag: null,
    },
    otherRobot: null,
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
    stunned: false,
    stunnedUntil: 0,
  };
}

export default function useGameState(myTeam) {
  const stateRef = useRef(createInitialState(myTeam));
  const [renderState, setRenderState] = useState(() => structuredClone(stateRef.current));

  const pushSnapshot = useCallback(() => {
    setRenderState(structuredClone(stateRef.current));
  }, []);

  const reset = useCallback(() => {
    stateRef.current = createInitialState(myTeam);
    pushSnapshot();
  }, [pushSnapshot, myTeam]);

  return { stateRef, renderState, pushSnapshot, reset };
}
