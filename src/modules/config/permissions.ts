// Permission definitions for SIMJUR application
export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

export const PERMISSIONS: Record<string, Permission> = {
  // Dashboard permissions
  view_dashboard: {
    id: 'view_dashboard',
    name: 'View Dashboard',
    description: 'Access to main dashboard',
    module: 'dashboard',
  },
  view_analytics: {
    id: 'view_analytics',
    name: 'View Analytics',
    description: 'Access to advanced analytics and charts',
    module: 'dashboard',
  },
  
  // Activity permissions
  create_activity: {
    id: 'create_activity',
    name: 'Create Activity',
    description: 'Create new TOR and LPJ activities',
    module: 'activity',
  },
  view_activities: {
    id: 'view_activities',
    name: 'View Activities',
    description: 'View activity lists and details',
    module: 'activity',
  },
  approve_activity: {
    id: 'approve_activity',
    name: 'Approve Activity',
    description: 'Approve or reject activities',
    module: 'activity',
  },
  manage_activities: {
    id: 'manage_activities',
    name: 'Manage Activities',
    description: 'Edit and delete activities',
    module: 'activity',
  },
  
  // Finance permissions
  view_finance: {
    id: 'view_finance',
    name: 'View Finance',
    description: 'View financial data and reports',
    module: 'finance',
  },
  manage_budget: {
    id: 'manage_budget',
    name: 'Manage Budget',
    description: 'Manage department budgets',
    module: 'finance',
  },
  view_reports: {
    id: 'view_reports',
    name: 'View Reports',
    description: 'Access financial reports',
    module: 'finance',
  },
  
  // User permissions
  view_profile: {
    id: 'view_profile',
    name: 'View Profile',
    description: 'View and edit own profile',
    module: 'user',
  },
  manage_users: {
    id: 'manage_users',
    name: 'Manage Users',
    description: 'Manage user accounts',
    module: 'user',
  },
  admin_users: {
    id: 'admin_users',
    name: 'Admin Users',
    description: 'Full user administration',
    module: 'user',
  },
  
  // System permissions
  system_settings: {
    id: 'system_settings',
    name: 'System Settings',
    description: 'Access system configuration',
    module: 'system',
  },
  system_logs: {
    id: 'system_logs',
    name: 'System Logs',
    description: 'View system logs and audits',
    module: 'system',
  },
};

export const getPermissionById = (permissionId: string): Permission | null => {
  return PERMISSIONS[permissionId] || null;
};

export const getPermissionsByModule = (moduleId: string): Permission[] => {
  return Object.values(PERMISSIONS).filter(p => p.module === moduleId);
};

export const getAllPermissions = (): Permission[] => {
  return Object.values(PERMISSIONS);
};