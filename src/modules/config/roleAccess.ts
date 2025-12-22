// Role-to-permission mapping for SIMJUR application
import { Role } from '../../utils/role';

export interface RolePermission {
  role: Role;
  permissions: string[];
}

// Role permission mapping berdasarkan kebutuhan yang ditentukan
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: [
    // Dashboard
    'view_dashboard',
    'view_analytics',
    
    // Activity
    'create_activity',
    'view_activities',
    'approve_activity',
    'manage_activities',
    
    // Finance - Full access
    'view_finance',
    'manage_budget',
    'view_reports',
    
    // User
    'view_profile',
    'manage_users',
    'admin_users',
    
    // System
    'system_settings',
    'system_logs',
  ],
  
  administrasi: [
    // Dashboard
    'view_dashboard',
    'view_analytics',
    
    // Activity - Cek konten & approve level 1
    'view_activities',
    'approve_activity',
    
    // Finance - Akses penuh budget
    'view_finance',
    'manage_budget',
    'view_reports',
    
    // User
    'view_profile',
  ],
  
  pengaju: [
    // Dashboard
    'view_dashboard',
    
    // Activity - Bisa mengajukan TOR/LPJ
    'create_activity',
    'view_activities',
    
    // User
    'view_profile',
  ],
  
  sekretaris: [
    // Dashboard
    'view_dashboard',
    'view_analytics',
    
    // Activity - Cek pengajuan dana & approve level 2
    'view_activities',
    'approve_activity',
    
    // User
    'view_profile',
  ],
  
  ketua_jurusan: [
    // Dashboard
    'view_dashboard',
    'view_analytics',
    
    // Activity - Approve level 3 (final approval)
    'view_activities',
    'approve_activity',
    
    // Finance - View only
    'view_finance',
    'view_reports',
    
    // User
    'view_profile',
  ],
};

export const getPermissionsByRole = (role: Role): string[] => {
  return ROLE_PERMISSIONS[role] || [];
};

export const hasPermission = (role: Role, permission: string): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[role];
  return rolePermissions.includes(permission);
};

export const hasAnyPermission = (role: Role, permissions: string[]): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[role];
  return permissions.some(permission => rolePermissions.includes(permission));
};

export const hasAllPermissions = (role: Role, permissions: string[]): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[role];
  return permissions.every(permission => rolePermissions.includes(permission));
};

export const canAccessModule = (role: Role, moduleId: string): boolean => {
  // Check if role has any permission for the module
  switch (moduleId) {
    case 'dashboard':
      return hasAnyPermission(role, ['view_dashboard', 'view_analytics']);
    case 'activity':
      return hasAnyPermission(role, ['create_activity', 'view_activities', 'approve_activity', 'manage_activities']);
    case 'finance':
      return hasAnyPermission(role, ['view_finance', 'manage_budget', 'view_reports']);
    case 'user':
      return hasAnyPermission(role, ['view_profile', 'manage_users', 'admin_users']);
    case 'system':
      return hasAnyPermission(role, ['system_settings', 'system_logs']);
    default:
      return false;
  }
};

export const getAccessibleModules = (role: Role): string[] => {
  const modules = ['dashboard', 'activity', 'finance', 'user', 'system'];
  return modules.filter(moduleId => canAccessModule(role, moduleId));
};