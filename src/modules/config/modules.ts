// Module definitions for SIMJUR application
export interface Module {
  id: string;
  name: string;
  description: string;
  icon?: string;
  routes: string[];
  permissions: string[];
}

export const MODULES: Record<string, Module> = {
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Main dashboard with statistics and analytics',
    routes: ['/dashboard'],
    permissions: ['view_dashboard', 'view_analytics'],
  },
  
  activity: {
    id: 'activity',
    name: 'Activity Management',
    description: 'TOR and LPJ activity management',
    routes: ['/pengajuan', '/daftar', '/daftar-LPJ', '/detail/:id'],
    permissions: ['create_activity', 'view_activities', 'approve_activity', 'manage_activities'],
  },
  
  finance: {
    id: 'finance',
    name: 'Financial Management',
    description: 'Budget management and financial reports',
    routes: ['/Input'],
    permissions: ['view_finance', 'manage_budget', 'view_reports'],
  },
  
  user: {
    id: 'user',
    name: 'User Management',
    description: 'User profiles and administration',
    routes: ['/profile'],
    permissions: ['view_profile', 'manage_users', 'admin_users'],
  },
  
  system: {
    id: 'system',
    name: 'System Administration',
    description: 'System settings and administration',
    routes: [],
    permissions: ['system_settings', 'system_logs'],
  },
};

export const getModuleById = (moduleId: string): Module | null => {
  return MODULES[moduleId] || null;
};

export const getModuleByRoute = (route: string): Module | null => {
  // Handle dynamic routes (e.g., /detail/:id)
  const normalizedRoute = route.replace(/\/\d+/, '/:id');
  
  for (const module of Object.values(MODULES)) {
    if (module.routes.includes(normalizedRoute) || module.routes.includes(route)) {
      return module;
    }
  }
  
  return null;
};

export const getAllModules = (): Module[] => {
  return Object.values(MODULES);
};