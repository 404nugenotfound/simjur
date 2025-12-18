# Implementasi Push Notification dengan Next-Push

## 📋 **Overview**

Sistem push notification telah diimplementasikan dengan mengikuti dokumentasi Next-Push dan menggunakan API endpoint `https://simjur-api.vercel.app/api/auth/push`.

## 🛠️ **Components yang Telah Dibuat**

### 1. **Service Worker** (`public/sw.js`)
- Handle incoming push notifications
- Manage notification clicks
- Support custom icons and URLs

### 2. **Push Notification Service** (`src/services/pushNotification.ts`)
- Service class untuk mengelola push notifications
- Subscribe/unsubscribe functionality
- Server communication via API

### 3. **React Hook** (`src/hooks/usePushNotification.ts`)
- Custom hook untuk React integration
- State management untuk subscription status
- Error handling dan permission management

### 4. **Push Component** (`src/components/PushNotificationComponent.tsx`)
- UI component untuk subscription management
- Test notification buttons
- Status indicators

### 5. **API Endpoints** (`src/service/api.ts`)
- `POST /auth/push/subscribe` - Subscribe ke notifications
- `POST /auth/push/unsubscribe` - Unsubscribe dari notifications  
- `POST /auth/push` - Kirim notification ke subscriber spesifik
- `POST /auth/push/broadcast` - Kirim ke semua subscribers

## 🔧 **Configuration**

### Environment Variables
```bash
# .env
REACT_APP_API_URL=https://simjur-api.vercel.app/api
REACT_APP_VAPID_PUBLIC_KEY=BA7d_E336oXi6fryJ5gxD7kyptwowh_TWIS36kwId8vcNXOJrtqLe07jhyp7128nv7b-2CX6pv36eP5NS-WGH4s
REACT_APP_ENV=development
REACT_APP_DEBUG=true
```

### VAPID Keys
```bash
# Public Key: BA7d_E336oXi6fryJ5gxD7kyptwowh_TWIS36kwId8vcNXOJrtqLe07jhyp7128nv7b-2CX6pv36eP5NS-WGH4s
# Private Key: A-DV6fPDkvfHFDAJMg5zjQig17qcxj3Jqw9xHjDDpuw
```

## 📱 **Usage Examples**

### Basic Component Usage
```typescript
import { usePushNotification } from '../hooks/usePushNotification';

function MyComponent() {
  const { 
    isSupported, 
    subscribed, 
    subscribe, 
    unsubscribe,
    sendNotification 
  } = usePushNotification();
  
  return (
    <div>
      {isSupported && (
        <button onClick={subscribed ? unsubscribe : subscribe}>
          {subscribed ? 'Unsubscribe' : 'Subscribe'}
        </button>
      )}
    </div>
  );
}
```

### Send Notification
```typescript
// Test notification
await sendNotification({
  title: 'Pengajuan Baru',
  message: 'Ada pengajuan kegiatan yang menunggu persetujuan',
  icon: '/favicon-32x32.png',
  url: '/pengajuan-kegiatan'
});
```

### Server-side Integration
```typescript
import { pushApi } from '../service/api';

// Kirim notifikasi ke user spesifik
await pushApi.send({
  title: 'Status Update',
  message: 'Pengajuan Anda telah disetujui',
  url: '/detail/123'
}, userToken);

// Broadcast ke semua users
await pushApi.broadcast({
  title: 'Pengumuman',
  message: 'Sistem akan maintenance malam ini',
  url: '/pengumuman'
}, adminToken);
```

## 🔄 **API Endpoints Detail**

### POST /auth/push/subscribe
```typescript
Request: {
  subscription: {
    endpoint: string,
    keys: {
      p256dh: string,
      auth: string
    }
  }
}

Response: {
  success: boolean,
  message: string
}
```

### POST /auth/push/unsubscribe
```typescript
Request: {
  endpoint: string
}

Response: {
  success: boolean,
  message: string
}
```

### POST /auth/push
```typescript
Request: {
  title: string,
  message: string,
  url?: string,
  icon?: string
}

Response: {
  success: boolean,
  message: string,
  sent: number
}
```

### POST /auth/push/broadcast
```typescript
Request: {
  title: string,
  message: string,
  url?: string,
  icon?: string
}

Response: {
  success: boolean,
  message: string,
  sent: number
}
```

## 🔍 **Testing**

### Test Notification Lokal
```typescript
import PushNotificationService from '../services/pushNotification';

PushNotificationService.showLocalNotification({
  title: 'Test Notification',
  message: 'Ini adalah test notification',
  icon: '/favicon-32x32.png',
  url: window.location.href
});
```

### Test Subscription
```typescript
const { subscribe, unsubscribe, subscribed } = usePushNotification();

// Subscribe
await subscribe(userToken);

// Unsubscribe  
await unsubscribe(userToken);
```

## 📋 **File Structure**

```
src/
├── components/
│   └── PushNotificationComponent.tsx
├── hooks/
│   └── usePushNotification.ts
├── services/
│   └── pushNotification.ts
├── service/
│   └── api.ts (updated with push endpoints)
└── .env (updated with VAPID keys)

public/
└── sw.js (service worker)
```

## ✅ **Features Implemented**

1. ✅ **VAPID Key Support** - Secure push notifications
2. ✅ **Service Worker Registration** - Background notification handling
3. ✅ **Permission Management** - Browser permission handling
4. ✅ **Subscription Management** - Subscribe/unsubscribe flow
5. ✅ **Server Integration** - API communication
6. ✅ **Error Handling** - Comprehensive error management
7. ✅ **TypeScript Support** - Full type safety
8. ✅ **React Integration** - Custom hooks and components
9. ✅ **Local Testing** - Development testing capabilities
10. ✅ **Broadcast Support** - Send to all subscribers

## 🚀 **Production Deployment**

Pastikan:
1. Service worker di-serve dari root domain
2. VAPID keys valid untuk production
3. CORS configuration di server
4. HTTPS requirement (mandatory untuk push notifications)

## 📝 **Notes**

- Push notifications hanya bekerja di HTTPS
- User harus memberikan permission terlebih dahulu
- Service worker harus terdaftar dengan benar
- Browser compatibility: Chrome, Firefox, Edge, Safari (limited)

Sistem push notification siap digunakan! 🎉