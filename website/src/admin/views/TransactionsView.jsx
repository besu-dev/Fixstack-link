import React, { useState, useEffect } from 'react';
import { CreditCard, Banknote, Smartphone, CheckCircle, Clock } from 'lucide-react';
import { adminApi } from '../../api/adminApi';

export default function TransactionsView() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getTransactions();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Failed to load transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const totalETB = transactions.reduce((sum, t) => sum + (t.amountETB || 0), 0);
  const totalConnects = transactions.reduce((sum, t) => sum + (t.connects || 0), 0);

  return (
    <div>
      {/* Metrics Row */}
      <div className="admin-metrics-grid" style={{ marginBottom: '24px' }}>
        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <span className="admin-metric-title">Total Processed</span>
            <div className="admin-metric-icon-box admin-metric-icon-green">
              <Banknote size={20} />
            </div>
          </div>
          <div className="admin-metric-val">
            {totalETB.toLocaleString()} <span style={{ fontSize: '1rem', fontWeight: 600 }}>ETB</span>
          </div>
          <div className="admin-metric-bottom">
            <span>Telebirr & CBE Birr volume</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <span className="admin-metric-title">Connects Issued</span>
            <div className="admin-metric-icon-box admin-metric-icon-purple">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="admin-metric-val">
            {totalConnects} <span style={{ fontSize: '1rem', fontWeight: 600 }}>Connects</span>
          </div>
          <div className="admin-metric-bottom">
            <span>Purchased by technicians</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-top">
            <span className="admin-metric-title">Mobile Money Gateway</span>
            <div className="admin-metric-icon-box admin-metric-icon-blue">
              <Smartphone size={20} />
            </div>
          </div>
          <div className="admin-metric-val">Telebirr / CBE</div>
          <div className="admin-metric-bottom">
            <span className="admin-trend-badge positive">Instant reconciliation</span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="admin-table-container">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>Technician / User</th>
              <th>Transaction Type</th>
              <th>Amount (ETB)</th>
              <th>Connects</th>
              <th>Gateway</th>
              <th>Reference ID</th>
              <th>Status</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>
                  Loading transaction history...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--admin-text-muted)' }}>
                  <CreditCard size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                  <div>No wallet transactions recorded yet.</div>
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx._id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>
                      {tx.user?.fullName || 'User'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {tx.user?.phone}
                    </div>
                  </td>
                  <td>
                    <span className="admin-badge admin-badge-primary">
                      {tx.type?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700 }}>
                      {tx.amountETB ? `${tx.amountETB} ETB` : '—'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#8b5cf6' }}>
                      +{tx.connects}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        tx.paymentMethod === 'telebirr'
                          ? 'admin-badge-success'
                          : tx.paymentMethod === 'cbebirr'
                          ? 'admin-badge-purple'
                          : 'admin-badge-neutral'
                      }`}
                    >
                      {tx.paymentMethod}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    {tx.referenceTxId || '—'}
                  </td>
                  <td>
                    <span className="admin-badge admin-badge-success">
                      {tx.status || 'completed'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {new Date(tx.createdAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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
