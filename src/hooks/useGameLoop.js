import { useEffect, useRef } from 'react';
import { MAX_DELTA } from '../constants.js';

export default function useGameLoop(callback) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const lastTimeRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const loop = (timestamp) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const rawDelta = (timestamp - lastTimeRef.current) / 1000;
      const delta = Math.min(rawDelta, MAX_DELTA);
      lastTimeRef.current = timestamp;

      callbackRef.current(delta);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);
}
