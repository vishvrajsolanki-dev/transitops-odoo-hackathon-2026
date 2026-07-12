import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { loginUser } from '../services/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [loading, setLoading] = useState(false);

  // Token/user are kept in-memory ONLY — NEVER persisted to localStorage.

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      setToken(data.token);
      setUser(data.user);
      setActiveRole(null); // Role must be selected on the next screen
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Demo login — bypasses the backend entirely.
   * Used by "Continue with Google" and as a fallback when backend is offline.
   * Sets a mock user so the role selection screen is reachable.
   */
  const demoLogin = useCallback((email = 'demo@transitops.dev') => {
    const mockUser = {
      id: 'demo-user',
      email,
      role: 'fleet_manager', // default, overridden by role selection
    };
    setToken('demo-token');
    setUser(mockUser);
    setActiveRole(null);
  }, []);

  const selectRole = useCallback((role) => {
    setActiveRole(role);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setActiveRole(null);
  }, []);

  const isAuthenticated = !!token && !!user;
  const hasSelectedRole = !!activeRole;

  const value = useMemo(
    () => ({
      user,
      token,
      activeRole,
      loading,
      isAuthenticated,
      hasSelectedRole,
      login,
      demoLogin,
      logout,
      selectRole,
    }),
    [user, token, activeRole, loading, isAuthenticated, hasSelectedRole, login, demoLogin, logout, selectRole],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
