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
    console.log('🔑 VAPID Public Key configured:', this.vapidPublicKey.substring(0, 20) + '...');
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

    console.log('🌐 Browser Support:', support);
    return support.serviceWorker && support.pushManager && support.notification;
  }

  // Register service worker with enhanced debugging
  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!this.isSupported()) {
      throw new Error('Push notifications not supported in this browser');
    }

    console.log('🔧 Registering service worker...');

    try {
      // Check existing registration
      const existingRegistration = await navigator.serviceWorker.getRegistration('/sw.js');
      if (existingRegistration) {
        console.log('✅ Service worker already registered:', existingRegistration.scope);
        
        if (existingRegistration.active) {
          console.log('🚀 Service worker is active');
          this.registration = existingRegistration;
          return existingRegistration;
        } else if (existingRegistration.installing) {
          console.log('⏳ Service worker is installing...');
          return new Promise((resolve) => {
            existingRegistration.addEventListener('controllerchange', () => {
              console.log('🚀 Service worker activated');
              this.registration = existingRegistration;
              resolve(existingRegistration);
            });
          });
        }
      }

      // Register new service worker
      console.log('📝 Registering new service worker...');
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✅ Service worker registered successfully:', {
        scope: registration.scope,
        installing: !!registration.installing,
        active: !!registration.active,
        state: registration.active?.state
      });

      this.registration = registration;

      // Wait for activation if needed
      if (registration.installing) {
        console.log('⏳ Waiting for service worker activation...');
        return new Promise((resolve) => {
          registration.addEventListener('controllerchange', () => {
            console.log('🚀 Service worker activated');
            this.registration = registration;
            resolve(registration);
          });
        });
      }

      return registration;

    } catch (error: any) {
      console.error('❌ Service worker registration failed:', error);
      throw new Error(`Service worker registration failed: ${error.message}`);
    }
  }

  // Get current subscription with enhanced debugging
  async getCurrentSubscription(): Promise<MyPushSubscription | null> {
    try {
      console.log('🔍 Checking current subscription...');
      
      const registration = await this.registerServiceWorker();
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        console.log('📋 Found existing subscription:', {
          endpoint: subscription.endpoint.substring(0, 50) + '...',
          keys: '*****'
        });

        return {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
            auth: this.arrayBufferToBase64(subscription.getKey('auth'))
          }
        };
      }
      
      console.log('ℹ️ No existing subscription found');
      return null;
      
    } catch (error: any) {
      console.error('❌ Error getting subscription:', error);
      return null;
    }
  }

  // Request notification permission with enhanced debugging
  async requestPermission(): Promise<NotificationPermission> {
    console.log('🔐 Requesting notification permission...');

    if (!('Notification' in window)) {
      console.warn('⚠️ Notification API not available');
      return 'denied';
    }

    const currentPermission = Notification.permission;
    console.log('📋 Current permission:', currentPermission);

    if (currentPermission !== 'default') {
      console.log('✅ Permission already set:', currentPermission);
      return currentPermission;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('🔐 Permission request result:', permission);
      
      // Log user choice
      if (permission === 'granted') {
        console.log('✅ User granted notification permission');
      } else if (permission === 'denied') {
        console.log('❌ User denied notification permission');
      }
      
      return permission;
    } catch (error) {
      console.error('❌ Permission request failed:', error);
      return 'denied';
    }
  }

  // Subscribe to push notifications with comprehensive error handling
  async subscribe(token?: string): Promise<PushSubscription> {
    console.log('📱 Starting push subscription process...');

    if (!this.isSupported()) {
      throw new Error('Push notifications not supported in this browser');
    }

    try {
      const registration = await this.registerServiceWorker();
      const permission = await this.requestPermission();
      
      if (permission !== 'granted') {
        throw new Error(`Notification permission denied: ${permission}`);
      }

      console.log('🔑 Creating subscription with VAPID...');
      console.log('🔑 Using VAPID key:', this.vapidPublicKey.substring(0, 20) + '...');

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlB64ToUint8Array(this.vapidPublicKey)
      });

      console.log('✅ Push subscription created successfully:', {
        endpoint: subscription.endpoint.substring(0, 50) + '...',
        keys: '*****'
      });

      // Send subscription to server with retry logic
      await this.sendSubscriptionToServer(subscription, token);
      
      console.log('✅ Push subscription process completed successfully');
      return subscription;
      
    } catch (error: any) {
      console.error('❌ Push subscription failed:', error);
      throw new Error(`Push subscription failed: ${error.message}`);
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(token?: string): Promise<void> {
    console.log('📤 Starting unsubscribe process...');

    try {
      const subscription = await this.getCurrentSubscription();
      if (!subscription) {
        console.log('ℹ️ No subscription to unsubscribe');
        return;
      }

      console.log('📤 Unsubscribing:', subscription.endpoint.substring(0, 50) + '...');

      // Get actual PushSubscription to call unsubscribe
      const registration = await this.registerServiceWorker();
      const actualSubscription = await registration.pushManager.getSubscription();
      
      if (actualSubscription) {
        await actualSubscription.unsubscribe();
        console.log('✅ Unsubscribed successfully');
        
        // Remove from server
        await this.removeSubscriptionFromServer(subscription, token);
        console.log('✅ Subscription removed from server');
      }
      
    } catch (error: any) {
      console.error('❌ Push unsubscribe failed:', error);
      throw new Error(`Push unsubscribe failed: ${error.message}`);
    }
  }

  // Send subscription to server with enhanced error handling
  private async sendSubscriptionToServer(subscription: PushSubscription, token?: string): Promise<void> {
    console.log('📤 Sending subscription to server...');

    try {
      const mySub: MyPushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: this.arrayBufferToBase64(subscription.getKey('auth'))
        }
      };

      console.log('📤 Subscription data being sent:', {
        endpoint: mySub.endpoint.substring(0, 50) + '...',
        hasP256dh: !!mySub.keys.p256dh,
        hasAuth: !!mySub.keys.auth,
        hasToken: !!token
      });

      const result = await pushApi.subscribe(mySub, token);
      console.log('✅ Subscription saved to server:', result);
      
    } catch (error) {
      console.error('❌ Failed to send subscription to server:', error);
      throw error;
    }
  }

  // Remove subscription from server
  private async removeSubscriptionFromServer(subscription: MyPushSubscription, token?: string): Promise<void> {
    console.log('🗑️ Removing subscription from server...');

    try {
      const result = await pushApi.unsubscribe(subscription.endpoint, token);
      console.log('✅ Subscription removed from server:', result);
      
    } catch (error) {
      console.error('❌ Failed to remove subscription from server:', error);
      throw error;
    }
  }

  // Send push notification via API
  async sendNotification(data: PushNotificationData, token?: string): Promise<void> {
    console.log('📤 Sending push notification:', data.title);

    try {
      const result = await pushApi.send(data, token);
      console.log('✅ Push notification sent successfully:', result);
      
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
      throw error;
    }
  }

  // Broadcast notification to all subscribers
  async broadcastNotification(data: PushNotificationData, token: string): Promise<void> {
    console.log('📡 Broadcasting push notification to all users');

    try {
      const result = await pushApi.broadcast(data, token);
      console.log('✅ Broadcast notification sent successfully:', result);
      
    } catch (error) {
      console.error('❌ Failed to broadcast notification:', error);
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
    console.log('🔔 Showing local notification:', data.title);

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

        console.log('✅ Local notification shown successfully');

        if (data.url) {
          notification.onclick = () => {
            console.log('🖱️ Local notification clicked, opening:', data.url);
            window.open(data.url, '_blank');
            notification.close();
          };
        }

        // Auto close after 5 seconds if not persistent
        if (!data.requireInteraction) {
          setTimeout(() => {
            if (notification.close) {
              notification.close();
              console.log('🔕 Local notification auto-closed');
            }
          }, 5000);
        }
      } else {
        console.warn('⚠️ Cannot show notification - permission not granted');
      }
    } catch (error) {
      console.error('❌ Failed to show local notification:', error);
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
      if (!key) {
        console.error('❌ VAPID key not configured');
        return false;
      }

      const decoded = this.urlB64ToUint8Array(key);
      console.log('✅ VAPID key valid:', decoded.length, 'bytes');
      return decoded.length > 0;
      
    } catch (error) {
      console.error('❌ Invalid VAPID key:', error);
      return false;
    }
  }

  // Reset service worker (for debugging)
  async resetServiceWorker(): Promise<void> {
    console.log('🔄 Resetting service worker...');

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
      console.log('✅ All service workers unregistered');
      
    } catch (error) {
      console.error('❌ Failed to reset service worker:', error);
      throw error;
    }
  }
}

export default PushNotificationService.getInstance();