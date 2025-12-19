import { useEffect } from 'react';
import { usePushNotification } from './usePushNotification';

/**
 * Hook untuk mengelola push notification lifecycle
 * Auto-unsubscribe saat logout
 */
export const usePushNotificationLifecycle = (token: string | null, isAuthenticated: boolean) => {
  const { unsubscribe } = usePushNotification(token);

  // Auto-unsubscribe saat logout
  useEffect(() => {
    if (!isAuthenticated && token) {
      // User sudah logout, unsubscribe dari notifications
      const performUnsubscribe = async () => {
        try {
          await unsubscribe();
        } catch (error) {
          console.warn('Gagal unsubscribe push notification saat logout:', error);
        }
      };

      // Delay sedikit untuk memastikan proses logout selesai
      setTimeout(performUnsubscribe, 1000);
    }
  }, [isAuthenticated, token, unsubscribe]);

  return null;
};