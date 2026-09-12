import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLogin({ onExitToSite }) {
  const { login } = useAdminAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please enter your administrator email/phone and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login(identifier.trim(), password);
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setIdentifier('admin@bete.et');
    setPassword('Admin@123456');
    setError(null);
  };

  return (
    <div className="admin-login-screen">
      <div className="admin-login-glow" />
      <div className="admin-login-glow-bottom" />

      <div className="admin-login-card">
        {/* Brand Header */}
        <div className="admin-login-brand">
          <div className="admin-brand-icon-box">
            <ShieldCheck size={32} />
          </div>
          <h1>Bete Admin Portal</h1>
          <p>Household Repairs & Technician Management System</p>
          <div className="admin-login-badge">
            <span>Official Platform Console</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="admin-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label htmlFor="admin-identifier">Admin Email or Phone</label>
            <div className="admin-input-wrap">
              <Mail size={18} className="admin-input-icon" />
              <input
                id="admin-identifier"
                type="text"
                className="admin-input"
                placeholder="admin@bete.et or +251..."
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="admin-password">Secure Password</label>
            <div className="admin-input-wrap">
              <Lock size={18} className="admin-input-icon" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="admin-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="admin-btn-primary"
            disabled={loading}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Helper */}
        <div className="admin-quick-demo-box">
          <p>Quick Evaluation Credentials:</p>
          <button
            type="button"
            className="admin-quick-fill-btn"
            onClick={handleQuickFill}
          >
            Use Demo Admin (admin@bete.et / Admin@123456)
          </button>
        </div>

        {/* Return to Public Website */}
        <div className="admin-login-footer">
          <button
            type="button"
            className="admin-back-site-btn"
            onClick={onExitToSite}
          >
            <ArrowLeft size={16} />
            <span>Return to Public Website</span>
          </button>
        </div>
      </div>
    </div>
  );
}
