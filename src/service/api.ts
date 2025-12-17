// ========================================
// 1. IMPORTS & CONFIGURATION

import { Kegiatan } from "@/utils/kegiatan";
import { data } from "react-router-dom";

// ========================================
const API_BASE_URL = "https://simjur-api.vercel.app/api";
// Configurable Object
const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
};
// ========================================
// 2. TYPE DEFINITIONS
// ========================================
export interface LoginRequest {
  name: string;
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
  roles_id: number;
  description: string;
  password: string;
}
export interface RegisterResponse {
  message: string;
  data: User[];
}
export interface User {
  id: number;
  name: string;
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
        throw new ApiError(error.message, 0, "NETWORK_ERROR");
      }

      throw new ApiError("Unknown error occurred", 0, "UNKNOWN");
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
   * POST /api/auth/login
   */
  login: async (name: string, password: string): Promise<LoginResponse> => {
    const loginData: LoginRequest = { name, password };
    return apiClient.post<LoginResponse>("/auth/login", loginData);
  },

  /**
   * User registration
   * POST /api/auth/register
   */
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    return apiClient.post<RegisterResponse>("/auth/register", userData);
  },
  /**
   * Get current user information
   * GET /api/user
   */
  getCurrentUser: async (token: string): Promise<User> => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    return apiClient.get<User>("/user", headers);
  },
  /**
   * Logout user (if API supports it)
   * POST /api/auth/logout
   */
  logout: async (token: string): Promise<void> => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    await apiClient.post<void>("/auth/logout", {}, headers);
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
// 8. Kegiatan API
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
