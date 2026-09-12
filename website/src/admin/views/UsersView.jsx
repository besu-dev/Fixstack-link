import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Edit2,
  Trash2,
  Coins,
  X,
  Star,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';

const ADDIS_SUBCITIES = [
  'All',
  'Bole',
  'Yeka',
  'Kirkos',
  'Arada',
  'Nifas Silk-Lafto',
  'Gullele',
  'Lideta',
  'Kolfe Keranio',
  'Akaki Kality',
  'Addis Ketema',
];

export default function UsersView({ onDataChanged }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [subcityFilter, setSubcityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [editingUser, setEditingUser] = useState(null);
  const [editConnects, setEditConnects] = useState(0);
  const [editVerified, setEditVerified] = useState(false);
  const [editFeatured, setEditFeatured] = useState(false);
  const [editSubcity, setEditSubcity] = useState('Bole');
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers({
        role: roleFilter !== 'all' ? roleFilter : undefined,
        subcity: subcityFilter !== 'All' ? subcityFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, subcityFilter, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditConnects(user.connectsBalance || 0);
    setEditVerified(Boolean(user.isVerified));
    setEditFeatured(Boolean(user.isFeatured));
    setEditSubcity(user.subcity || 'Bole');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setSaving(true);
    try {
      await adminApi.updateUser(editingUser._id, {
        connectsBalance: Number(editConnects),
        isVerified: Boolean(editVerified),
        isFeatured: Boolean(editFeatured),
        subcity: editSubcity,
      });
      setEditingUser(null);
      fetchUsers();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert('Failed to update user: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!confirm(`Are you sure you want to delete user "${user.fullName}"? This action is permanent.`)) {
      return;
    }

    try {
      await adminApi.deleteUser(user._id);
      fetchUsers();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert('Failed to delete user: ' + err.message);
    }
  };

  return (
    <div>
      {/* Table Filters & Search Bar */}
      <div className="admin-table-controls">
        <div className="admin-filters-group">
          {/* Role Filter Tabs */}
          <button
            type="button"
            className={`admin-header-btn ${roleFilter === 'all' ? 'admin-btn-back-website' : ''}`}
            onClick={() => setRoleFilter('all')}
          >
            <span>All Users</span>
          </button>
          <button
            type="button"
            className={`admin-header-btn ${roleFilter === 'customer' ? 'admin-btn-back-website' : ''}`}
            onClick={() => setRoleFilter('customer')}
          >
            <span>Customers</span>
          </button>
          <button
            type="button"
            className={`admin-header-btn ${roleFilter === 'provider' ? 'admin-btn-back-website' : ''}`}
            onClick={() => setRoleFilter('provider')}
          >
            <span>Technicians</span>
          </button>

          {/* Subcity Selector */}
          <select
            className="admin-select"
            value={subcityFilter}
            onChange={(e) => setSubcityFilter(e.target.value)}
          >
            {ADDIS_SUBCITIES.map((sc) => (
              <option key={sc} value={sc}>
                {sc === 'All' ? 'All Subcities' : sc}
              </option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="admin-search-box">
          <Search size={16} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Users Table */}
      <div className="admin-table-container">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>User Name & Contact</th>
              <th>Role</th>
              <th>Profession / Specialization</th>
              <th>Subcity</th>
              <th>Connects</th>
              <th>Verification</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)' }}>
                  <Users size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                  <div>No users found matching your criteria.</div>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="admin-user-cell">
                      <div className="admin-avatar-circle">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.fullName} />
                        ) : (
                          u.fullName?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="admin-user-details">
                        <span className="admin-user-primary-text">
                          {u.fullName}
                          {u.isFeatured && (
                            <Star
                              size={13}
                              fill="#f59e0b"
                              color="#f59e0b"
                              style={{ marginLeft: '4px', verticalAlign: 'middle' }}
                            />
                          )}
                        </span>
                        <span className="admin-user-sub-text">
                          {u.phone} {u.email ? `· ${u.email}` : ''}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        u.role === 'provider'
                          ? 'admin-badge-purple'
                          : u.role === 'admin'
                          ? 'admin-badge-danger'
                          : 'admin-badge-primary'
                      }`}
                    >
                      {u.role === 'provider'
                        ? 'Technician'
                        : u.role === 'admin'
                        ? 'Admin'
                        : 'Customer'}
                    </span>
                  </td>
                  <td>
                    {u.role === 'provider' ? (
                      <span style={{ fontWeight: 600 }}>{u.profession || 'General Repair'}</span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>—</span>
                    )}
                  </td>
                  <td>📍 {u.subcity || 'Bole'}</td>
                  <td>
                    {u.role === 'provider' ? (
                      <span style={{ fontWeight: 700, color: 'var(--admin-primary)' }}>
                        {u.connectsBalance ?? 5} Connects
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>—</span>
                    )}
                  </td>
                  <td>
                    {u.isVerified ? (
                      <span className="admin-badge admin-badge-success">Verified</span>
                    ) : u.role === 'provider' ? (
                      <span className="admin-badge admin-badge-warning">Unverified</span>
                    ) : (
                      <span className="admin-badge admin-badge-neutral">Active</span>
                    )}
                  </td>
                  <td>
                    <div className="admin-table-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="admin-btn-icon"
                        title="Edit User & Connects"
                        onClick={() => handleOpenEdit(u)}
                      >
                        <Edit2 size={16} />
                      </button>

                      {u.role !== 'admin' && (
                        <button
                          type="button"
                          className="admin-btn-icon delete"
                          title="Delete User"
                          onClick={() => handleDeleteUser(u)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="admin-modal-backdrop" onClick={() => setEditingUser(null)}>
          <div className="admin-modal-box" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 className="admin-modal-title">Edit User Details</h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {editingUser.fullName} ({editingUser.role})
                </div>
              </div>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setEditingUser(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="admin-modal-body">
                {/* Connects Balance (for technicians) */}
                {editingUser.role === 'provider' && (
                  <div className="admin-form-group">
                    <label>
                      <Coins size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      Connects Balance
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        className="admin-input"
                        value={editConnects}
                        onChange={(e) => setEditConnects(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="admin-header-btn"
                        onClick={() => setEditConnects((prev) => Number(prev) + 10)}
                        title="Add 10 bonus connects"
                      >
                        +10
                      </button>
                      <button
                        type="button"
                        className="admin-header-btn"
                        onClick={() => setEditConnects((prev) => Number(prev) + 25)}
                        title="Add 25 bonus connects"
                      >
                        +25
                      </button>
                    </div>
                  </div>
                )}

                {/* Subcity selection */}
                <div className="admin-form-group">
                  <label>Assigned Subcity</label>
                  <select
                    className="admin-select"
                    style={{ width: '100%' }}
                    value={editSubcity}
                    onChange={(e) => setEditSubcity(e.target.value)}
                  >
                    {ADDIS_SUBCITIES.filter((s) => s !== 'All').map((sc) => (
                      <option key={sc} value={sc}>
                        {sc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Verification Toggle */}
                <div className="admin-form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editVerified}
                      onChange={(e) => setEditVerified(e.target.checked)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontWeight: 600 }}>Mark as Verified Professional</span>
                  </label>
                </div>

                {/* Featured Toggle (for providers) */}
                {editingUser.role === 'provider' && (
                  <div className="admin-form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={editFeatured}
                        onChange={(e) => setEditFeatured(e.target.checked)}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ fontWeight: 600 }}>Promote as Featured Technician on Homepage</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-header-btn"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  style={{ width: 'auto', padding: '8px 20px' }}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
