import React from 'react';
import {
  Users,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Banknote,
  TrendingUp,
} from 'lucide-react';

export default function OverviewView({ stats, onNavigateTo }) {
  const users = stats?.users || {
    customers: 86,
    providers: 42,
    pendingVerifications: 7,
  };
  const jobs = stats?.jobs || {
    open: 14,
    assigned: 18,
    completed: 58,
    totalVolumeETB: 432500,
  };
  const breakdowns = stats?.breakdowns || {
    byCategory: [],
    bySubcity: [],
  };
  const recentActivity = stats?.recentActivity || {
    users: [],
    jobs: [],
  };

  const activeJobsCount = (jobs.open || 0) + (jobs.assigned || 0);
  const totalVolumeFormatted = new Intl.NumberFormat('en-ET', {
    maximumFractionDigits: 0,
  }).format(jobs.totalVolumeETB || 0);

  // Maximum count for category percentage bars
  const maxCategoryCount = Math.max(
    ...breakdowns.byCategory.map((c) => c.count || 0),
    1
  );

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
            <span className="admin-metric-title">Active Requests</span>
            <div className="admin-metric-icon-box admin-metric-icon-purple">
              <Clock size={20} />
            </div>
          </div>
          <div className="admin-metric-val">{activeJobsCount}</div>
          <div className="admin-metric-bottom">
            <span className="admin-trend-badge neutral">
              {jobs.open || 0} open · {jobs.assigned || 0} in progress
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

        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <span className="admin-metric-title">Platform Volume</span>
            <div className="admin-metric-icon-box admin-metric-icon-green">
              <Banknote size={20} />
            </div>
          </div>
          <div className="admin-metric-val">
            {totalVolumeFormatted} <span style={{ fontSize: '1rem', fontWeight: 600 }}>ETB</span>
          </div>
          <div className="admin-metric-bottom">
            <span className="admin-trend-badge positive">
              Gross maintenance value
            </span>
          </div>
        </div>
      </div>

      {/* 2. Charts & Analytics Split Panel */}
      <div className="admin-dashboard-split">
        {/* Category Breakdown */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h3 className="admin-panel-title">
              <Wrench size={18} color="var(--admin-primary)" />
              <span>Service Demand by Category</span>
            </h3>
            <button
              type="button"
              className="admin-header-btn"
              onClick={() => onNavigateTo('jobs')}
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              View Jobs
            </button>
          </div>

          <div className="admin-category-bars">
            {breakdowns.byCategory.length > 0 ? (
              breakdowns.byCategory.map((cat) => {
                const pct = Math.round((cat.count / maxCategoryCount) * 100);
                return (
                  <div key={cat.category} className="admin-cat-bar-item">
                    <div className="admin-cat-bar-info">
                      <span>{cat.category}</span>
                      <span style={{ color: 'var(--admin-text-muted)' }}>
                        {cat.count} requests ({pct}%)
                      </span>
                    </div>
                    <div className="admin-cat-bar-bg">
                      <div
                        className="admin-cat-bar-fill"
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
                No category data recorded yet.
              </p>
            )}
          </div>
        </div>

        {/* Subcity Coverage */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h3 className="admin-panel-title">
              <Users size={18} color="#10b981" />
              <span>Technicians by Subcity</span>
            </h3>
          </div>

          <div className="admin-subcity-grid">
            {breakdowns.bySubcity.length > 0 ? (
              breakdowns.bySubcity.map((sub) => (
                <div key={sub.subcity} className="admin-subcity-row">
                  <span className="admin-subcity-name">
                    📍 {sub.subcity}
                  </span>
                  <span className="admin-subcity-badge">
                    {sub.count} technicians
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
                No regional data available yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Recent Activity Split Panel */}
      <div className="admin-dashboard-split">
        {/* Recent Service Requests */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h3 className="admin-panel-title">
              <Clock size={18} color="#8b5cf6" />
              <span>Latest Service Requests</span>
            </h3>
            <button
              type="button"
              className="admin-header-btn"
              onClick={() => onNavigateTo('jobs')}
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              All Jobs
            </button>
          </div>

          <div className="admin-table-container">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Customer</th>
                  <th>Budget</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.jobs?.length > 0 ? (
                  recentActivity.jobs.map((job) => (
                    <tr key={job._id}>
                      <td style={{ fontWeight: 600 }}>{job.title}</td>
                      <td>{job.customer?.fullName || 'Anonymous'}</td>
                      <td>{job.budget} ETB</td>
                      <td>
                        <span
                          className={`admin-badge ${
                            job.status === 'completed'
                              ? 'admin-badge-success'
                              : job.status === 'assigned'
                              ? 'admin-badge-purple'
                              : job.status === 'open'
                              ? 'admin-badge-primary'
                              : 'admin-badge-neutral'
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: '#64748b' }}>
                      No recent jobs recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Signups */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h3 className="admin-panel-title">
              <Users size={18} color="#0052cc" />
              <span>Recent Registrations</span>
            </h3>
            <button
              type="button"
              className="admin-header-btn"
              onClick={() => onNavigateTo('users')}
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              All Users
            </button>
          </div>

          <div className="admin-subcity-grid">
            {recentActivity.users?.length > 0 ? (
              recentActivity.users.map((u) => (
                <div key={u._id} className="admin-subcity-row">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      {u.fullName}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {u.role === 'provider'
                        ? `Technician (${u.profession || 'General'})`
                        : 'Service Seeker'}
                    </span>
                  </div>
                  <span
                    className={`admin-badge ${
                      u.role === 'provider'
                        ? u.isVerified
                          ? 'admin-badge-success'
                          : 'admin-badge-warning'
                        : 'admin-badge-neutral'
                    }`}
                  >
                    {u.role === 'provider'
                      ? u.isVerified
                        ? 'Verified'
                        : 'Pending'
                      : 'Customer'}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
                No new users registered recently.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
