import React, { useState, useEffect, useCallback } from 'react';
import {
  Wrench,
  Search,
  Eye,
  X,
  ZoomIn,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';

export default function JobsView({ onDataChanged }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Detail modal state
  const [selectedJob, setSelectedJob] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getJobs({
        status: statusFilter,
        search: searchQuery || undefined,
      });
      setJobs(data.jobs || []);
    } catch (err) {
      console.error('Failed to load jobs', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleOpenDetail = (job) => {
    setSelectedJob(job);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedJob) return;

    setUpdatingStatus(true);
    try {
      await adminApi.updateJobStatus(selectedJob._id, { status: newStatus });
      setSelectedJob((prev) => ({ ...prev, status: newStatus }));
      fetchJobs();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert('Failed to update job status: ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div>
      {/* Controls & Filter Tabs */}
      <div className="admin-table-controls">
        <div className="admin-filters-group">
          <button
            type="button"
            className={`admin-header-btn ${statusFilter === 'all' ? 'admin-btn-back-website' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            <span>All Requests</span>
          </button>
          <button
            type="button"
            className={`admin-header-btn ${statusFilter === 'open' ? 'admin-btn-back-website' : ''}`}
            onClick={() => setStatusFilter('open')}
          >
            <span>Open ({jobs.filter((j) => j.status === 'open').length})</span>
          </button>
          <button
            type="button"
            className={`admin-header-btn ${statusFilter === 'assigned' ? 'admin-btn-back-website' : ''}`}
            onClick={() => setStatusFilter('assigned')}
          >
            <span>Assigned</span>
          </button>
          <button
            type="button"
            className={`admin-header-btn ${statusFilter === 'completed' ? 'admin-btn-back-website' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            <span>Completed</span>
          </button>
          <button
            type="button"
            className={`admin-header-btn ${statusFilter === 'cancelled' ? 'admin-btn-back-website' : ''}`}
            onClick={() => setStatusFilter('cancelled')}
          >
            <span>Cancelled</span>
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="admin-search-box">
          <Search size={16} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search job title, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Jobs Table */}
      <div className="admin-table-container">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>Service Request</th>
              <th>Category</th>
              <th>Customer</th>
              <th>Assigned Technician</th>
              <th>Budget</th>
              <th>Urgency</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>
                  Loading service requests...
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)' }}>
                  <Wrench size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                  <div>No service requests match the selected criteria.</div>
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job._id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--admin-text-main)' }}>
                      {job.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      📍 {job.subcity} {job.specificLocation ? `· ${job.specificLocation}` : ''}
                    </div>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge-neutral">
                      {job.category}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{job.customer?.fullName || 'Anonymous'}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{job.customer?.phone}</div>
                  </td>
                  <td>
                    {job.assignedProvider ? (
                      <div>
                        <div style={{ fontWeight: 600, color: '#0052cc' }}>
                          {job.assignedProvider.fullName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {job.assignedProvider.phone}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>
                        Open for Bids
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700 }}>{job.budget} ETB</span>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        job.urgency === 'Emergency'
                          ? 'admin-badge-danger'
                          : job.urgency === 'Today'
                          ? 'admin-badge-warning'
                          : 'admin-badge-neutral'
                      }`}
                    >
                      {job.urgency}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        job.status === 'completed'
                          ? 'admin-badge-success'
                          : job.status === 'assigned'
                          ? 'admin-badge-purple'
                          : job.status === 'open'
                          ? 'admin-badge-primary'
                          : 'admin-badge-danger'
                      }`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="admin-btn-icon"
                        title="View Full Job Details & Bids"
                        onClick={() => handleOpenDetail(job)}
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedJob(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 className="admin-modal-title">{selectedJob.title}</h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Category: {selectedJob.category} · Budget: {selectedJob.budget} ETB
                </div>
              </div>
              <button
                type="button"
                className="admin-modal-close-btn"
                onClick={() => setSelectedJob(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Description */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Problem Description
                </div>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', fontSize: '0.88rem', lineHeight: '1.5' }}>
                  {selectedJob.description}
                </div>
              </div>

              {/* Location & Parties Snapshot */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '18px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Customer Details
                  </div>
                  <div style={{ fontWeight: 700, marginTop: '4px' }}>
                    {selectedJob.customer?.fullName || 'Anonymous'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                    📞 {selectedJob.customer?.phone || 'No phone'}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                    📍 {selectedJob.subcity} ({selectedJob.specificLocation || 'General area'})
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                    Assigned Technician
                  </div>
                  {selectedJob.assignedProvider ? (
                    <>
                      <div style={{ fontWeight: 700, marginTop: '4px', color: '#0052cc' }}>
                        {selectedJob.assignedProvider.fullName}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                        📞 {selectedJob.assignedProvider.phone}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                        ★ {selectedJob.assignedProvider.rating || 5.0} Rating
                      </div>
                    </>
                  ) : (
                    <div style={{ marginTop: '8px', fontStyle: 'italic', color: '#94a3b8' }}>
                      No technician assigned yet (Job is currently open).
                    </div>
                  )}
                </div>
              </div>

              {/* Photos Gallery */}
              {selectedJob.photos?.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Damage & Site Photos
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {selectedJob.photos.map((photo, i) => (
                      <div
                        key={i}
                        style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #e2e8f0', position: 'relative' }}
                        onClick={() => setLightboxImage(photo)}
                      >
                        <img src={photo} alt="Damage site" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div className="admin-doc-zoom-hint" style={{ bottom: 4, right: 4 }}>
                          <ZoomIn size={10} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Status Override Controls */}
              <div style={{ background: '#eff6ff', padding: '14px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e40af', marginBottom: '8px' }}>
                  Admin Status Controls (Override / Dispute Resolution):
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`admin-header-btn ${selectedJob.status === 'open' ? 'admin-btn-back-website' : ''}`}
                    onClick={() => handleStatusChange('open')}
                    disabled={updatingStatus}
                  >
                    Set as Open
                  </button>
                  <button
                    type="button"
                    className={`admin-header-btn ${selectedJob.status === 'assigned' ? 'admin-btn-back-website' : ''}`}
                    onClick={() => handleStatusChange('assigned')}
                    disabled={updatingStatus}
                  >
                    Set as In-Progress
                  </button>
                  <button
                    type="button"
                    className={`admin-header-btn ${selectedJob.status === 'completed' ? 'admin-btn-back-website' : ''}`}
                    onClick={() => handleStatusChange('completed')}
                    disabled={updatingStatus}
                  >
                    Mark as Completed
                  </button>
                  <button
                    type="button"
                    className={`admin-header-btn ${selectedJob.status === 'cancelled' ? 'admin-btn-back-website' : ''}`}
                    onClick={() => handleStatusChange('cancelled')}
                    disabled={updatingStatus}
                  >
                    Cancel Request
                  </button>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-header-btn"
                onClick={() => setSelectedJob(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Photo Lightbox */}
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
            alt="Damage photo full preview"
            className="admin-lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
