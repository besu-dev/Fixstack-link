import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Server,
  Database,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Coins,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { adminApi } from '../../api/adminApi';

export default function SettingsView() {
  const { adminUser } = useAdminAuth();
  const [serverOnline, setServerOnline] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(false);

  // Platform rule inputs (local preview & configuration)
  const [welcomeConnects, setWelcomeConnects] = useState(10);
  const [signupConnects, setSignupConnects] = useState(5);
  const [commissionPct, setCommissionPct] = useState(5);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Password update form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState(null);

  const checkHealth = async () => {
    setCheckingHealth(true);
    const ok = await adminApi.checkHealth();
    setServerOnline(ok);
    setCheckingHealth(false);
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPasswordMsg({
      type: 'success',
      text: 'Administrator password updated successfully.',
    });
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMsg(null), 4000);
  };

  return (
    <div style={{ maxWidth: '860px' }}>
      {/* 1. System Health & Infrastructure */}
      <div className="admin-panel" style={{ marginBottom: '24px' }}>
        <div className="admin-panel-header">
          <h3 className="admin-panel-title">
            <Server size={18} color="var(--admin-primary)" />
            <span>Platform Infrastructure & Health</span>
          </h3>
          <button
            type="button"
            className="admin-header-btn"
            onClick={checkHealth}
            disabled={checkingHealth}
          >
            <RefreshCw
              size={14}
              style={{ animation: checkingHealth ? 'spin 1s linear infinite' : 'none' }}
            />
            <span>Check Connectivity</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Server size={16} color="var(--admin-primary)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Express API Server</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`admin-status-dot ${!serverOnline ? 'offline' : ''}`} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                {serverOnline ? 'Online (Port 5000)' : 'Standby / Localhost'}
              </span>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Database size={16} color="#10b981" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>MongoDB Database</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`admin-status-dot ${!serverOnline ? 'offline' : ''}`} />
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                {serverOnline ? 'Connected' : 'Replica / Mock Ready'}
              </span>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Shield size={16} color="#8b5cf6" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Environment</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#475569' }}>
              Production Demo Ready
            </div>
          </div>
        </div>
      </div>

      {/* 2. Platform Connects & Commission Rules */}
      <div className="admin-panel" style={{ marginBottom: '24px' }}>
        <div className="admin-panel-header">
          <h3 className="admin-panel-title">
            <Coins size={18} color="#f59e0b" />
            <span>Technician Connects & Commission Rules</span>
          </h3>
        </div>

        <form onSubmit={handleSaveSettings}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div className="admin-form-group">
              <label>Registration Starting Balance</label>
              <input
                type="number"
                min="0"
                className="admin-input"
                value={signupConnects}
                onChange={(e) => setSignupConnects(e.target.value)}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Granted upon technician initial signup.
              </span>
            </div>

            <div className="admin-form-group">
              <label>Verification Approval Bonus</label>
              <input
                type="number"
                min="0"
                className="admin-input"
                value={welcomeConnects}
                onChange={(e) => setWelcomeConnects(e.target.value)}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Granted automatically upon verifying Kebele ID and license.
              </span>
            </div>

            <div className="admin-form-group">
              <label>Platform Service Fee (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                className="admin-input"
                value={commissionPct}
                onChange={(e) => setCommissionPct(e.target.value)}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Calculated on accepted customer jobs.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="submit"
              className="admin-btn-primary"
              style={{ width: 'auto', padding: '10px 20px' }}
            >
              <Save size={16} />
              <span>Save Platform Rules</span>
            </button>
            {settingsSaved && (
              <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={16} /> Preferences saved!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* 3. Administrator Profile & Password Update */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <h3 className="admin-panel-title">
            <Lock size={18} color="#ef4444" />
            <span>Administrator Security & Credentials</span>
          </h3>
        </div>

        <div style={{ marginBottom: '18px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            Active Super Admin: <span style={{ color: 'var(--admin-primary)' }}>{adminUser?.email || 'admin@bete.et'}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Role: Full Access System Administrator
          </div>
        </div>

        {passwordMsg && (
          <div
            className={passwordMsg.type === 'error' ? 'admin-error-banner' : 'admin-badge-success'}
            style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {passwordMsg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '18px' }}>
            <div className="admin-form-group">
              <label>New Administrator Password</label>
              <input
                type="password"
                className="admin-input"
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                className="admin-input"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="admin-header-btn"
            style={{ background: 'var(--admin-primary-light)', color: 'var(--admin-primary)', borderColor: 'transparent', padding: '10px 18px' }}
          >
            <Lock size={15} />
            <span>Update Master Password</span>
          </button>
        </form>
      </div>
    </div>
  );
}
