// NEW: src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authApi, User, LoginResponse } from "../service/api";
import { TokenManager } from "../utils/tokenManager";
import { mapRoleIdToRole } from "../utils/roleMapping";
import { Role } from "../utils/role";

interface AuthContextType {
  user: User | null;
  role: Role | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Check existing token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = TokenManager.getToken();

      if (storedToken && !TokenManager.isTokenExpired(storedToken)) {
        try {
          const userData = await authApi.getCurrentUser(storedToken);
          setUser(userData);
          setRole(mapRoleIdToRole(userData.roles_id));
          setToken(storedToken);
        } catch {
          // Token invalid, clear it
          TokenManager.removeToken();
        }
      }

      setIsLoading(false);
    };
    initializeAuth();
  }, []);
  const login = async (
    username: string,
    password: string,
  ): Promise<LoginResponse> => {
    const response = await authApi.login(username, password);

    // Save token
    TokenManager.setToken(response.token);

    // Update state
    setUser(response.user);
    setRole(mapRoleIdToRole(response.user.roles_id));
    setToken(response.token);

    return response;
  };
  const logout = async (): Promise<void> => {
    try {
      if (token) {
        await authApi.logout(token);
      }
    } finally {
      // Always clear local data
      TokenManager.removeToken();
      setUser(null);
      setRole(null);
      setToken(null);
    }
  };
  const refreshToken = async (): Promise<void> => {
    // Implementation for token refresh if API supports it
    // For now, just logout
    await logout();
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
