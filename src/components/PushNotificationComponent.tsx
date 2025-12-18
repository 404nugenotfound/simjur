import React, { useEffect } from 'react';
import { usePushNotification } from '../hooks/usePushNotification';
import { useAuth } from '../context/AuthContext';
import { BellIcon, BellSlashIcon } from '@heroicons/react/24/solid';

const PushNotificationComponent: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const {
    isSupported,
    subscribed,
    loading,
    permission,
    error,
    subscription,
    subscribe,
    unsubscribe,
    toggle,
    sendNotification,
    showLocalNotification
  } = usePushNotification(token);

  // Auto-subscribe when user logs in and hasn't subscribed yet
  useEffect(() => {
    if (isAuthenticated && isSupported && !subscribed && !loading && permission === 'default') {
      // Auto-request permission and subscribe
      subscribe().catch(() => {
        // Silently fail auto-subscription, let user manually trigger
      });
    }
  }, [isAuthenticated, isSupported, subscribed, loading, permission, subscribe]);

  const handleSubscribe = async () => {
    await subscribe();
  };

  const handleUnsubscribe = async () => {
    await unsubscribe();
  };

  const handleToggle = async () => {
    await toggle();
  };

  const handleTestNotification = () => {
    showLocalNotification({
      title: 'Notifikasi Test',
      message: 'Ini adalah notifikasi test dari Simjur',
      icon: '/favicon-32x32.png',
      url: window.location.href
    });
  };

  const handleSendNotification = async () => {
    try {
      await sendNotification({
        title: 'Pengajuan Kegiatan',
        message: 'Ada pengajuan kegiatan baru yang menunggu persetujuan',
        icon: '/favicon-32x32.png',
        url: '/pengajuan-kegiatan'
      });
    } catch (error) {
      console.error('Gagal mengirim notifikasi:', error);
    }
  };

  // Only show component if user is authenticated
  if (!isAuthenticated) {
    return null;
  }

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 text-yellow-800">
          <BellSlashIcon className="w-5 h-5" />
          <span className="font-medium">
            Browser ini tidak mendukung push notifications
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BellIcon className="w-5 h-5 text-blue-600" />
          Notifikasi Push
        </h3>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            subscribed 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {subscribed ? 'Aktif' : 'Non-aktif'}
          </span>
          {permission !== 'granted' && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Perlu Izin
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Subscription Controls */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">
              {subscribed ? 'Berlangganan Notifikasi' : 'Aktifkan Notifikasi'}
            </p>
            <p className="text-sm text-gray-600">
              {subscribed 
                ? 'Anda akan menerima notifikasi untuk update penting'
                : 'Aktifkan untuk menerima notifikasi kegiatan baru'
              }
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              subscribed
                ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-300'
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-300'
            } disabled:cursor-not-allowed`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Memproses...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {subscribed ? (
                  <>
                    <BellSlashIcon className="w-4 h-4" />
                    Berhenti
                  </>
                ) : (
                  <>
                    <BellIcon className="w-4 h-4" />
                    Aktifkan
                  </>
                )}
              </span>
            )}
          </button>
        </div>

        {/* Test Notifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleTestNotification}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <p className="font-medium text-gray-900 mb-1">Test Lokal</p>
            <p className="text-sm text-gray-600">Kirim notifikasi test lokal</p>
          </button>

          <button
            onClick={handleSendNotification}
            disabled={!subscribed}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <p className="font-medium text-gray-900 mb-1">Test Server</p>
            <p className="text-sm text-gray-600">Kirim via server API</p>
          </button>
        </div>

        {/* Permission Status */}
        <div className="border-t pt-4">
          <p className="text-sm text-gray-600">
            <strong>Status Permission:</strong>{' '}
            <span className={`font-medium ${
              permission === 'granted' ? 'text-green-600' : 
              permission === 'denied' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {permission === 'granted' ? 'Diizinkan' : 
               permission === 'denied' ? 'Ditolak' : 'Default'}
            </span>
          </p>
          {subscription && (
            <p className="text-sm text-gray-600 mt-1">
              <strong>Endpoint:</strong>{' '}
              <span className="text-xs text-gray-500 break-all">
                {subscription.endpoint.substring(0, 50)}...
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PushNotificationComponent;