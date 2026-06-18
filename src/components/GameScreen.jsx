import { useCallback, useEffect, useRef } from 'react';
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
import { updateRobotPosition } from '../game/physics.js';
import { clampRobotToField, clampRobotToBars, findPickupBag } from '../game/collision.js';
import { pyramids, l4Goals, yellowBars, floorGoals } from '../game/fieldLayout.js';
import {
  THROW_MAX_SPEED, THROW_MIN_SPEED, POWER_CYCLE_DURATION,
  AIM_ROTATE_SPEED, MOVE_SEND_INTERVAL,
} from '../constants.js';
import './GameScreen.css';

export default function GameScreen({ socket, myTeam, playerName }) {
  const { keysDown, justPressed } = useKeyboard();
  const { stateRef, renderState, pushSnapshot } = useGameState(myTeam);
  const lastSendTime = useRef(0);

  useEffect(() => {
    const s = socket.current;
    if (!s) return;

    const handleOpponentMove = (data) => {
      const st = stateRef.current;
      st.otherRobot = {
        x: data.x,
        y: data.y,
        direction: data.direction,
        carriedBag: data.carriedBag,
        team: data.team || (myTeam === 'red' ? 'blue' : 'red'),
        stunned: data.stunned,
      };
    };

    const handleStateUpdate = (data) => {
      const st = stateRef.current;
      if (data.otherRobot) {
        st.otherRobot = data.otherRobot;
      }
      if (data.bags) {
        st.bags = data.bags;
      }
      if (data.score !== undefined) {
        st.score = data.score;
        st.breakdown = data.breakdown;
      }
    };

    const handleTimerUpdate = ({ remaining }) => {
      stateRef.current.timer = remaining;
    };

    const handlePickupConfirm = ({ bagId }) => {
      const st = stateRef.current;
      st.robot.carriedBag = bagId;
      const bag = st.bags.find((b) => b.id === bagId);
      if (bag) bag.state = 'carried';
    };

    const handlePickupDenied = () => {};

    const handleThrowResult = ({ bagId, bag, scoreResult, score, breakdown }) => {
      const st = stateRef.current;
      const b = st.bags.find((x) => x.id === bagId);
      if (b) {
        b.x = bag.x;
        b.y = bag.y;
        b.state = bag.state;
        b.vx = 0;
        b.vy = 0;
      }
      st.score = score;
      st.breakdown = breakdown;
      if (scoreResult) {
        st.scorePopups.push({
          id: Date.now() + Math.random(),
          x: bag.x,
          y: bag.y,
          points: scoreResult.points,
          time: 1.0,
        });
      }
    };

    const handleBump = ({ myPos, stunDuration }) => {
      const st = stateRef.current;
      st.robot.x = myPos.x;
      st.robot.y = myPos.y;
      st.robot.carriedBag = null;
      st.stunned = true;
      st.stunnedUntil = Date.now() + stunDuration;
      st.aimState = 'idle';
    };

    s.on('opponent:move', handleOpponentMove);
    s.on('state:update', handleStateUpdate);
    s.on('timer:update', handleTimerUpdate);
    s.on('pickup:confirm', handlePickupConfirm);
    s.on('pickup:denied', handlePickupDenied);
    s.on('throw:result', handleThrowResult);
    s.on('bump', handleBump);

    return () => {
      s.off('opponent:move', handleOpponentMove);
      s.off('state:update', handleStateUpdate);
      s.off('timer:update', handleTimerUpdate);
      s.off('pickup:confirm', handlePickupConfirm);
      s.off('pickup:denied', handlePickupDenied);
      s.off('throw:result', handleThrowResult);
      s.off('bump', handleBump);
    };
  }, [socket, stateRef, myTeam]);

  const tick = useCallback((delta) => {
    const s = stateRef.current;
    if (s.phase !== 'playing') return;

    if (s.stunned && Date.now() >= s.stunnedUntil) {
      s.stunned = false;
    }

    const jp = justPressed.current;
    const kd = keysDown.current;

    if (!s.stunned) {
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
          socket.current.emit('player:throw', {
            bagId: s.robot.carriedBag,
            angle: s.aimAngle,
            power: s.aimPower,
          });
          s.robot.carriedBag = null;
          s.aimState = 'idle';
        }
        if (jp.has('Escape')) {
          s.aimState = 'idle';
        }
      }

      if (s.aimState === 'idle') {
        const prevX = s.robot.x;
        updateRobotPosition(s.robot, kd, delta);
        clampRobotToBars(s.robot, prevX);
        clampRobotToField(s.robot);

        const now = Date.now();
        if (now - lastSendTime.current >= MOVE_SEND_INTERVAL) {
          socket.current.emit('player:move', {
            x: s.robot.x,
            y: s.robot.y,
            direction: s.robot.direction,
          });
          lastSendTime.current = now;
        }
      }

      if (jp.has('Enter') && !s.robot.carriedBag && s.aimState === 'idle') {
        const bag = findPickupBag(s.robot, s.bags);
        if (bag) {
          socket.current.emit('player:pickup', { bagId: bag.id });
        }
      }
    }

    s.scorePopups = s.scorePopups
      .map(p => ({ ...p, time: p.time - delta }))
      .filter(p => p.time > 0);

    jp.clear();
    pushSnapshot();
  }, [stateRef, keysDown, justPressed, pushSnapshot, socket]);

  useGameLoop(tick);

  const otherTeam = myTeam === 'red' ? 'blue' : 'red';

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
          team={myTeam}
          isLocal={true}
          stunned={renderState.stunned}
        />

        {renderState.otherRobot && (
          <Robot
            x={renderState.otherRobot.x}
            y={renderState.otherRobot.y}
            direction={renderState.otherRobot.direction}
            carriedBag={renderState.otherRobot.carriedBag ? renderState.bags.find(b => b.id === renderState.otherRobot.carriedBag)?.color : null}
            team={otherTeam}
            isLocal={false}
            stunned={renderState.otherRobot.stunned}
          />
        )}

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
