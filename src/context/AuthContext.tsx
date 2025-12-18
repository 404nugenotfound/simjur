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

interface AuthContextType {
  user: User | null;
  role: Role | null;
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
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check existing token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("auth_token");

      if (storedToken) {
        try {
          // Validate token dengan real API
          const userData = await authApi.getCurrentUser(storedToken);
          setUser(userData);
          setRole(mapRoleIdToRole(userData.roles_id));
          setToken(storedToken);
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
    setToken(response.token);

    return response;
  };

  

  const logout = async (): Promise<void> => {
    try {
      if (token) {
        console.log('🔄 Attempting server logout...');
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
      console.log('🧹 Clearing local authentication data...');
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      localStorage.removeItem("user_role");
      setUser(null);
      setRole(null);
      setToken(null);
      
      console.log('✅ Logout completed successfully');
    }
  };

  const refreshToken = async (): Promise<void> => {
    // Implementation untuk token refresh jika API supports it
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
