import { useState, useEffect, useCallback } from 'react';
import PushNotificationService, { PushNotificationData, MyPushSubscription } from '../services/pushNotification';

export interface UsePushNotification {
  isSupported: boolean;
  subscribed: boolean;
  loading: boolean;
  permission: NotificationPermission;
  error: string | null;
  subscription: MyPushSubscription | null;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  sendNotification: (data: PushNotificationData) => Promise<void>;
  showLocalNotification: (data: PushNotificationData) => void;
  toggle: () => Promise<void>;
}

export const usePushNotification = (token?: string | null): UsePushNotification => {
  const [isSupported, setIsSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<MyPushSubscription | null>(null);
  const [lastAttemptTime, setLastAttemptTime] = useState<number>(0);

  // Check support on mount
  useEffect(() => {
    const supported = PushNotificationService.isSupported();
    setIsSupported(supported);
    
    if (supported) {
      PushNotificationService.getNotificationPermission().then(setPermission);
    }
  }, []);

  const checkSubscription = useCallback(async () => {
    try {
      const currentSub = await PushNotificationService.getCurrentSubscription();
      setSubscription(currentSub);
      setSubscribed(!!currentSub);
    } catch (error: any) {
      setError(error.message);
    }
  }, []);

  // Check current subscription on mount
  useEffect(() => {
    if (isSupported) {
      checkSubscription();
    }
  }, [isSupported, checkSubscription]);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications tidak didukung di browser ini');
      return;
    }

    if (!token) {
      setError('Anda harus login untuk mengaktifkan notifikasi');
      return;
    }

    // Rate limiting: maksimal 1 attempt per 5 detik
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptTime;
    if (timeSinceLastAttempt < 5000) {
      setError('Mohon tunggu 5 detik sebelum mencoba lagi.');
      return;
    }

    setLastAttemptTime(now);
    setLoading(true);
    setError(null);

    try {
      await PushNotificationService.subscribe(token || undefined);
      await checkSubscription();
      const newPermission = await PushNotificationService.getNotificationPermission();
      setPermission(newPermission);
    } catch (error: any) {
      // Handle error spesifik dengan pesan user-friendly
      let errorMessage = error.message;
      
      if (error.message.includes('Token')) {
        errorMessage = 'Gagal subscribe: Sesi login Anda telah berakhir. Silakan login kembali.';
      } else if (error.message.includes('izin') || error.message.includes('permission')) {
        errorMessage = 'Izin notifikasi dibukakan. Silakan izinkan notifikasi di browser Anda.';
      } else if (error.message.includes('VAPID')) {
        errorMessage = 'Konfigurasi notifikasi bermasalah. Silakan hubungi administrator.';
      } else if (error.message.includes('CORS') || error.message.includes('koneksi')) {
        errorMessage = 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isSupported, checkSubscription, token, lastAttemptTime]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications tidak didukung di browser ini');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await PushNotificationService.unsubscribe(token || undefined);
      await checkSubscription();
    } catch (error: any) {
      // Silent error untuk unsubscribe (tidak krusial)
      console.warn('Gagal unsubscribe:', error.message);
      setError(null); // Clear error untuk unsubscribe
    } finally {
      setLoading(false);
    }
  }, [isSupported, checkSubscription, token]);

  const toggle = useCallback(async () => {
    if (subscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  }, [subscribed, subscribe, unsubscribe]);

  const sendNotification = useCallback(async (data: PushNotificationData) => {
    try {
      await PushNotificationService.sendNotification(data);
    } catch (error: any) {
      setError(error.message);
    }
  }, []);

  const showLocalNotification = useCallback((data: PushNotificationData) => {
    try {
      PushNotificationService.showLocalNotification(data);
    } catch (error: any) {
      setError(error.message);
    }
  }, []);

  return {
    isSupported,
    subscribed,
    loading,
    permission,
    error,
    subscription,
    subscribe,
    unsubscribe,
    sendNotification,
    showLocalNotification,
    toggle
  };
};