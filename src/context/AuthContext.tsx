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

  /**
   * =========================
   * INIT AUTH
   * =========================
   */
  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        if (TokenManager.isTokenExpired(storedToken)) {
          throw new Error("Token expired");
        }

        const userData = await authApi.getCurrentUser(storedToken);

        setUser(userData);
        setRole(mapRoleIdToRole(userData.roles_id));
        setRoleId(userData.roles_id);
        setToken(storedToken);

        autoRefreshService.startAutoRefresh();
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user_data");
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  /**
   * =========================
   * LOGIN
   * =========================
   */
  const login = async (
    identifier: string,
    password: string,
  ): Promise<LoginResponse> => {
    const response = await authApi.login(identifier, password);

    // 🔥 SIMPAN TOKEN YANG BENAR
    localStorage.setItem("token", response.token);
    localStorage.setItem("user_data", JSON.stringify(response.user));

    setUser(response.user);
    setRole(mapRoleIdToRole(response.user.roles_id));
    setRoleId(response.user.roles_id);
    setToken(response.token);

    autoRefreshService.startAutoRefresh();
    return response;
  };

  /**
   * =========================
   * LOGOUT
   * =========================
   */
  const logout = async () => {
    try {
      autoRefreshService.stopAutoRefresh();
      if (token) await authApi.logout(token);
    } catch (err) {
      console.warn("Logout API error (ignored)");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user_data");
      setUser(null);
      setRole(null);
      setRoleId(null);
      setToken(null);
    }
  };

  /**
   * =========================
   * AUTO REFRESH
   * =========================
   */
  const refreshToken = async () => {
    try {
      await autoRefreshService.performTokenRefresh();
    } catch {
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
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
