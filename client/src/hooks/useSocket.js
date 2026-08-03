import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { getAccessToken } from '../services/axiosInstance';
import { notificationReceived } from '../features/notifications/notificationsSlice';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useSocket(isAuthenticated) {
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const socket = io(`${SOCKET_URL}/notifications`, {
      auth: { token: getAccessToken() },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('notification', (notification) => {
      dispatch(notificationReceived(notification));
      toast(notification.title, { icon: '🔔' });
    });

    return () => socket.disconnect();
  }, [isAuthenticated, dispatch]);

  return socketRef;
}
