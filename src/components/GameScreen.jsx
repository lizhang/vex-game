import { useCallback } from 'react';
import Field from './Field.jsx';
import PyramidGoal from './PyramidGoal.jsx';
import L4Goal from './L4Goal.jsx';
import YellowBar from './YellowBar.jsx';
import FloorGoal from './FloorGoal.jsx';
import BeanBag from './BeanBag.jsx';
import Robot from './Robot.jsx';
import HUD from './HUD.jsx';
import AimIndicator from './AimIndicator.jsx';
import useKeyboard from '../hooks/useKeyboard.js';
import useGameLoop from '../hooks/useGameLoop.js';
import useGameState from '../hooks/useGameState.js';
import { updateRobotPosition, updateProjectile } from '../game/physics.js';
import { clampRobotToField, clampRobotToBars, findPickupBag } from '../game/collision.js';
import { checkScoring } from '../game/scoring.js';
import { pyramids, l4Goals, yellowBars, floorGoals } from '../game/fieldLayout.js';
import { THROW_MAX_SPEED, THROW_MIN_SPEED, POWER_CYCLE_DURATION, AIM_ROTATE_SPEED, MATCH_DURATION } from '../constants.js';
import './GameScreen.css';

export default function GameScreen({ onGameOver }) {
  const { keysDown, justPressed } = useKeyboard();
  const { stateRef, renderState, pushSnapshot, reset } = useGameState();

  const tick = useCallback((delta) => {
    const s = stateRef.current;
    if (s.phase !== 'playing') return;

    s.timer -= delta;
    if (s.timer <= 0) {
      s.timer = 0;
      s.phase = 'finished';
      pushSnapshot();
      onGameOver(s.score, s.breakdown);
      return;
    }

    const jp = justPressed.current;
    const kd = keysDown.current;

    // Aim state machine
    if (s.aimState === 'idle') {
      if (jp.has(' ') && s.robot.carriedBag) {
        s.aimState = 'aiming';
        s.aimAngle = directionToAngle(s.robot.direction);
        s.aimPower = 0;
        s.aimPowerDir = 1;
      }
    } else if (s.aimState === 'aiming') {
      if (kd.has('ArrowLeft')) s.aimAngle -= AIM_ROTATE_SPEED * delta;
      if (kd.has('ArrowRight')) s.aimAngle += AIM_ROTATE_SPEED * delta;
      if (jp.has(' ')) {
        s.aimState = 'power';
      }
      if (jp.has('Escape')) {
        s.aimState = 'idle';
      }
    } else if (s.aimState === 'power') {
      s.aimPower += s.aimPowerDir * delta / POWER_CYCLE_DURATION * 2;
      if (s.aimPower >= 1) { s.aimPower = 1; s.aimPowerDir = -1; }
      if (s.aimPower <= 0) { s.aimPower = 0; s.aimPowerDir = 1; }

      if (jp.has(' ')) {
        const speed = THROW_MIN_SPEED + (THROW_MAX_SPEED - THROW_MIN_SPEED) * s.aimPower;
        const bag = s.bags.find(b => b.id === s.robot.carriedBag);
        if (bag) {
          bag.state = 'flying';
          bag.x = s.robot.x;
          bag.y = s.robot.y;
          bag.vx = Math.cos(s.aimAngle) * speed;
          bag.vy = Math.sin(s.aimAngle) * speed;
        }
        s.robot.carriedBag = null;
        s.aimState = 'idle';
      }
      if (jp.has('Escape')) {
        s.aimState = 'idle';
      }
    }

    // Robot movement (only when not aiming)
    if (s.aimState === 'idle') {
      const prevX = s.robot.x;
      updateRobotPosition(s.robot, kd, delta);
      clampRobotToBars(s.robot, prevX);
      clampRobotToField(s.robot);
    }

    // Pickup
    if (jp.has('Enter') && !s.robot.carriedBag && s.aimState === 'idle') {
      const bag = findPickupBag(s.robot, s.bags);
      if (bag) {
        bag.state = 'carried';
        s.robot.carriedBag = bag.id;
      }
    }

    // Projectile physics
    for (const bag of s.bags) {
      if (bag.state === 'flying') {
        updateProjectile(bag, delta);
        if (bag.state === 'landed') {
          const result = checkScoring(bag);
          if (result) {
            bag.state = 'scored';
            s.score += result.points;
            s.breakdown[result.tier] += result.points;
            s.breakdown[result.tier + 'Count'] += 1;
            s.scorePopups.push({
              id: Date.now() + Math.random(),
              x: bag.x,
              y: bag.y,
              points: result.points,
              time: 1.0,
            });
          }
        }
      }
    }

    // Update score popups
    s.scorePopups = s.scorePopups
      .map(p => ({ ...p, time: p.time - delta }))
      .filter(p => p.time > 0);

    jp.clear();
    pushSnapshot();
  }, [stateRef, keysDown, justPressed, pushSnapshot, onGameOver]);

  useGameLoop(tick);

  return (
    <div className="game-screen">
      <HUD
        timer={renderState.timer}
        score={renderState.score}
        carriedBag={renderState.robot.carriedBag ? renderState.bags.find(b => b.id === renderState.robot.carriedBag)?.color : null}
        breakdown={renderState.breakdown}
      />
      <Field>
        {floorGoals.map((g, i) => <FloorGoal key={`fg-${i}`} goal={g} />)}
        {pyramids.map((p, i) => <PyramidGoal key={`pyr-${i}`} pyramid={p} />)}
        {l4Goals.map((g, i) => <L4Goal key={`l4-${i}`} goal={g} />)}
        {yellowBars.map((b, i) => <YellowBar key={`bar-${i}`} bar={b} />)}
        {renderState.bags.map(bag => <BeanBag key={bag.id} bag={bag} />)}
        <Robot
          x={renderState.robot.x}
          y={renderState.robot.y}
          direction={renderState.robot.direction}
          carriedBag={renderState.robot.carriedBag ? renderState.bags.find(b => b.id === renderState.robot.carriedBag)?.color : null}
        />
        {renderState.aimState !== 'idle' && (
          <AimIndicator
            x={renderState.robot.x}
            y={renderState.robot.y}
            angle={renderState.aimAngle}
            power={renderState.aimPower}
            showPower={renderState.aimState === 'power'}
          />
        )}
        {renderState.scorePopups.map(p => (
          <div
            key={p.id}
            className="score-popup"
            style={{
              left: p.x,
              top: p.y - (1 - p.time) * 40,
              opacity: p.time,
            }}
          >
            +{p.points}
          </div>
        ))}
      </Field>
    </div>
  );
}

function directionToAngle(dir) {
  switch (dir) {
    case 'up': return -Math.PI / 2;
    case 'down': return Math.PI / 2;
    case 'left': return Math.PI;
    case 'right': return 0;
    default: return -Math.PI / 2;
  }
}
