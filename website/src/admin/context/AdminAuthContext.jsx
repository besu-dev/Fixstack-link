import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Restore session on mount
    const savedToken = localStorage.getItem('fixlink_admin_token');
    const savedUser = localStorage.getItem('fixlink_admin_user');

    if (savedToken && savedUser) {
      // If token is an old demo placeholder, clear it so user signs in to the live database
      if (savedToken.startsWith('demo-admin-session-token')) {
        localStorage.removeItem('fixlink_admin_token');
        localStorage.removeItem('fixlink_admin_user');
        setLoading(false);
        return;
      }
      try {
        setToken(savedToken);
        setAdminUser(JSON.parse(savedUser));
        setIsDemoMode(false);
      } catch (err) {
        console.error('Failed to parse saved admin session', err);
        localStorage.removeItem('fixlink_admin_token');
        localStorage.removeItem('fixlink_admin_user');
      }
    }
    setLoading(false);

    const handleSessionExpired = () => {
      logout();
    };
    window.addEventListener('admin-session-expired', handleSessionExpired);
    return () => window.removeEventListener('admin-session-expired', handleSessionExpired);
  }, []);

  const login = async (identifier, password) => {
    const data = await adminApi.login(identifier, password);
    const authToken = data.token;
    const user = data.admin;

    localStorage.setItem('fixlink_admin_token', authToken);
    localStorage.setItem('fixlink_admin_user', JSON.stringify(user));

    setToken(authToken);
    setAdminUser(user);
    setIsDemoMode(Boolean(data.isDemoMode));
    return user;
  };

  const logout = () => {
    localStorage.removeItem('fixlink_admin_token');
    localStorage.removeItem('fixlink_admin_user');
    setToken(null);
    setAdminUser(null);
    setIsDemoMode(false);
  };

  const value = {
    adminUser,
    token,
    isAuthenticated: Boolean(token && adminUser),
    loading,
    isDemoMode,
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
