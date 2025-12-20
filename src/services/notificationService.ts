// Notification service untuk approval workflow
// DashboardContext tidak diperlukan untuk notification service

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  roles?: number[]; // Target role IDs
  userId?: string; // Target specific user
  read: boolean;
  data?: any; // Additional data (activity_id, etc.)
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];

  // Get all notifications
  getNotifications(): Notification[] {
    return this.notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Get notifications for specific role
  getNotificationsByRole(roleId: number): Notification[] {
    return this.notifications.filter(notification => 
      !notification.roles || notification.roles.includes(roleId)
    );
  }

  // Get unread notifications count
  getUnreadCount(roleId: number): number {
    return this.notifications.filter(notification => 
      (!notification.roles || notification.roles.includes(roleId)) && !notification.read
    ).length;
  }

  // Add new notification
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    this.notifications.unshift(newNotification);
    this.notifyListeners();
  }

  // Mark notifications as read for specific role
  markAsRead(roleId: number): void {
    this.notifications.forEach(notification => {
      if (!notification.roles || notification.roles.includes(roleId)) {
        notification.read = true;
      }
    });
    this.notifyListeners();
  }

  // Mark specific notification as read
  markNotificationAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  // Subscribe to notification changes
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.notifications);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getNotifications()));
  }
}

// Global notification service instance
export const notificationService = new NotificationService();

// Workflow notification functions
export const createActivityNotification = (
  activityTitle: string, 
  activityType: 'TOR' | 'LPJ',
  submitterName: string
) => {
  notificationService.addNotification({
    title: 'Pengajuan Baru',
    message: `${submitterName} mengajukan ${activityType}: ${activityTitle}`,
    type: 'info',
    roles: [1, 2, 4], // Admin, Administrasi, Sekretaris
    data: { type: 'new_activity', activityType }
  });
};

export const createApprovalNotification = (
  activityTitle: string,
  activityType: 'TOR' | 'LPJ',
  approverName: string,
  approvalLevel: number,
  status: 'approved' | 'rejected'
) => {
  const statusText = status === 'approved' ? 'disetujui' : 'ditolak';
  
  if (approvalLevel === 2) {
    // Level 2 approval -> notify Ketua Jurusan (5)
    notificationService.addNotification({
      title: `Status ${activityType} Update`,
      message: `${activityTitle} telah ${statusText} oleh ${approverName}. Menunggu approval Ketua Jurusan.`,
      type: status === 'approved' ? 'success' : 'warning',
      roles: [5], // Ketua Jurusan
      data: { type: 'level_2_approval', activityType, status }
    });
  } else if (approvalLevel === 3) {
    // Final approval -> process complete
    notificationService.addNotification({
      title: `${activityType} Disetujui!`,
      message: `${activityTitle} telah disetujui final oleh ${approverName}. Proses selesai.`,
      type: 'success',
      roles: [1, 2, 3, 4, 5], // All roles
      data: { type: 'final_approval', activityType, status }
    });
  }
};

export const createRejectionNotification = (
  activityTitle: string,
  activityType: 'TOR' | 'LPJ',
  approverName: string,
  rejectionLevel: number
) => {
  notificationService.addNotification({
    title: `Pengajuan Ditolak`,
    message: `${activityTitle} ditolak oleh ${approverName} pada level ${rejectionLevel}.`,
    type: 'error',
    roles: [1, 2, 3, 4, 5], // All roles
    data: { type: 'rejection', activityType, level: rejectionLevel }
  });
};

export default notificationService;