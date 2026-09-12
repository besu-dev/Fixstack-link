import React from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  LogOut,
  X,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminSidebar({
  currentView,
  onSelectView,
  pendingCount = 0,
  isOpen = false,
  onClose,
}) {
  const { adminUser, logout } = useAdminAuth();

  const navGroups = [
    {
      category: 'Core Operations',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        {
          id: 'verifications',
          label: 'Verification Queue',
          icon: ShieldCheck,
          badge: pendingCount > 0 ? pendingCount : null,
        },
        { id: 'users', label: 'User Management', icon: Users },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Sidebar Header */}
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">
            <div className="admin-sidebar-logo-icon">B</div>
            <div className="admin-sidebar-logo-text">
              <span className="admin-sidebar-logo-title">Bete Admin</span>
              <span className="admin-sidebar-logo-subtitle">Ethiopia Portal</span>
            </div>
          </div>

          {isOpen && (
            <button
              type="button"
              className="admin-mobile-toggle"
              onClick={onClose}
              aria-label="Close Sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="admin-sidebar-nav">
          {navGroups.map((group) => (
            <React.Fragment key={group.category}>
              <div className="admin-nav-category-label">{group.category}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`admin-nav-btn ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      onSelectView(item.id);
                      if (isOpen && onClose) onClose();
                    }}
                  >
                    <div className="admin-nav-btn-left">
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && item.badge !== undefined && (
                      <span className="admin-nav-badge">{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-preview-card">
            <div className="admin-user-avatar">
              {adminUser?.fullName ? adminUser.fullName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="admin-user-info">
              <div className="admin-user-name">
                {adminUser?.fullName || 'Administrator'}
              </div>
              <div className="admin-user-role">Super Admin</div>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-btn"
            onClick={logout}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
