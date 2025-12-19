// Enhanced Push Notification Service
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
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface BrowserSupport {
  serviceWorker: boolean;
  pushManager: boolean;
  notification: boolean;
  showNotification: boolean;
  vibrate: boolean;
  clients: boolean;
}

export class PushNotificationService {
  private static instance: PushNotificationService;
  private vapidPublicKey: string;
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY || '';
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  // Check browser compatibility
  isSupported(): boolean {
    const support = {
      serviceWorker: 'serviceWorker' in navigator,
      pushManager: 'PushManager' in window,
      notification: 'Notification' in window,
      showNotification: 'showNotification' in Notification,
      vibrate: 'vibrate' in navigator,
      clients: false // This is only available in service worker context
    };

    return support.serviceWorker && support.pushManager && support.notification;
  }

  // Register service worker with minimal debugging
  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!this.isSupported()) {
      throw new Error('Push notifications not supported in this browser');
    }

    try {
      // Check existing registration
      const existingRegistration = await navigator.serviceWorker.getRegistration('/sw.js');
      if (existingRegistration) {
        if (existingRegistration.active) {
          this.registration = existingRegistration;
          return existingRegistration;
        } else if (existingRegistration.installing) {
          return new Promise((resolve) => {
            existingRegistration.addEventListener('controllerchange', () => {
              this.registration = existingRegistration;
              resolve(existingRegistration);
            });
          });
        }
      }

      // Register new service worker
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      this.registration = registration;

      // Wait for activation if needed
      if (registration.installing) {
        return new Promise((resolve) => {
          registration.addEventListener('controllerchange', () => {
            this.registration = registration;
            resolve(registration);
          });
        });
      }

      return registration;

    } catch (error: any) {
      console.error('Service worker registration failed:', error);
      throw new Error(`Service worker registration failed: ${error.message}`);
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
            p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
            auth: this.arrayBufferToBase64(subscription.getKey('auth'))
          }
        };
      }
      
      return null;
      
    } catch (error: any) {
      return null;
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    const currentPermission = Notification.permission;

    if (currentPermission !== 'default') {
      return currentPermission;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      return 'denied';
    }
  }

  // Subscribe to push notifications
  async subscribe(token?: string): Promise<PushSubscription> {
    if (!this.isSupported()) {
      throw new Error('Push notifications tidak didukung di browser ini');
    }

    // Validate token sebelum melanjutkan
    if (!token) {
      throw new Error('Token autentikasi diperlukan untuk subscribe push notifications');
    }

    try {
      const registration = await this.registerServiceWorker();
      const permission = await this.requestPermission();
      
      if (permission !== 'granted') {
        throw new Error(`Izin notifikasi ditolak: ${permission}`);
      }

      // Validasi VAPID key
      if (!this.testVapidKey()) {
        throw new Error('Kunci VAPID tidak valid. Hubungi administrator.');
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlB64ToUint8Array(this.vapidPublicKey)
      });

      // Send subscription to server dengan validasi token
      await this.sendSubscriptionToServer(subscription, token);
      
      return subscription;
      
    } catch (error: any) {
      // Handle error spesifik
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        throw new Error('Gagal subscribe: Token tidak valid. Silakan login kembali.');
      }
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        throw new Error('Gagal subscribe: Anda tidak memiliki izin untuk fitur ini.');
      }
      if (error.message.includes('CORS')) {
        throw new Error('Gagal koneksi ke server. Periksa jaringan Anda atau coba lagi nanti.');
      }
      
      throw new Error(`Gagal subscribe: ${error.message}`);
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(token?: string): Promise<void> {
    try {
      const subscription = await this.getCurrentSubscription();
      if (!subscription) {
        return;
      }

      // Get actual PushSubscription to call unsubscribe
      const registration = await this.registerServiceWorker();
      const actualSubscription = await registration.pushManager.getSubscription();
      
      if (actualSubscription) {
        await actualSubscription.unsubscribe();
        
        // Remove from server jika token tersedia
        if (token) {
          await this.removeSubscriptionFromServer(subscription, token);
        }
      }
      
    } catch (error: any) {
      // Handle error spesifik untuk unsubscribe
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        // Silent fail untuk unsubscribe jika token invalid
        return;
      }
      if (error.message.includes('CORS')) {
        // Silent fail untuk CORS error
        return;
      }
      
      throw new Error(`Gagal unsubscribe: ${error.message}`);
    }
  }

  // Send subscription to server
  private async sendSubscriptionToServer(subscription: PushSubscription, token?: string): Promise<void> {
    try {
      const mySub: MyPushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: this.arrayBufferToBase64(subscription.getKey('auth'))
        }
      };

      await pushApi.subscribe(mySub, token);
      
    } catch (error) {
      throw error;
    }
  }

  // Remove subscription from server
  private async removeSubscriptionFromServer(subscription: MyPushSubscription, token?: string): Promise<void> {
    try {
      await pushApi.unsubscribe(subscription.endpoint, token);
      
    } catch (error) {
      throw error;
    }
  }

  // Send push notification via API
  async sendNotification(data: PushNotificationData, token?: string): Promise<void> {
    try {
      await pushApi.send(data, token);
      
    } catch (error) {
      throw error;
    }
  }

  // Broadcast notification to all subscribers
  async broadcastNotification(data: PushNotificationData, token: string): Promise<void> {
    try {
      await pushApi.broadcast(data, token);
      
    } catch (error) {
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

  // Convert ArrayBuffer to Base64
  private arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return '';
    
    try {
      const bytes = Array.from(new Uint8Array(buffer));
      const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
      return btoa(binary);
    } catch (error) {
      console.error('❌ Failed to convert ArrayBuffer to Base64:', error);
      return '';
    }
  }

  // Check current notification permission
  async getNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  }

  // Show local notification (for testing)
  showLocalNotification(data: PushNotificationData): void {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(data.title, {
          body: data.message,
          icon: data.icon || '/favicon-32x32.png',
          badge: data.badge || '/favicon-16x16.png',
          vibrate: [200, 100, 200],
          tag: data.tag || 'simjur-local',
          requireInteraction: data.requireInteraction || false,
          silent: data.silent || false,
          data: {
            url: data.url || '/',
            timestamp: Date.now(),
            source: 'simjur-local',
            ...data.data
          }
        });

        if (data.url) {
          notification.onclick = () => {
            window.open(data.url, '_blank');
            notification.close();
          };
        }

        // Auto close after 5 seconds if not persistent
        if (!data.requireInteraction) {
          setTimeout(() => {
            if (notification.close) {
              notification.close();
            }
          }, 5000);
        }
      }
    } catch (error) {
      // Silent fail for local notifications
    }
  }

  // Test browser support
  checkBrowserSupport(): BrowserSupport {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      pushManager: 'PushManager' in window,
      notification: 'Notification' in window,
      showNotification: 'showNotification' in Notification,
      vibrate: 'vibrate' in navigator,
      clients: false // This is only available in service worker context
    };
  }

  // Test VAPID key configuration
  testVapidKey(): boolean {
    try {
      const key = this.vapidPublicKey;
      if (!key || key.length < 50) {
        console.error('❌ VAPID key tidak valid atau terlalu pendek');
        return false;
      }

      // Valid format: harus diawali dengan 'B' atau 'M' untuk URL-safe base64
      if (!key.startsWith('B') && !key.startsWith('M')) {
        console.error('❌ Format VAPID key tidak valid');
        return false;
      }

      const decoded = this.urlB64ToUint8Array(key);
      const isValid = decoded.length > 0;
      
      if (!isValid) {
        console.error('❌ Gagal decode VAPID key');
      }
      
      return isValid;
      
    } catch (error) {
      console.error('❌ Error saat validasi VAPID key:', error);
      return false;
    }
  }

  // Reset service worker (for debugging)
  async resetServiceWorker(): Promise<void> {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
      
    } catch (error) {
      throw error;
    }
  }
}

export default PushNotificationService.getInstance();