// Push Notification Service
import { pushApi } from '../service/api';

export interface MyPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationData {
  title: string;
  message: string;
  url?: string;
  icon?: string;
  badge?: string;
  data?: any;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private vapidPublicKey: string;

  constructor() {
    this.vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY || '';
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  // Check if push notifications are supported
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Register service worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!this.isSupported()) {
      throw new Error('Push notifications not supported');
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  // Get current subscription
  async getCurrentSubscription(): Promise<MyPushSubscription | null> {
    try {
      const registration = await this.registerServiceWorker();
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        return {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.getKey('p256dh') ? 
              btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('p256dh') as ArrayBuffer)))) : '',
            auth: subscription.getKey('auth') ? 
              btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('auth') as ArrayBuffer)))) : ''
          }
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  // Subscribe to push notifications
  async subscribe(token?: string): Promise<PushSubscription> {
    if (!this.isSupported()) {
      throw new Error('Push notifications not supported');
    }

    try {
      const registration = await this.registerServiceWorker();
      
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlB64ToUint8Array(this.vapidPublicKey)
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription, token);
      
      console.log('Push subscription successful:', subscription);
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(token?: string): Promise<void> {
    try {
      const subscription = await this.getCurrentSubscription();
      if (subscription) {
        // Get the actual PushSubscription to unsubscribe
        const registration = await this.registerServiceWorker();
        const actualSubscription = await registration.pushManager.getSubscription();
        
        if (actualSubscription) {
          await actualSubscription.unsubscribe();
          await this.removeSubscriptionFromServer(subscription, token);
          console.log('Push subscription removed');
        }
      }
    } catch (error) {
      console.error('Push unsubscribe failed:', error);
      throw error;
    }
  }

  // Send subscription to server
  private async sendSubscriptionToServer(subscription: PushSubscription, token?: string): Promise<void> {
    try {
      const mySub: MyPushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.getKey('p256dh') ? 
            btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('p256dh') as ArrayBuffer)))) : '',
          auth: subscription.getKey('auth') ? 
            btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('auth') as ArrayBuffer)))) : ''
        }
      };

      await pushApi.subscribe(mySub, token);
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      throw error;
    }
  }

  // Remove subscription from server
  private async removeSubscriptionFromServer(subscription: MyPushSubscription, token?: string): Promise<void> {
    try {
      await pushApi.unsubscribe(subscription.endpoint, token);
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
      throw error;
    }
  }

  // Send push notification via API
  async sendNotification(data: PushNotificationData, token?: string): Promise<void> {
    try {
      await pushApi.send(data, token);
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  // Broadcast notification to all subscribers
  async broadcastNotification(data: PushNotificationData, token: string): Promise<void> {
    try {
      await pushApi.broadcast(data, token);
    } catch (error) {
      console.error('Failed to broadcast notification:', error);
      throw error;
    }
  }

  // Convert URL base64 to Uint8Array for VAPID
  private urlB64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Check notification permission
  async getNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  }

  // Show local notification (for testing)
  showLocalNotification(data: PushNotificationData): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(data.title, {
        body: data.message,
        icon: data.icon || '/favicon-32x32.png',
        badge: data.badge || '/favicon-16x16.png',
        vibrate: [200, 100, 200],
        data: data.data
      });

      if (data.url) {
        notification.onclick = () => {
          window.open(data.url, '_blank');
          notification.close();
        };
      }
    }
  }
}

export default PushNotificationService.getInstance();