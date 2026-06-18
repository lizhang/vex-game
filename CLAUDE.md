# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A web game simulating the VEX IQ "Level Up" 2026-2027 robotics competition. Single-player, top-down 2D. The player drives a robot to pick up bean bags and throw them into tiered goals (Floor=1pt, Pyramid L1=3pt, L2=6pt, L3=12pt) within a 60-second match.

## Commands

```bash
npm install          # install dependencies
npm run dev          # start Vite dev server (hot reload)
npm run build        # production build to dist/
npm run preview      # preview production build locally
```

## Tech Stack

React + Vite, simple CSS, DOM-based rendering (absolutely positioned divs, not canvas). No CSS frameworks or game libraries.

## Architecture

**Hybrid React game loop**: Game state lives in a `useRef` (mutable, updated synchronously each frame via `requestAnimationFrame`). A frozen snapshot is pushed into `useState` once per frame to trigger React re-renders. Keyboard input is tracked in a ref-based `Set` — never in React state.

Key architectural layers:
- `src/hooks/` — `useGameLoop` (rAF + delta time), `useKeyboard` (key tracking + just-pressed detection), `useGameState` (mutable state ref)
- `src/game/` — Pure logic modules: `physics.js` (movement, projectile trajectory, friction), `collision.js` (wall bounds, pickup proximity, goal detection), `scoring.js` (score calculation), `fieldLayout.js` (positions of goals/zones/bags)
- `src/components/` — React components that read from the render snapshot and render as absolutely positioned children inside a `position: relative` field container
- `src/constants.js` — All tunable game values (field dimensions, speeds, radii, colors). Change gameplay feel here.

**Controls**: Arrow keys move robot, Enter picks up bags, Space triggers a 3-phase aim+power+throw sequence, Escape cancels aim mode. Browser default scrolling must be prevented for these keys.

**Field**: 600x800px (100px per real foot on a 6'x8' VEX field). Pyramid goals use concentric rings — scoring detection checks innermost ring first so the hardest target gets credit.
