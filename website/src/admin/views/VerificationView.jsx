import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  AlertTriangle,
  ZoomIn,
  X,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { adminApi, resolveMediaUrl } from '../../api/adminApi';

export default function VerificationView({ onDataChanged }) {
  const [filterTab, setFilterTab] = useState('pending'); // 'pending' | 'verified' | 'rejected'
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Rejection feedback state
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchVerifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getPendingVerifications(filterTab);
      setProviders(data.providers || []);
    } catch (err) {
      console.error('Failed to load verifications', err);
    } finally {
      setLoading(false);
    }
  }, [filterTab]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const handleApprove = async (provider) => {
    if (!confirm(`Are you sure you want to approve and verify ${provider.fullName}? This will grant them 10 welcome connects and display the verified badge.`)) {
      return;
    }

    setProcessing(true);
    try {
      await adminApi.verifyProvider(provider._id, {
        isVerified: true,
        bonusConnects: 10,
      });
      fetchVerifications();
      if (selectedProvider?._id === provider._id) {
        setSelectedProvider(null);
      }
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert('Error approving technician: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please enter a rejection reason so the technician knows what to correct.');
      return;
    }

    setProcessing(true);
    try {
      await adminApi.verifyProvider(rejectingId, {
        isVerified: false,
        rejectionReason: rejectReason.trim(),
      });
      setRejectingId(null);
      setRejectReason('');
      fetchVerifications();
      if (selectedProvider?._id === rejectingId) {
        setSelectedProvider(null);
      }
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert('Error rejecting technician: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleFeatured = async (provider) => {
    try {
      await adminApi.toggleFeatured(provider._id);
      fetchVerifications();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert('Failed to toggle featured status: ' + err.message);
    }
  };

  return (
    <div>
      {/* Tab Filter Controls */}
      <div className="admin-table-controls">
        <div className="admin-filters-group">
          <button
            type="button"
            className={`admin-header-btn ${filterTab === 'pending' ? 'admin-btn-back-website' : ''}`}
            onClick={() => setFilterTab('pending')}
          >
            <CheckCircle2 size={16} />
            <span>Approve</span>
          </button>
          <button
            type="button"
            className={`admin-header-btn ${filterTab === 'rejected' ? 'admin-btn-back-website' : ''}`}
            onClick={() => setFilterTab('rejected')}
          >
            <XCircle size={16} />
            <span>Reject</span>
          </button>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
          Showing <strong>{providers.length}</strong> technician records
        </div>
      </div>

      {/* Technicians Table */}
      <div className="admin-table-container">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th style={{ minWidth: '240px' }}>Technician</th>
              <th style={{ minWidth: '160px' }}>Profession & Subcity</th>
              <th style={{ minWidth: '120px' }}>Experience</th>
              <th style={{ minWidth: '120px' }}>Status</th>
              <th style={{ textAlign: 'right', width: '150px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '30px' }}>
                  Loading verification queue...
                </td>
              </tr>
            ) : providers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)' }}>
                  <ShieldCheck size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                  <div>No technicians currently match the <strong>"{filterTab}"</strong> filter.</div>
                </td>
              </tr>
            ) : (
              providers.map((p) => (
                <tr key={p._id}>
                  <td
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedProvider(p)}
                    title="Click to view technician documents"
                  >
                    <div className="admin-user-cell">
                      <div className="admin-avatar-circle">
                        {p.avatarUrl ? (
                          <img src={resolveMediaUrl(p.avatarUrl)} alt={p.fullName} />
                        ) : (
                          p.fullName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="admin-user-details">
                        <span className="admin-user-primary-text">
                          {p.fullName}
                        </span>
                        <span className="admin-user-sub-text">
                          {p.phone} {p.email ? `· ${p.email}` : ''}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.profession || 'General'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.subcity || 'Addis Ababa'}</div>
                  </td>
                  <td>{p.experience || '1 - 3 years'}</td>
                  <td style={{ color: 'var(--admin-text-main)' }}>
                    {p.isVerified
                      ? 'Verified'
                      : p.rejectionReason
                      ? 'Rejected'
                      : 'Pending Review'}
                  </td>
                  <td>
                    <div className="admin-table-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="admin-header-btn"
                        style={{
                          padding: '6px 14px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                        }}
                        title="View National ID & Trade Certificate"
                        onClick={() => setSelectedProvider(p)}
                      >
                        <FileText size={15} />
                        <span>National ID & Certificate</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Document Inspection Modal */}
      {selectedProvider && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedProvider(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 className="admin-modal-title">Documents — {selectedProvider.fullName}</h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  National ID & Trade Certificate
                </div>
              </div>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setSelectedProvider(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Documents Grid */}
              <div className="admin-doc-grid">
                {/* National ID Card */}
                <div className="admin-doc-card">
                  <div className="admin-doc-header">
                    <span>National ID</span>
                    {selectedProvider.kebeleIdUrl && (
                      <a
                        href={resolveMediaUrl(selectedProvider.kebeleIdUrl)}
                        target="_blank"
                        rel="noreferrer"
                        title="Open full size"
                        style={{ color: 'var(--admin-primary)' }}
                      >
                        <Download size={14} />
                      </a>
                    )}
                  </div>
                  <div
                    className="admin-doc-preview-box"
                    onClick={() => {
                      if (selectedProvider.kebeleIdUrl) {
                        setLightboxImage(resolveMediaUrl(selectedProvider.kebeleIdUrl));
                      }
                    }}
                  >
                    {selectedProvider.kebeleIdUrl ? (
                      <>
                        <img src={resolveMediaUrl(selectedProvider.kebeleIdUrl)} alt="National ID" />
                        <div className="admin-doc-zoom-hint">
                          <ZoomIn size={12} /> Click to enlarge
                        </div>
                      </>
                    ) : (
                      <div style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', padding: '20px' }}>
                        <FileText size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                        <div>No National ID uploaded</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Trade Certificate / License */}
                <div className="admin-doc-card">
                  <div className="admin-doc-header">
                    <span>Trade Certificate / License</span>
                    {selectedProvider.tradeCertUrl && (
                      <a
                        href={resolveMediaUrl(selectedProvider.tradeCertUrl)}
                        target="_blank"
                        rel="noreferrer"
                        title="Open full size"
                        style={{ color: 'var(--admin-primary)' }}
                      >
                        <Download size={14} />
                      </a>
                    )}
                  </div>
                  <div
                    className="admin-doc-preview-box"
                    onClick={() => {
                      if (selectedProvider.tradeCertUrl) {
                        setLightboxImage(resolveMediaUrl(selectedProvider.tradeCertUrl));
                      }
                    }}
                  >
                    {selectedProvider.tradeCertUrl ? (
                      <>
                        <img src={resolveMediaUrl(selectedProvider.tradeCertUrl)} alt="Trade Certificate" />
                        <div className="admin-doc-zoom-hint">
                          <ZoomIn size={12} /> Click to enlarge
                        </div>
                      </>
                    ) : (
                      <div style={{ color: '#64748b', fontSize: '0.8rem', textAlign: 'center', padding: '20px' }}>
                        <FileText size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                        <div>No Trade Cert uploaded</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedProvider.rejectionReason && (
                <div className="admin-error-banner" style={{ marginTop: '16px' }}>
                  <AlertTriangle size={18} />
                  <span>Previous Rejection Reason: {selectedProvider.rejectionReason}</span>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-header-btn"
                onClick={() => setSelectedProvider(null)}
              >
                Close
              </button>

              {!selectedProvider.isVerified ? (
                <>
                  <button
                    type="button"
                    className="admin-header-btn"
                    style={{ background: 'var(--admin-danger-light)', color: '#b91c1c', borderColor: 'transparent' }}
                    onClick={() => {
                      setRejectingId(selectedProvider._id);
                      setRejectReason(selectedProvider.rejectionReason || '');
                    }}
                  >
                    <XCircle size={16} />
                    <span>Reject</span>
                  </button>
                  <button
                    type="button"
                    className="admin-btn-primary"
                    style={{ width: 'auto', padding: '8px 18px' }}
                    onClick={() => handleApprove(selectedProvider)}
                    disabled={processing}
                  >
                    <CheckCircle2 size={16} />
                    <span>Approve</span>
                  </button>
                </>
              ) : (
                <span className="admin-badge admin-badge-success" style={{ padding: '8px 14px' }}>
                  <BadgeCheck size={16} /> Technician is Verified
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Prompt Modal */}
      {rejectingId && (
        <div className="admin-modal-backdrop" onClick={() => setRejectingId(null)}>
          <div className="admin-modal-box" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Rejection / Revision Notice</h3>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setRejectingId(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ fontSize: '0.88rem', color: '#475569', marginTop: 0 }}>
                Please provide specific feedback for the technician (e.g. <em>"National ID photo is blurry, please re-upload a readable copy"</em>):
              </p>
              <textarea
                className="admin-input"
                style={{ width: '100%', height: '110px', padding: '12px', resize: 'vertical' }}
                placeholder="Reason for rejection or resubmission request..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-header-btn"
                onClick={() => setRejectingId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-header-btn"
                style={{ background: '#ef4444', color: 'white', borderColor: 'transparent' }}
                onClick={handleConfirmReject}
                disabled={processing}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Document Lightbox */}
      {lightboxImage && (
        <div className="admin-lightbox-backdrop" onClick={() => setLightboxImage(null)}>
          <button
            type="button"
            className="admin-lightbox-close"
            onClick={() => setLightboxImage(null)}
          >
            <X size={24} />
          </button>
          <img
            src={lightboxImage}
            alt="Document inspection full preview"
            className="admin-lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
