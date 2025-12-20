import { useEffect, useRef } from 'react';
import { usePushNotification } from './usePushNotification';

/**
 * Hook untuk mengelola push notification lifecycle
 * Auto-unsubscribe SAAT logout (bukan saat login)
 */
export const usePushNotificationLifecycle = (token: string | null, isAuthenticated: boolean) => {
  const { unsubscribe } = usePushNotification(token);
  const wasAuthenticatedRef = useRef(isAuthenticated);

  // Auto-unsubscribe SAAT logout (bukan saat login)
  useEffect(() => {
    // Hanya unsubscribe jika user benar-benar logout (dari authenticated ke not authenticated)
    if (wasAuthenticatedRef.current && !isAuthenticated && token) {
      // User sudah logout, unsubscribe dari notifications
      const performUnsubscribe = async () => {
        try {
          await unsubscribe();
        } catch (error) {
          console.warn('Gagal unsubscribe push notification saat logout:', error);
        }
      };

      // Delay untuk memastikan proses logout selesai
      setTimeout(performUnsubscribe, 500); // Kurangi delay dari 1000ms ke 500ms
    }

    // Update ref untuk next render
    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, token, unsubscribe]);

  return null;
};