import { useEffect } from 'react';
import { playNotificationSound } from '../lib/utils';
import { useSocketContext } from './useSocketContext';

const useListenMessages = () => {
  const socket = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message) => {
      console.log('Yeni mesaj:', message);
      // Bildirim sesini çal
      playNotificationSound();
    };

    socket.on('message', handleMessage);

    return () => {
      socket.off('message', handleMessage);
    };
  }, [socket]);
};

export default useListenMessages;
