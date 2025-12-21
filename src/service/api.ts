// ========================================
// 1. IMPORTS & CONFIGURATION

import { Kegiatan } from "@/utils/kegiatan";

// ========================================
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://simjur-api.vercel.app/api";
// Configurable Object
const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// CORS SETUP
//

// ========================================
// 2. TYPE DEFINITIONS
// ========================================
export interface LoginRequest {
  identifier: string;
  password: string;
}
export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    roles_id: number;
  };
}
export interface RegisterRequest {
  name: string;
  email: string;
  nim: string;
  program_studi: string;
  roles_id: number;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}
export interface User {
  id: number;
  name: string;
  email?: string;
  nim?: string;
  roles_id: number;
  description?: string;
  password?: string;
  updated_at?: string;
}
export interface ApiErrorResponse {
  error: string;
  message: string;
  code?: string;
}
// ========================================
// 3. ERROR HANDLING
// ========================================
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
// ========================================
// 4. API CLIENT CLASS
// ========================================
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  constructor(config: typeof apiConfig) {
    this.baseURL = config.baseURL;
    this.defaultHeaders = config.headers;
    this.timeout = config.timeout;
    
    // Log API configuration for debugging
    if (process.env.REACT_APP_DEBUG === 'true') {
      console.log('🔧 API Configuration:', {
        baseURL: this.baseURL,
        mode: process.env.REACT_APP_ENV || 'unknown',
        timeout: this.timeout
      });
    }
  }
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    // Setup headers
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    };
    // Setup abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
        mode: "cors",
        credentials: "same-origin",
        cache: "no-cache",
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json().catch(() => ({
          error: "Unknown Error",
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));

        throw new ApiError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData.code,
        );
      }

      // Parse successful response
      const data = await response.json();
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle network errors
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new ApiError("Request timeout", 408, "TIMEOUT");
        }

        // Enhanced CORS error handling
        if (
          error.message.includes("CORS") ||
          error.message.includes("Cross-Origin") ||
          error.message.includes("Failed to fetch")
        ) {
          throw new ApiError(
            "CORS Error: Tidak dapat mengakses API. Pastikan CORS sudah di konfigurasi dengan benar di server.",
            0,
            "CORS_ERROR",
          );
        }

        throw new ApiError(error.message, 0, "NETWORK_ERROR");
      }

      throw new ApiError("Unknown error occurred", 0, "UNKNOWN");
    }
  }

  // Utility method for debugging API connectivity
  public async testConnection(): Promise<{
    success: boolean;
    url: string;
    message: string;
  }> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: "OPTIONS",
        mode: "cors",
        headers: {
          Origin: window.location.origin,
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type",
        },
      });

      return {
        success: response.ok || response.status === 204,
        url: this.baseURL,
        message: response.ok
          ? "CORS OK"
          : `HTTP ${response.status}: ${response.statusText}`,
      };
    } catch (error: any) {
      return {
        success: false,
        url: this.baseURL,
        message: error.message || "Connection failed",
      };
    }
  }

  // HTTP method helpers
  public async get<T>(
    endpoint: string,
    headers?: Record<string, string>,
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", headers });
  }
  public async post<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  

  public async put<T>(
    endpoint: string,
    data?: any,
    headers?: Record<string, string>,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  public async delete<T>(
    endpoint: string,
    headers?: Record<string, string>,
  ): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE", headers });
  }
}
// ========================================
// 5. API CLIENT INSTANCE
// ========================================
const apiClient = new ApiClient(apiConfig);
// ========================================

// 6. AUTHENTICATION API
// ========================================
export const authApi = {
  /* -=== [ Validate Token ] ===- */
  validateToken: async (token: string): Promise<Boolean> => {
    try {
      await authApi.getCurrentUser(token);
      return true;
    } catch {
      return false;
    }
  },

  // Refresh token :
  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>("/auth/refresh", {
      refreshToken,
    });
  },

  /**
   * User login
   * POST /auth/login
   */
  login: async (
    identifier: string,
    password: string,
  ): Promise<LoginResponse> => {
    const loginData: LoginRequest = { identifier, password };
    return apiClient.post<LoginResponse>("/auth/login", loginData);
  },

  /**
   * User registration
   * POST /auth/register
   */
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    return apiClient.post<RegisterResponse>("/auth/register", userData);
  },
  /**
   * Get current user information
   * GET /user
   */
  getCurrentUser: async (token: string): Promise<User> => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return apiClient.get<User>("/user", headers);
  },
  /**
   * Logout user (if API supports it)
   * POST /auth/logout
   * Note: Endpoint mungkin tidak ada, implementasi graceful fallback
   */
  logout: async (token: string): Promise<void> => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    
    try {
      await apiClient.post<void>("/auth/logout", {}, headers);
      console.log('✅ Server logout successful');
    } catch (error: any) {
      // Log error tapi jangan throw karena logout tidak critical
      console.warn('Logout API call failed, proceeding with local logout:', error.message);
      
      // Jika 405 (Method Not Allowed), 404 (Not Found), atau CORS error, anggap sebagai normal
      if (error.status === 405 || error.status === 404 || error.code === 'CORS_ERROR') {
        console.info('Logout endpoint tidak tersedia atau CORS error, proceeding with local logout only');
        return;
      }
      
      // Untuk error lain yang critical, tetap throw
      if (error.status >= 500) {
        console.error('Server error during logout, proceeding with local logout:', error);
        return;
      }
      
      throw error;
    }
  },

  /**
   * Local logout fallback (tanpa API call)
   */
  localLogout: (): void => {
    console.log('🔄 Performing local logout only');
  },
};
// ========================================
// 7. GENERAL API (for future use)
// ========================================
export const generalApi = {
  /**
   * Make authenticated GET request
   */
  getAuthenticated: async <T>(endpoint: string, token: string): Promise<T> => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return apiClient.get<T>(endpoint, headers);
  },
  /**
   * Make authenticated POST request
   */
  postAuthenticated: async <T>(
    endpoint: string,
    data: any,
    token: string,
  ): Promise<T> => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return apiClient.post<T>(endpoint, data, headers);
  },
  /**
   * Make authenticated PUT request
   */
  putAuthenticated: async <T>(
    endpoint: string,
    data: any,
    token: string,
  ): Promise<T> => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return apiClient.put<T>(endpoint, data, headers);
  },
  /**
   * Make authenticated DELETE request
   */
  deleteAuthenticated: async <T>(
    endpoint: string,
    token: string,
  ): Promise<T> => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return apiClient.delete<T>(endpoint, headers);
  },
};

// ========================================
// 8. Push Notification API
// ========================================
export const pushApi = {
  /**
   * Subscribe to push notifications
   * POST /auth/push/subscribe
   */
  subscribe: async (
    subscription: any,
    token?: string,
  ): Promise<{ success: boolean; message: string }> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    return apiClient.post("/auth/push/subscribe", { subscription }, headers);
  },

  /**
   * Unsubscribe from push notifications
   * POST /auth/push/unsubscribe
   */
  unsubscribe: async (
    endpoint: string,
    token?: string,
  ): Promise<{ success: boolean; message: string }> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    return apiClient.post("/auth/push/unsubscribe", { endpoint }, headers);
  },

  /**
   * Send push notification
   * POST /auth/push
   */
  send: async (
    notification: {
      title: string;
      message: string;
      url?: string;
      icon?: string;
    },
    token?: string,
  ): Promise<{ success: boolean; message: string; sent: number }> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    return apiClient.post("/auth/push", notification, headers);
  },

  /**
   * Broadcast to all subscribers
   * POST /auth/push/broadcast
   */
  broadcast: async (
    notification: {
      title: string;
      message: string;
      url?: string;
      icon?: string;
    },
    token: string,
  ): Promise<{ success: boolean; message: string; sent: number }> => {
    const headers = { Authorization: `Bearer ${token}` };
    return apiClient.post("/auth/push/broadcast", notification, headers);
  },
};

// ========================================
// 9. Kegiatan API
// ========================================
export const kegiatanApi = {
  getAll: async (token: string): Promise<Kegiatan[]> => {
    return generalApi.getAuthenticated<Kegiatan[]>("/kegiatan", token);
  },

  create: async (data: Partial<Kegiatan>, token: string): Promise<Kegiatan> => {
    return generalApi.postAuthenticated<Kegiatan>("/kegiatan", data, token);
  },

  update: async (
    id: string | number,
    data: Partial<Kegiatan>,
    token: string,
  ): Promise<Kegiatan> => {
    return generalApi.putAuthenticated(`/kegiatan/${id}`, data, token);
  },

  delete: async (id: string | number, token: string): Promise<void> => {
    return generalApi.deleteAuthenticated(`/kegiatan/${id}`, token);
  },
};

// ========================================
// 8. EXPORTS
// ========================================
export default apiClient;
export { API_BASE_URL };

// ========================================
// 8.1. API CONNECTION TEST EXPORT
// ========================================
export const testApiConnection = async () => {
  return await apiClient.testConnection();
};
