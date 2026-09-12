import React, { useState, useEffect } from 'react';
import { Tag, Search, Flame, CheckCircle, Clock, XCircle } from 'lucide-react';
import { adminApi } from '../../api/adminApi';

export default function BidsView() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchBids = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getBids({ status: statusFilter });
      setBids(data.bids || []);
    } catch (err) {
      console.error('Failed to load bids', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();
  }, [statusFilter]);

  return (
    <div>
      {/* Controls */}
      <div className="admin-table-controls">
        <div className="admin-filters-group">
          <button
            type="button"
            className={`admin-header-btn ${statusFilter === 'all' ? 'admin-btn-back-website' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            <span>All Quotes</span>
          </button>
          <button
            type="button"
            className={`admin-header-btn ${statusFilter === 'pending' ? 'admin-btn-back-website' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            <span>Pending</span>
          </button>
          <button
            type="button"
            className={`admin-header-btn ${statusFilter === 'accepted' ? 'admin-btn-back-website' : ''}`}
            onClick={() => setStatusFilter('accepted')}
          >
            <span>Accepted</span>
          </button>
          <button
            type="button"
            className={`admin-header-btn ${statusFilter === 'rejected' ? 'admin-btn-back-website' : ''}`}
            onClick={() => setStatusFilter('rejected')}
          >
            <span>Declined</span>
          </button>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
          Showing <strong>{bids.length}</strong> bids
        </div>
      </div>

      {/* Bids Table */}
      <div className="admin-table-container">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>Technician</th>
              <th>Target Job</th>
              <th>Quoted Price</th>
              <th>Platform Fee</th>
              <th>Total (ETB)</th>
              <th>Placement</th>
              <th>Status</th>
              <th>Technician Note</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>
                  Loading bids...
                </td>
              </tr>
            ) : bids.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)' }}>
                  <Tag size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                  <div>No technician bids found matching this filter.</div>
                </td>
              </tr>
            ) : (
              bids.map((bid) => (
                <tr key={bid._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--admin-text-main)' }}>
                      {bid.provider?.fullName || 'Technician'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {bid.provider?.phone} {bid.provider?.profession ? `· ${bid.provider.profession}` : ''}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{bid.job?.title || 'Service Request'}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Category: {bid.job?.category} · Budget: {bid.job?.budget} ETB
                    </div>
                  </td>
                  <td>{bid.price} ETB</td>
                  <td>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>
                      +{bid.serviceFee || Math.round(bid.price * 0.05)} ETB
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--admin-primary)' }}>
                      {bid.totalAmount || bid.price + (bid.serviceFee || 0)} ETB
                    </span>
                  </td>
                  <td>
                    {bid.isBoosted ? (
                      <span className="admin-badge admin-badge-danger" title="Technician spent connects for #1 top placement">
                        <Flame size={12} fill="#ef4444" /> Boosted #1
                      </span>
                    ) : (
                      <span className="admin-badge admin-badge-neutral">
                        Standard
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        bid.status === 'accepted'
                          ? 'admin-badge-success'
                          : bid.status === 'rejected'
                          ? 'admin-badge-danger'
                          : 'admin-badge-warning'
                      }`}
                    >
                      {bid.status}
                    </span>
                  </td>
                  <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#475569' }} title={bid.note}>
                    {bid.note || 'No custom note attached.'}
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
