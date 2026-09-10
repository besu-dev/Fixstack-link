import React from 'react';
import {
  ShieldAlert,
  X,
  ExternalLink,
  Lock,
  Server,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import './AdminLoginModal.css';

export default function AdminLoginModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const adminDashboardUrl = import.meta.env.VITE_ADMIN_DASHBOARD_URL || 'http://localhost:5173/admin';

  const handleLaunchAdmin = () => {
    // Open in current or new window
    window.open(adminDashboardUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="admin-modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Header */}
        <div className="admin-modal-header">
          <div className="admin-icon-ring">
            <ShieldAlert size={28} className="shield-icon" />
          </div>
          <h3 className="admin-modal-title">Admin Dashboard Gateway</h3>
          <p className="admin-modal-subtitle">
            Secure administration and operations portal for the Bete Ethiopia platform.
          </p>
        </div>

        {/* Modal Body */}
        <div className="admin-modal-body">
          <div className="admin-warning-box">
            <AlertCircle size={20} className="warning-icon" />
            <div className="warning-text">
              <strong>Authorized Personnel Only</strong>
              <p>This portal is reserved for Bete operations managers, Kebele ID verification staff, and dispute specialists.</p>
            </div>
          </div>

          <div className="admin-environment-row">
            <div className="env-label">
              <Server size={14} />
              <span>Target Admin URL:</span>
            </div>
            <code className="env-url">{adminDashboardUrl}</code>
          </div>

          <div className="admin-notice-block">
            <Smartphone size={18} className="phone-icon" />
            <div className="notice-info">
              <strong>Looking for Customer or Technician Login?</strong>
              <p>
                Service Seekers and Service Providers manage their accounts, requests, and bids exclusively inside the <strong>Bete Mobile App</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="admin-modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            <span>Cancel</span>
          </button>

          <button
            className="btn btn-primary btn-launch-admin"
            onClick={handleLaunchAdmin}
            id="launch-admin-portal-btn"
          >
            <span>Proceed to Admin Dashboard</span>
            <ExternalLink size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
