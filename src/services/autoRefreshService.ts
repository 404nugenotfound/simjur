// Auto refresh service untuk token management
import { TokenManager } from '../utils/tokenManager';
import { authApi } from '../service/api';

export class AutoRefreshService {
  private refreshInterval: NodeJS.Timeout | null = null;
  private isRefreshing = false;
  private refreshRetries = 0;
  private maxRetries = 3;

  // Auto refresh token jika hampir expired
  startAutoRefresh = (): void => {
    // Bersihkan existing interval
    this.stopAutoRefresh();

    this.refreshInterval = setInterval(() => {
      const token = TokenManager.getToken();
      
      if (!token || this.isRefreshing) return;

      // Cek apakah token perlu di-refresh
      if (this.shouldRefreshToken()) {
        this.performTokenRefresh();
      }
    }, 60000); // Check tiap 1 menit
  };

  // Stop auto refresh
  stopAutoRefresh = (): void => {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    this.isRefreshing = false;
    this.refreshRetries = 0;
  };

  // Check if token needs refresh
  private shouldRefreshToken = (): boolean => {
    const token = TokenManager.getToken();
    if (!token) return false;
    
    // Check if token is expired or will expire in next 5 minutes
    return TokenManager.isTokenExpired(token) || this.isTokenExpiringSoon(token);
  };

  // Check if token expires within 5 minutes
  private isTokenExpiringSoon = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const fiveMinutesFromNow = currentTime + 5 * 60 * 1000;
      return expirationTime <= fiveMinutesFromNow;
    } catch {
      return true;
    }
  };

  // Perform token refresh
  async performTokenRefresh(): Promise<void> {
    if (this.isRefreshing || this.refreshRetries >= this.maxRetries) {
      console.warn('Max refresh retries reached or already refreshing');
      return;
    }

    this.isRefreshing = true;
    this.refreshRetries++;

    try {
      const currentToken = TokenManager.getToken();
      if (!currentToken) return;

      // Coba refresh token menggunakan API
      const response = await authApi.refreshToken(currentToken);
      
      if (response.token && response.token !== currentToken) {
        // Update token baru
        TokenManager.setToken(response.token);
        
        console.log('Token refreshed successfully');
        this.refreshRetries = 0;
      }
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      
      if (this.refreshRetries >= this.maxRetries) {
        // Max retries, logout user
        this.forceLogout();
      }
    } finally {
      this.isRefreshing = false;
    }
  }

  // Force logout jika refresh gagal terus-menerus
  private forceLogout = (): void => {
    this.stopAutoRefresh();
    
    // Clear token
    TokenManager.removeToken();
    
    console.warn('Auto refresh failed, logging out user');
    
    // Redirect ke login page
    window.location.href = '/';
  };
}

// Global instance
export const autoRefreshService = new AutoRefreshService();