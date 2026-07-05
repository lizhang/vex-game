import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export default function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // In dev, connect directly to the game server and bypass Vite's
    // WebSocket proxy (which logs spurious ECONNABORTED errors under
    // StrictMode's double-mount). In prod, same-origin routes through
    // CloudFront to the server.
    const socket = io(import.meta.env.DEV ? 'http://localhost:3001' : undefined, {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.disconnect();
    };
  }, []);

  return { socket: socketRef, connected };
}
