import React from 'react';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AdminLogin from './components/AdminLogin';
import AdminLayout from './components/AdminLayout';
import './admin.css';

function AdminContent({ onExitToSite }) {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="admin-login-screen">
        <div style={{ color: 'white', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#0052cc', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span>Initializing Bete Admin Console...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onExitToSite={onExitToSite} />;
  }

  return <AdminLayout onExitToSite={onExitToSite} />;
}

export default function AdminApp({ onExitToSite }) {
  return (
    <AdminAuthProvider>
      <AdminContent onExitToSite={onExitToSite} />
    </AdminAuthProvider>
  );
}
