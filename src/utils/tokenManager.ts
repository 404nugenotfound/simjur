export const TokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem("auth_token");
  },

  setToken: (token: string): void => {
    localStorage.setItem("auth_token", token);
  },

  removeToken: (): void => {
    localStorage.removeItem("auth_token");
  },

  getAuthHeaders: (): Record<string, string> => {
    const token = TokenManager.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const playload = JSON.parse(atob(token.split(".")[1]));
      return Date.now() >= playload.exp * 1000;
    } catch {
      return true;
    }
  },
};
