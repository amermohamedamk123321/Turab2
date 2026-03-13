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

  useEffect(() => {
    try {
      const session = authApi.getSession();
      if (session) setUser(session);
    } catch (e) {
      console.error("Auth session error:", e);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const userData = await authApi.login(email, password);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
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
