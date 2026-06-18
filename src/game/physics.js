import { ROBOT_SPEED, THROW_FRICTION, FIELD_WIDTH, FIELD_HEIGHT, WALL_BOUNCE_ENERGY, BAG_RADIUS } from '../constants.js';

export function updateRobotPosition(robot, keysDown, delta) {
  let dx = 0;
  let dy = 0;

  if (keysDown.has('ArrowUp')) dy -= 1;
  if (keysDown.has('ArrowDown')) dy += 1;
  if (keysDown.has('ArrowLeft')) dx -= 1;
  if (keysDown.has('ArrowRight')) dx += 1;

  if (dx === 0 && dy === 0) return;

  const len = Math.sqrt(dx * dx + dy * dy);
  dx /= len;
  dy /= len;

  robot.x += dx * ROBOT_SPEED * delta;
  robot.y += dy * ROBOT_SPEED * delta;

  if (dy < 0) robot.direction = 'up';
  else if (dy > 0) robot.direction = 'down';
  else if (dx < 0) robot.direction = 'left';
  else if (dx > 0) robot.direction = 'right';
}

export function updateProjectile(bag, delta) {
  if (bag.state !== 'flying') return;

  const speed = Math.sqrt(bag.vx * bag.vx + bag.vy * bag.vy);
  if (speed < 1) {
    bag.vx = 0;
    bag.vy = 0;
    bag.state = 'landed';
    return;
  }

  const friction = THROW_FRICTION * delta;
  const newSpeed = Math.max(0, speed - friction);
  const ratio = newSpeed / speed;
  bag.vx *= ratio;
  bag.vy *= ratio;

  bag.x += bag.vx * delta;
  bag.y += bag.vy * delta;

  if (bag.x - BAG_RADIUS < 0) {
    bag.x = BAG_RADIUS;
    bag.vx = Math.abs(bag.vx) * WALL_BOUNCE_ENERGY;
  } else if (bag.x + BAG_RADIUS > FIELD_WIDTH) {
    bag.x = FIELD_WIDTH - BAG_RADIUS;
    bag.vx = -Math.abs(bag.vx) * WALL_BOUNCE_ENERGY;
  }

  if (bag.y - BAG_RADIUS < 0) {
    bag.y = BAG_RADIUS;
    bag.vy = Math.abs(bag.vy) * WALL_BOUNCE_ENERGY;
  } else if (bag.y + BAG_RADIUS > FIELD_HEIGHT) {
    bag.y = FIELD_HEIGHT - BAG_RADIUS;
    bag.vy = -Math.abs(bag.vy) * WALL_BOUNCE_ENERGY;
  }
}
