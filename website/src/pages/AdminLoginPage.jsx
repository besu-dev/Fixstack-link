import React from 'react';
import { 
  ShieldAlert, 
  ExternalLink, 
  Lock, 
  Server, 
  CheckCircle, 
  Smartphone,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';
import './AdminLoginPage.css';

export default function AdminLoginPage({ setActivePage }) {
  const adminDashboardUrl = import.meta.env.VITE_ADMIN_DASHBOARD_URL || 'http://localhost:5173/admin';

  const handleLaunch = () => {
    window.open(adminDashboardUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="admin-page-root">
      <div className="container admin-page-container">
        <button className="back-btn" onClick={() => setActivePage('home')}>
          <ArrowLeft size={16} />
          <span>Back to Public Website</span>
        </button>

        <div className="admin-portal-box">
          <div className="admin-portal-badge">
            <ShieldAlert size={20} className="shield-badge-icon" />
            <span>Authorized Management Access</span>
          </div>

          <h1 className="admin-page-title">FixLink Ethiopia Administrator Gateway</h1>
          <p className="admin-page-desc">
            The FixLink Admin Dashboard manages technician verification, subcity service categories, customer dispute mediations, and financial audits.
          </p>

          <div className="admin-info-card">
            <div className="admin-card-header">
              <Lock size={18} className="lock-icon" />
              <span>Restricted System Access</span>
            </div>
            
            <p className="admin-card-note">
              Technician registrations (Kebele IDs, trade diplomas) and customer bookings are moderated here. If you are an authorized system operator, launch the administrative portal below:
            </p>

            <div className="admin-url-display">
              <Server size={16} />
              <span>Target Admin Portal:</span>
              <code>{adminDashboardUrl}</code>
            </div>

            <div className="admin-actions-row">
              <button 
                className="btn btn-primary btn-lg launch-btn"
                onClick={handleLaunch}
                id="direct-launch-admin-btn"
              >
                <span>Launch Admin Dashboard</span>
                <ExternalLink size={18} />
              </button>
            </div>
          </div>

          {/* Clarification for Public Users */}
          <div className="public-clarification-box">
            <div className="clarification-icon-box">
              <Smartphone size={24} />
            </div>
            <div className="clarification-text">
              <h4>Are you a Customer or Technician?</h4>
              <p>
                Service Seekers and Service Providers do not log in via this web portal. All booking, bidding, profile editing, and messaging happen exclusively inside the <strong>FixLink Mobile App</strong>.
              </p>
              <div className="clarification-links">
                <button className="text-link" onClick={() => setActivePage('services')}>
                  Explore Services Catalog →
                </button>
                <button className="text-link" onClick={() => setActivePage('how-it-works')}>
                  See Mobile App Flows →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
