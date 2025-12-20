import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authApi, LoginResponse, User } from "../service/api";
import { mapRoleIdToRole } from "../utils/roleMapping";
import { Role } from "../utils/role";
import { autoRefreshService } from "../services/autoRefreshService";
import { TokenManager } from "../utils/tokenManager";

interface AuthContextType {
  user: User | null;
  role: Role | null;
  roleId: number | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);



export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check existing token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("auth_token");

      if (storedToken) {
        try {
          // Cek token expiration locally dulu
          if (TokenManager.isTokenExpired(storedToken)) {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_data");
            setIsLoading(false);
            return;
          }
          
          // Validate dengan API hanya jika token tidak expired
          const userData = await authApi.getCurrentUser(storedToken);
          setUser(userData);
          setRole(mapRoleIdToRole(userData.roles_id));
          setRoleId(userData.roles_id);
          setToken(storedToken);
          
          // Start auto refresh service
          autoRefreshService.startAutoRefresh();
        } catch {
          // Token invalid, clear it
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (
    identifier: string,
    password: string,
  ): Promise<LoginResponse> => {
    // Gunakan fallback auth yang auto-switch ke mock jika CORS error
    const response = await authApi.login(identifier, password);

    // Save token
    localStorage.setItem("auth_token", response.token);
    localStorage.setItem("user_data", JSON.stringify(response.user));

    // Update state
    setUser(response.user);
    setRole(mapRoleIdToRole(response.user.roles_id));
    setRoleId(response.user.roles_id);
    setToken(response.token);

    // Start auto refresh service
    autoRefreshService.startAutoRefresh();

    return response;
  };

  

  const logout = async (): Promise<void> => {
    try {
      // Stop auto refresh service
      autoRefreshService.stopAutoRefresh();
      
      if (token) {
        await authApi.logout(token);
      }
    } catch (error: any) {
      // Log error dengan detail lengkap
      console.warn('⚠️ Logout API call failed:', {
        message: error.message,
        status: error.status,
        code: error.code
      });
    } finally {
      // Selalu clear local data untuk memastikan logout berhasil
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      localStorage.removeItem("user_role");
      setUser(null);
      setRole(null);
      setRoleId(null);
      setToken(null);
    }
  };

  // Manage auto refresh service based on auth state
  useEffect(() => {
    const isAuth = !!user && !!token;
    if (isAuth && token) {
      // Start auto refresh saat login
      autoRefreshService.startAutoRefresh();
    } else {
      // Stop auto refresh saat logout
      autoRefreshService.stopAutoRefresh();
    }

    // Cleanup saat unmount
    return () => {
      autoRefreshService.stopAutoRefresh();
    };
  }, [user, token]);

  const refreshToken = async (): Promise<void> => {
    // Gunakan auto refresh service
    try {
      await autoRefreshService.performTokenRefresh();
      console.log('Token refreshed successfully');
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Fallback ke logout jika refresh gagal
      await logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        roleId,
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
