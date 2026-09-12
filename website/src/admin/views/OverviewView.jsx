import React from 'react';
import {
  Users,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export default function OverviewView({ stats, onNavigateTo }) {
  const users = stats?.users || {
    customers: 0,
    providers: 0,
    pendingVerifications: 0,
  };
  const jobs = stats?.jobs || {
    completed: 0,
  };

  return (
    <div>
      {/* 1. KPI Metrics Grid */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <span className="admin-metric-title">Service Seekers</span>
            <div className="admin-metric-icon-box admin-metric-icon-blue">
              <Users size={20} />
            </div>
          </div>
          <div className="admin-metric-val">{users.customers || 0}</div>
          <div className="admin-metric-bottom">
            <span className="admin-trend-badge positive">
              <TrendingUp size={14} /> Registered households
            </span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <span className="admin-metric-title">Active Technicians</span>
            <div className="admin-metric-icon-box admin-metric-icon-green">
              <Wrench size={20} />
            </div>
          </div>
          <div className="admin-metric-val">{users.providers || 0}</div>
          <div className="admin-metric-bottom">
            <span className="admin-trend-badge neutral">
              {users.verifiedProviders || users.providers || 0} verified pros
            </span>
          </div>
        </div>

        <div
          className="admin-metric-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigateTo('verifications')}
          title="Click to view pending verification queue"
        >
          <div className="admin-metric-top">
            <span className="admin-metric-title">Pending Approvals</span>
            <div className="admin-metric-icon-box admin-metric-icon-amber">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="admin-metric-val">
            {users.pendingVerifications || 0}
          </div>
          <div className="admin-metric-bottom">
            <span className="admin-trend-badge alert">
              Requires ID review
            </span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <span className="admin-metric-title">Completed Repairs</span>
            <div className="admin-metric-icon-box admin-metric-icon-info">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="admin-metric-val">{jobs.completed || 0}</div>
          <div className="admin-metric-bottom">
            <span className="admin-trend-badge positive">
              Successfully serviced
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
