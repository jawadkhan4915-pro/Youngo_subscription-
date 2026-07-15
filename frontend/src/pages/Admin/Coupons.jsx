import React, { useEffect, useState } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, XCircle, Clock, Percent, DollarSign } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import Navbar from '../../components/Navbar.jsx';
import api from '../../services/api.js';
import '../dashboard.css';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [type, setType] = useState('Percentage');
  const [value, setValue] = useState('');
  const [minPurchase, setMinPurchase] = useState('0');
  const [maxDiscount, setMaxDiscount] = useState('0');
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('100');

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/coupons');
      if (res.data?.success) {
        setCoupons(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
      setError('Failed to load coupons. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFormLoading(true);

    try {
      const res = await api.post('/coupons', {
        code,
        type,
        value: Number(value),
        minPurchase: Number(minPurchase),
        maxDiscount: Number(maxDiscount),
        expiryDate,
        usageLimit: Number(usageLimit)
      });

      if (res.data?.success) {
        setSuccess(`Coupon "${res.data.data.code}" created successfully!`);
        setCode('');
        setValue('');
        setMinPurchase('0');
        setMaxDiscount('0');
        setExpiryDate('');
        setUsageLimit('100');
        fetchCoupons();
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create coupon. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${code}"? This action cannot be undone.`)) return;
    setError('');
    setSuccess('');
    try {
      const res = await api.delete(`/coupons/${id}`);
      if (res.data?.success) {
        setSuccess(`Coupon "${code}" deleted successfully.`);
        fetchCoupons();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete coupon.');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active':
        return { background: 'rgba(34,197,94,0.12)', color: 'var(--color-success)' };
      case 'Expired':
        return { background: 'rgba(239,68,68,0.12)', color: 'var(--color-danger)' };
      case 'Disabled':
        return { background: 'rgba(100,116,139,0.15)', color: 'var(--text-muted)' };
      default:
        return {};
    }
  };

  const isExpired = (date) => new Date(date) < new Date();

  // Tomorrow date for min expiry
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <>
      <Navbar />
      <div className="dashboard-page-container">
        <Sidebar isAdminPanel={true} />

        <main className="workspace-content" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div className="workspace-header">
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Coupon Manager</h1>
              <p style={{ color: 'var(--text-muted)' }}>
                Create, view, and manage discount coupon codes for user checkout.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                background: 'rgba(79,70,229,0.1)',
                border: '1px solid rgba(79,70,229,0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                color: 'var(--color-primary)',
                fontWeight: 600
              }}>
                {coupons.filter(c => c.status === 'Active' && !isExpired(c.expiryDate)).length} Active
              </div>
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                color: 'var(--color-danger)',
                fontWeight: 600
              }}>
                {coupons.filter(c => isExpired(c.expiryDate)).length} Expired
              </div>
            </div>
          </div>

          {/* Global status messages */}
          {success && (
            <div style={{
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid var(--color-success)',
              color: 'var(--color-success)',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle2 size={16} /> {success}
            </div>
          )}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid var(--color-danger)',
              color: 'var(--color-danger)',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <XCircle size={16} /> {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '2rem', alignItems: 'start' }}>

            {/* Create Coupon Form */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                <Plus size={18} style={{ color: 'var(--color-primary)' }} /> Create New Coupon
              </h3>

              <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Coupon Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. SUMMER25"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                    style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.1em' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                    Will be auto-converted to uppercase.
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Discount Type</label>
                    <select
                      className="form-input"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      required
                    >
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Fixed">Fixed Amount (PKR)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {type === 'Percentage' ? 'Discount (%)' : 'Discount Amount (PKR)'}
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder={type === 'Percentage' ? '25' : '500'}
                      value={value}
                      min="0"
                      max={type === 'Percentage' ? '100' : undefined}
                      onChange={(e) => setValue(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Min. Purchase (PKR)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      value={minPurchase}
                      min="0"
                      onChange={(e) => setMinPurchase(e.target.value)}
                    />
                  </div>

                  {type === 'Percentage' && (
                    <div className="form-group">
                      <label className="form-label">Max Discount Cap (PKR)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="0 = no cap"
                        value={maxDiscount}
                        min="0"
                        onChange={(e) => setMaxDiscount(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={expiryDate}
                      min={minDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Total Usage Limit</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="100"
                      value={usageLimit}
                      min="1"
                      onChange={(e) => setUsageLimit(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="gradient-btn"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                >
                  <Tag size={16} />
                  {formLoading ? 'Creating Coupon...' : 'Create Coupon Code'}
                </button>
              </form>
            </div>

            {/* Coupons Table */}
            <div>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag size={18} /> Active Coupons ({coupons.length})
              </h3>
              <div className="data-table-container">
                {loading ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading coupon database...
                  </div>
                ) : coupons.length === 0 ? (
                  <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Tag size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p>No coupons created yet. Create your first coupon using the form on the left.</p>
                  </div>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Type / Value</th>
                        <th>Min Purchase</th>
                        <th>Usage</th>
                        <th>Expiry</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((coupon) => {
                        const expired = isExpired(coupon.expiryDate);
                        const effectiveStatus = expired ? 'Expired' : coupon.status;
                        return (
                          <tr key={coupon._id}>
                            <td>
                              <code style={{
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                background: 'var(--bg-main)',
                                padding: '0.2rem 0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)',
                                color: expired ? 'var(--text-muted)' : 'var(--color-accent)',
                                letterSpacing: '0.05em'
                              }}>
                                {coupon.code}
                              </code>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                {coupon.type === 'Percentage'
                                  ? <><Percent size={14} style={{ color: 'var(--color-primary)' }} /> {coupon.value}% off</>
                                  : <><DollarSign size={14} style={{ color: 'var(--color-success)' }} /> PKR {coupon.value}</>
                                }
                              </div>
                              {coupon.type === 'Percentage' && coupon.maxDiscount > 0 && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  Max: PKR {coupon.maxDiscount}
                                </span>
                              )}
                            </td>
                            <td>
                              {coupon.minPurchase > 0
                                ? <span>PKR {coupon.minPurchase}</span>
                                : <span style={{ color: 'var(--text-muted)' }}>None</span>
                              }
                            </td>
                            <td>
                              <div style={{ fontSize: '0.9rem' }}>
                                <strong>{coupon.usedCount}</strong>
                                <span style={{ color: 'var(--text-muted)' }}> / {coupon.usageLimit}</span>
                              </div>
                              <div style={{
                                height: '4px',
                                background: 'var(--bg-main)',
                                borderRadius: '2px',
                                marginTop: '0.3rem',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  height: '100%',
                                  width: `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%`,
                                  background: coupon.usedCount >= coupon.usageLimit ? 'var(--color-danger)' : 'var(--color-primary)',
                                  borderRadius: '2px'
                                }} />
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                                <Clock size={13} style={{ color: expired ? 'var(--color-danger)' : 'var(--text-muted)' }} />
                                <span style={{ color: expired ? 'var(--color-danger)' : 'var(--text-main)' }}>
                                  {new Date(coupon.expiryDate).toLocaleDateString('en-PK', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span style={{
                                fontSize: '0.78rem',
                                padding: '0.25rem 0.6rem',
                                borderRadius: 'var(--radius-full)',
                                fontWeight: 600,
                                ...getStatusStyle(effectiveStatus)
                              }}>
                                {effectiveStatus}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => handleDelete(coupon._id, coupon.code)}
                                className="theme-toggle"
                                title="Delete coupon"
                                style={{ padding: '0.4rem' }}
                              >
                                <Trash2 size={16} style={{ color: 'var(--color-danger)' }} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Summary Stats */}
              {coupons.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
                  <div className="glass-card" style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {coupons.filter(c => !isExpired(c.expiryDate) && c.status === 'Active').length}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Active Codes</div>
                  </div>
                  <div className="glass-card" style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                      {coupons.reduce((sum, c) => sum + c.usedCount, 0)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Total Redemptions</div>
                  </div>
                  <div className="glass-card" style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-danger)' }}>
                      {coupons.filter(c => isExpired(c.expiryDate)).length}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Expired Codes</div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </>
  );
};

export default AdminCoupons;
