import React from 'react';
import { Menu, RefreshCw, Globe } from 'lucide-react';

const VIEW_TITLES = {
  overview: {
    title: 'Platform Overview',
    subtitle: 'Real-time performance metrics and marketplace health',
  },
  verifications: {
    title: 'Technician Verification Queue',
    subtitle: 'Review Kebele IDs and Trade Certificates for professional accreditation',
  },
  users: {
    title: 'User Management',
    subtitle: 'Directory of service seekers and registered technicians across Ethiopia',
  },
  jobs: {
    title: 'Service Requests & Orders',
    subtitle: 'Monitor posted repair jobs, assigned technicians, and project statuses',
  },
  bids: {
    title: 'Technician Bids & Proposals',
    subtitle: 'Track competitive quotes, boost allocations, and service fees',
  },
  transactions: {
    title: 'Financials & Wallet Transactions',
    subtitle: 'Connects packages purchased via Telebirr & CBE Birr',
  },
  settings: {
    title: 'Platform & System Settings',
    subtitle: 'Configure categories, commission rules, and administrator profiles',
  },
};

export default function AdminHeader({
  currentView,
  onOpenSidebar,
  onRefresh,
  isRefreshing = false,
  isDemoMode = false,
  onExitToSite,
}) {
  const currentMeta = VIEW_TITLES[currentView] || {
    title: 'Admin Console',
    subtitle: 'Bete Service Management',
  };

  return (
    <header className="admin-top-header">
      <div className="admin-header-left">
        <button
          type="button"
          className="admin-mobile-toggle"
          onClick={onOpenSidebar}
          aria-label="Open Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div className="admin-header-title">
          <h2>{currentMeta.title}</h2>
          <div className="admin-header-subtitle">{currentMeta.subtitle}</div>
        </div>
      </div>

      <div className="admin-header-right">
        {/* System Status */}
        <div className="admin-status-indicator" title="Current API connectivity status">
          <span className={`admin-status-dot ${isDemoMode ? 'offline' : ''}`} />
          <span>{isDemoMode ? 'Demo Sandbox' : 'API Online'}</span>
        </div>

        {/* Refresh Action */}
        <button
          type="button"
          className="admin-header-btn"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh current data"
        >
          <RefreshCw
            size={16}
            style={{
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
            }}
          />
          <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
        </button>

        {/* Return to Public Website */}
        <button
          type="button"
          className="admin-header-btn admin-btn-back-website"
          onClick={onExitToSite}
          title="Return to public customer website"
        >
          <Globe size={16} />
          <span>View Public Site</span>
        </button>
      </div>
    </header>
  );
}
