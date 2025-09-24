import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import authService from '../services/authServices';
import profileService from '../services/profil/profileService';

const AuthContext = createContext({
  user: null,
  roles: [],
  isAuthenticated: false,
  canAccessAdmin: false,
  loading: true,
  refreshAuth: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [canAccessAdmin, setCanAccessAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const computeAdminAccess = (nextUser, nextRoles) => {
    const serverHasAdmin = Array.isArray(nextRoles) && (
      nextRoles.includes('ROLE_ADMIN') ||
      nextRoles.includes('ROLE_MANAGER') ||
      nextRoles.includes('ROLE_RESPONSABLE_PROJET')
    );
    const projectRole = authService.getCurrentUserRole?.();
    const projectHasAdmin = projectRole === 'manager' || projectRole === 'responsable_projet';
    return Boolean(serverHasAdmin || projectHasAdmin);
  };

  const refreshAuth = async () => {
    try {
      const token = authService.getToken?.();
      if (!token) {
        setUser(null);
        setRoles([]);
        setIsAuthenticated(false);
        setCanAccessAdmin(false);
        return;
      }
      const profile = await profileService.getProfile();
      setUser(profile);
      const nextRoles = Array.isArray(profile?.roles) ? profile.roles : [];
      setRoles(nextRoles);
      setIsAuthenticated(true);
      setCanAccessAdmin(computeAdminAccess(profile, nextRoles));
    } catch (_) {
      setUser(null);
      setRoles([]);
      setIsAuthenticated(false);
      setCanAccessAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
    const onStorage = () => {
      setCanAccessAdmin((prev) => computeAdminAccess(user, roles));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    setCanAccessAdmin(computeAdminAccess(user, roles));
  }, [user, roles]);

  const logout = () => {
    try {
      authService.logout();
    } catch (_) {}
  };

  const value = useMemo(() => ({
    user,
    roles,
    isAuthenticated,
    canAccessAdmin,
    loading,
    refreshAuth,
    logout,
  }), [user, roles, isAuthenticated, canAccessAdmin, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


