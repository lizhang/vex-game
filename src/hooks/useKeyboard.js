import { useEffect, useRef } from 'react';

const GAME_KEYS = new Set([
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'Enter', ' ', 'Escape',
]);

export default function useKeyboard() {
  const keysDown = useRef(new Set());
  const justPressed = useRef(new Set());

  useEffect(() => {
    const onKeyDown = (e) => {
      if (GAME_KEYS.has(e.key)) {
        e.preventDefault();
      }
      if (!keysDown.current.has(e.key)) {
        justPressed.current.add(e.key);
      }
      keysDown.current.add(e.key);
    };

    const onKeyUp = (e) => {
      keysDown.current.delete(e.key);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  return { keysDown, justPressed };
}
