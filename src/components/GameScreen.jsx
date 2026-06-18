import Field from './Field.jsx';
import PyramidGoal from './PyramidGoal.jsx';
import L4Goal from './L4Goal.jsx';
import YellowBar from './YellowBar.jsx';
import FloorGoal from './FloorGoal.jsx';
import BeanBag from './BeanBag.jsx';
import Robot from './Robot.jsx';
import HUD from './HUD.jsx';
import { pyramids, l4Goals, yellowBars, floorGoals, initialBags } from '../game/fieldLayout.js';
import { ROBOT_START_X, ROBOT_START_Y, MATCH_DURATION } from '../constants.js';
import './GameScreen.css';

export default function GameScreen({ gameState }) {
  const state = gameState || {
    robot: { x: ROBOT_START_X, y: ROBOT_START_Y, direction: 'up', carriedBag: null },
    bags: initialBags.map(b => ({ ...b, state: 'field' })),
    timer: MATCH_DURATION,
    score: 0,
    breakdown: { floor: 0, l1: 0, l2: 0, l3: 0, l4: 0, floorCount: 0, l1Count: 0, l2Count: 0, l3Count: 0, l4Count: 0 },
  };

  return (
    <div className="game-screen">
      <HUD
        timer={state.timer}
        score={state.score}
        carriedBag={state.robot.carriedBag}
        breakdown={state.breakdown}
      />
      <Field>
        {floorGoals.map((g, i) => <FloorGoal key={`fg-${i}`} goal={g} />)}
        {pyramids.map((p, i) => <PyramidGoal key={`pyr-${i}`} pyramid={p} />)}
        {l4Goals.map((g, i) => <L4Goal key={`l4-${i}`} goal={g} />)}
        {yellowBars.map((b, i) => <YellowBar key={`bar-${i}`} bar={b} />)}
        {state.bags.map(bag => <BeanBag key={bag.id} bag={bag} />)}
        <Robot
          x={state.robot.x}
          y={state.robot.y}
          direction={state.robot.direction}
          carriedBag={state.robot.carriedBag}
        />
      </Field>
    </div>
  );
}
