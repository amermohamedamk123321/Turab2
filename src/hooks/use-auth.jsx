import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "@/services/api";

const AUTH_CONTEXT_KEY = "__turab_auth_ctx__";

// Use a global singleton to survive HMR module reloads
if (!window[AUTH_CONTEXT_KEY]) {
  window[AUTH_CONTEXT_KEY] = createContext(null);
}
const AuthContext = window[AUTH_CONTEXT_KEY];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Check if valid session exists via API call
        const session = await authApi.getSession();
        if (session) {
          console.log('✅ Session restored from server');
          setUser(session);
        } else {
          console.log('❌ No valid session found');
          setUser(null);
        }
      } catch (error) {
        console.warn('Session validation failed:', error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const userData = await authApi.login(email, password);
      setUser(userData);
      return userData;
    } catch (error) {
      setUser(null);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
