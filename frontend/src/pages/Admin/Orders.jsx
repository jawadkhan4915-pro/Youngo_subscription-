import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Eye, Check, X, ShieldAlert, CheckCircle2, Clock, Image as ImageIcon } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import Navbar from '../../components/Navbar.jsx';
import api from '../../services/api.js';
import '../dashboard.css';

const AdminOrders = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verification details
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/admin/pending-payments');
      if (res.data?.success) {
        setPayments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load pending payments list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleProcessPayment = async (status) => { // status: 'Approved' or 'Rejected'
    if (!selectedPayment) return;
    
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/orders/admin/verify-payment', {
        paymentId: selectedPayment._id,
        status,
        notes
      });

      if (res.data?.success) {
        setSuccess(`Payment verification processed as: ${status}`);
        setSelectedPayment(null);
        setNotes('');
        fetchPayments();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Verification action failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-page-container">
        <Sidebar isAdminPanel={true} />

        <main className="workspace-content">
          <div className="workspace-header">
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Receipt Verifier</h1>
              <p style={{ color: 'var(--text-muted)' }}>Audit bank transfer receipts, approve user credit allocations, or cancel orders.</p>
            </div>
          </div>

          {success && <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--color-success)', color: 'var(--color-success)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>{success}</div>}
          {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>{error}</div>}

          {/* Pending receipts list */}
          <div className="data-table-container">
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading pending manual transfers...</div>
            ) : payments.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                <CheckCircle2 size={32} style={{ color: 'var(--color-success)' }} />
                <h4>No Pending Payments</h4>
                <p style={{ fontSize: '0.85rem' }}>All manual checkout transactions have been processed.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Payment Method</th>
                    <th>Ref ID / Trx</th>
                    <th>Subtotal (PKR)</th>
                    <th>Receipt Proof</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <strong>{p.user?.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{p.user?.email}</span>
                      </td>
                      <td>{p.order?.paymentMethod || 'Manual'}</td>
                      <td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.transactionId}</span></td>
                      <td>{p.order?.totalAmount} PKR</td>
                      <td>
                        <button onClick={() => setSelectedPayment(p)} className="gradient-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: 'var(--bg-card-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', boxShadow: 'none' }}>
                          <Eye size={12} /> View Receipt
                        </button>
                      </td>
                      <td>
                        <button onClick={() => setSelectedPayment(p)} className="gradient-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                          Process Checkout
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Screenshot verification Modal */}
          {selectedPayment && (
            <div className="modal-overlay" onClick={() => { if (!actionLoading) setSelectedPayment(null); }}>
              <div className="modal-container glass-card" style={{ maxWidth: '650px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} onClick={(e) => e.stopPropagation()}>
                
                {/* Left: receipt image preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <ImageIcon size={14} /> Uploaded Screenshot:
                  </span>
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '350px', background: 'var(--bg-main)' }}>
                    <a href={selectedPayment.screenshotUrl} target="_blank" rel="noreferrer" title="Click to view full size">
                      <img src={selectedPayment.screenshotUrl} alt="Receipt proof" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </a>
                  </div>
                </div>

                {/* Right: metadata audit forms */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ marginBottom: '1rem' }}>Verify Receipt</h3>
                    <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                      <div>User: <strong style={{ color: 'var(--text-main)' }}>{selectedPayment.user?.name}</strong></div>
                      <div>Payable: <strong style={{ color: 'var(--color-accent)' }}>{selectedPayment.order?.totalAmount} PKR</strong></div>
                      <div>Ref Code: <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>{selectedPayment.transactionId}</strong></div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Review note (Required if rejecting)</label>
                      <textarea
                        className="form-input"
                        rows={4}
                        placeholder="Add reason for approval or rejection receipt mismatch..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleProcessPayment('Rejected')}
                      className="gradient-btn"
                      style={{ flex: 1, justifyContent: 'center', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', boxShadow: 'none' }}
                    >
                      <X size={16} /> Reject
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleProcessPayment('Approved')}
                      className="gradient-btn"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <Check size={16} /> Approve
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
};

export default AdminOrders;
