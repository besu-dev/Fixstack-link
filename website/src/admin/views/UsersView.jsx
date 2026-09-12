import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Trash2,
} from 'lucide-react';
import { adminApi, resolveMediaUrl } from '../../api/adminApi';

export default function UsersView({ onDataChanged }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers({
        role: roleFilter !== 'all' ? roleFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
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
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
              <th style={{ minWidth: '240px' }}>User Name & Contact</th>
              <th style={{ minWidth: '120px' }}>Role</th>
              <th style={{ minWidth: '120px' }}>Subcity</th>
              <th style={{ minWidth: '120px' }}>Verification</th>
              <th style={{ width: '80px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '30px' }}>
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)' }}>
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
                          <img src={resolveMediaUrl(u.avatarUrl)} alt={u.fullName} />
                        ) : (
                          u.fullName?.charAt(0)?.toUpperCase() || 'U'
                        )}
                      </div>
                      <div className="admin-user-details">
                        <span className="admin-user-primary-text">
                          {u.fullName}
                        </span>
                        <span className="admin-user-sub-text">
                          {u.phone} {u.email ? `· ${u.email}` : ''}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>{u.role === 'provider' ? 'Technician' : 'Customer'}</div>
                    {u.role === 'provider' && u.profession && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                        {u.profession}
                      </div>
                    )}
                  </td>
                  <td>{u.subcity || 'Addis Ababa'}</td>
                  <td style={{ color: 'var(--admin-text-main)' }}>
                    {u.isVerified ? 'Verified' : u.role === 'provider' ? 'Unverified' : 'Active'}
                  </td>
                  <td>
                    <div className="admin-table-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="admin-action-btn delete"
                        title="Delete User"
                        onClick={() => handleDeleteUser(u)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
