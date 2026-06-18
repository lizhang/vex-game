import { ROBOT_SIZE, FIELD_WIDTH, FIELD_HEIGHT, PICKUP_RANGE } from '../constants.js';
import { yellowBars } from './fieldLayout.js';

const HALF = ROBOT_SIZE / 2;

export function clampRobotToField(robot) {
  robot.x = Math.max(HALF, Math.min(FIELD_WIDTH - HALF, robot.x));
  robot.y = Math.max(HALF, Math.min(FIELD_HEIGHT - HALF, robot.y));
}

export function clampRobotToBars(robot, prevX) {
  for (const bar of yellowBars) {
    const yMin = Math.min(bar.y1, bar.y2);
    const yMax = Math.max(bar.y1, bar.y2);

    const robotTop = robot.y - HALF;
    const robotBottom = robot.y + HALF;

    if (robotBottom <= yMin || robotTop >= yMax) continue;

    const robotLeft = robot.x - HALF;
    const robotRight = robot.x + HALF;
    const prevLeft = prevX - HALF;
    const prevRight = prevX + HALF;

    if (prevRight <= bar.x && robotRight > bar.x) {
      robot.x = bar.x - HALF;
    } else if (prevLeft >= bar.x && robotLeft < bar.x) {
      robot.x = bar.x + HALF;
    }
  }
}

export function findPickupBag(robot, bags) {
  let closest = null;
  let closestDist = PICKUP_RANGE;

  for (const bag of bags) {
    if (bag.state !== 'field' && bag.state !== 'landed') continue;
    const dx = robot.x - bag.x;
    const dy = robot.y - bag.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < closestDist) {
      closestDist = dist;
      closest = bag;
    }
  }

  return closest;
}
