# VEX Game

A web game inspired by the **VEX IQ "Level Up" 2026–2027** robotics competition. Drive a robot around a top-down 2D field, pick up bean bags, and throw them into tiered goals to score points before the 60-second match runs out. Play head-to-head as **Red vs. Blue** in real-time multiplayer rooms.

## Gameplay

- **Objective**: score as many points as possible in a 60-second match.
- **Goals & scoring**:
  - Floor goal — **1 pt**
  - Pyramid L1 — **3 pts**
  - Pyramid L2 — **6 pts**
  - Pyramid L3 — **12 pts**
  - L4 goal — **16 pts**
- **Teams**: Red starts bottom-left, Blue starts top-right. Robots can stun each other on contact.

### Controls

| Key          | Action                                             |
| ------------ | -------------------------------------------------- |
| Arrow keys   | Move the robot                                     |
| Enter        | Pick up a nearby bean bag                          |
| Space        | 3-phase aim → power → throw sequence               |
| Escape       | Cancel aim mode                                    |

## Tech Stack

- **Frontend**: React 19 + Vite, plain CSS, DOM-based rendering (absolutely positioned `div`s — no canvas or game engine).
- **Multiplayer**: Socket.IO client ↔ a Node.js Socket.IO server that manages rooms and runs the authoritative game loop.
- **Deployment**: AWS — S3 + CloudFront for the static frontend, EC2 for the game server, DynamoDB for state; provisioned with Terraform.

## Getting Started

### Prerequisites

- Node.js 18+

### Install

```bash
npm install               # frontend dependencies
cd server && npm install  # server dependencies, then cd back
```

### Run locally

Run the client and server together:

```bash
npm run dev:all
```

Or run them separately in two terminals:

```bash
npm run server   # game server on http://localhost:3001
npm run dev       # Vite dev server (proxies /socket.io to :3001)
```

Then open the URL Vite prints (defaults to http://localhost:5173).

## Scripts

| Script                   | Description                                              |
| ------------------------ | ------------------------------------------------------- |
| `npm run dev`            | Start the Vite dev server with hot reload               |
| `npm run server`         | Start the Socket.IO game server (`--watch`) on port 3001 |
| `npm run dev:all`        | Run the client and server concurrently                  |
| `npm run build`          | Production build to `dist/`                             |
| `npm run preview`        | Preview the production build locally                    |
| `npm run deploy:static`  | Build and sync `dist/` to the S3 bucket                 |

## Project Structure

```
src/
  hooks/        useGameLoop, useKeyboard, useGameState, useSocket
  game/         Pure logic: physics, collision, scoring, fieldLayout
  components/   React components rendered inside the field container
  constants.js  All tunable game values (dimensions, speeds, colors, points)
server/         Socket.IO server: room manager, game manager, DynamoDB
infra/          Terraform for AWS (S3, CloudFront, EC2, DynamoDB)
```

### Architecture

The client uses a **hybrid React game loop**: mutable game state lives in a `useRef` and is updated synchronously each frame via `requestAnimationFrame`; a frozen snapshot is pushed to `useState` once per frame to trigger re-renders. Keyboard input is tracked in a ref-based `Set`, never in React state. Tune gameplay feel in `src/constants.js`.

The field is 800×600px. Pyramid goals use concentric rings — scoring checks the innermost ring first so the hardest target gets credit.

## Deployment

The app deploys to AWS (S3 + CloudFront + EC2 + DynamoDB) via Terraform. See [DEPLOY.md](./DEPLOY.md) for the full step-by-step guide.
