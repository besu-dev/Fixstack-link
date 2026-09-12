import React, { useState, useEffect, useCallback } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

// Views
import OverviewView from '../views/OverviewView';
import VerificationView from '../views/VerificationView';
import UsersView from '../views/UsersView';
import JobsView from '../views/JobsView';
import BidsView from '../views/BidsView';
import TransactionsView from '../views/TransactionsView';
import SettingsView from '../views/SettingsView';

import { adminApi } from '../../api/adminApi';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLayout({ onExitToSite }) {
  const { isDemoMode } = useAdminAuth();
  const [currentView, setCurrentView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await adminApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const pendingCount = stats?.users?.pendingVerifications || 0;

  const renderCurrentView = () => {
    switch (currentView) {
      case 'overview':
        return (
          <OverviewView
            stats={stats}
            onNavigateTo={(viewId) => setCurrentView(viewId)}
          />
        );
      case 'verifications':
        return <VerificationView onDataChanged={loadStats} />;
      case 'users':
        return <UsersView onDataChanged={loadStats} />;
      case 'jobs':
        return <JobsView onDataChanged={loadStats} />;
      case 'bids':
        return <BidsView />;
      case 'transactions':
        return <TransactionsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <OverviewView
            stats={stats}
            onNavigateTo={(viewId) => setCurrentView(viewId)}
          />
        );
    }
  };

  return (
    <div className="admin-root">
      <div className="admin-dashboard-container">
        {/* Sidebar */}
        <AdminSidebar
          currentView={currentView}
          onSelectView={(viewId) => setCurrentView(viewId)}
          pendingCount={pendingCount}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Canvas */}
        <div className="admin-main-canvas">
          {/* Header */}
          <AdminHeader
            currentView={currentView}
            onOpenSidebar={() => setSidebarOpen(true)}
            onRefresh={loadStats}
            isRefreshing={isRefreshing}
            isDemoMode={isDemoMode}
            onExitToSite={onExitToSite}
          />

          {/* View Container */}
          <main className="admin-view-content">
            {renderCurrentView()}
          </main>
        </div>
      </div>
    </div>
  );
}
