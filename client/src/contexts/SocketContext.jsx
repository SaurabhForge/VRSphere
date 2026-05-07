import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const DEFAULT_RENDER_SOCKET_URL = 'https://vrsphere-backend.onrender.com';

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.onrender.com')) {
    return DEFAULT_RENDER_SOCKET_URL;
  }
  return '/';
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('vrsphere_token');
    socketRef.current = io(getSocketUrl(), {
      auth: { token },
      transports: ['websocket'],
      withCredentials: true,
    });

    socketRef.current.on('connect', () => {
      setConnected(true);
      console.log('✅ Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
      console.log('❌ Socket disconnected');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside SocketProvider');
  return ctx;
};
