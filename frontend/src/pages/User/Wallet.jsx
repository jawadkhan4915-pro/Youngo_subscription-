import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Wallet, CreditCard, Clock, CheckCircle2, ShieldAlert, ArrowRight, Upload, Search, Percent } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import Navbar from '../../components/Navbar.jsx';
import api from '../../services/api.js';
import '../dashboard.css';

const UserWallet = () => {
  const { wallet, fetchMe } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Search parameters for checkout flow redirection
  const queryParams = new URLSearchParams(location.search);
  const actionParam = queryParams.get('action');
  const toolIdParam = queryParams.get('toolId');

  const [tools, setTools] = useState([]);
  const [selectedToolId, setSelectedToolId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [transactionId, setTransactionId] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [discountData, setDiscountData] = useState(null);
  const [systemSettings, setSystemSettings] = useState(null);

  // Loyalty Points Redemption states
  const [redeemPoints, setRedeemPoints] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);

  // Status variables
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoadingOrders(true);

        // Fetch tools to populate checkout options
        const toolsRes = await api.get('/tools');
        if (toolsRes.data?.success) {
          setTools(toolsRes.data.data);
          
          // Auto select tool if redirected from details page
          if (toolIdParam) {
            setSelectedToolId(toolIdParam);
          } else if (toolsRes.data.data.length > 0) {
            setSelectedToolId(toolsRes.data.data[0]._id);
          }
        }

        // Fetch user orders list
        const ordersRes = await api.get('/orders/my-orders');
        if (ordersRes.data?.success) {
          setOrders(ordersRes.data.data);
        }

        // Fetch usage transactions logs
        const logsRes = await api.get('/usage/my-logs');
        if (logsRes.data?.success) {
          setLogs(logsRes.data.data);
        }

        // Fetch public system settings
        const settingsRes = await api.get('/settings/public');
        if (settingsRes.data?.success) {
          setSystemSettings(settingsRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load wallet ledger:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchWalletData();
  }, [toolIdParam]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setError('');
    
    const selectedTool = tools.find(t => t._id === selectedToolId);
    if (!selectedTool) return;

    try {
      const res = await api.post('/orders/apply-coupon', {
        code: couponCode,
        amount: selectedTool.price
      });
      if (res.data?.success) {
        setDiscountData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid coupon code');
      setDiscountData(null);
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCheckoutLoading(true);

    if (!selectedToolId) {
      setError('Please select an AI tool plan');
      setCheckoutLoading(false);
      return;
    }

    if (!receiptFile) {
      setError('Please upload a screenshot of your payment receipt');
      setCheckoutLoading(false);
      return;
    }

    // Build form multipart data
    const formData = new FormData();
    formData.append('items[0][toolId]', selectedToolId);
    formData.append('paymentMethod', paymentMethod);
    formData.append('transactionId', transactionId);
    formData.append('receipt', receiptFile);
    if (discountData) {
      formData.append('couponCode', discountData.code);
    }

    try {
      const res = await api.post('/orders/checkout', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data?.success) {
        setCheckoutSuccess(true);
        setTransactionId('');
        setReceiptFile(null);
        setCouponCode('');
        setDiscountData(null);
        
        // Re-fetch updated orders
        const ordersRes = await api.get('/orders/my-orders');
        if (ordersRes.data?.success) {
          setOrders(ordersRes.data.data);
        }

        // Clear query parameters
        navigate('/dashboard/wallet', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Checkout submission failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleRedeemLoyalty = async (e) => {
    e.preventDefault();
    setRedeemError('');
    setRedeemSuccess('');
    setRedeemLoading(true);

    try {
      const res = await api.post('/settings/wallet/redeem-loyalty', { points: redeemPoints });
      if (res.data?.success) {
        setRedeemSuccess(res.data.message);
        setRedeemPoints('');
        
        // Sync user wallet statistics context
        await fetchMe();

        // Refresh orders and transactions list if necessary
        const logsRes = await api.get('/usage/my-logs');
        if (logsRes.data?.success) {
          setLogs(logsRes.data.data);
        }
      }
    } catch (err) {
      setRedeemError(err.response?.data?.error || 'Loyalty redemption failed');
    } finally {
      setRedeemLoading(false);
    }
  };

  const getPriceBreakdown = () => {
    const tool = tools.find(t => t._id === selectedToolId);
    if (!tool) return { price: 0, discount: 0, total: 0 };

    let price = tool.price;
    let discount = 0;

    if (discountData) {
      if (discountData.type === 'Percentage') {
        discount = (price * discountData.value) / 100;
        if (discountData.maxDiscount > 0) {
          discount = Math.min(discount, discountData.maxDiscount);
        }
      } else {
        discount = discountData.value;
      }
      discount = Math.min(discount, price);
    }

    return {
      price,
      discount,
      total: price - discount
    };
  };

  const { price, discount, total } = getPriceBreakdown();

  return (
    <>
      <Navbar />
      <div className="dashboard-page-container">
        <Sidebar isAdminPanel={false} />

        <main className="workspace-content">
          <div className="workspace-header">
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Billing & Wallet</h1>
              <p style={{ color: 'var(--text-muted)' }}>Top up your credits, submit manual bank receipts, and audit transactions.</p>
            </div>
          </div>

          {/* Stats Summary Panel */}
          <div className="stats-grid">
            <div className="glass-card stat-card">
              <div className="stat-info">
                <span className="stat-label">Active Credits Pool</span>
                <span className="stat-value">{wallet?.totalCredits || 0} cr</span>
              </div>
              <div className="stat-icon"><Wallet size={20} /></div>
            </div>

            <div className="glass-card stat-card">
              <div className="stat-info">
                <span className="stat-label">Total Spent Credits</span>
                <span className="stat-value">{wallet?.spentCredits || 0} cr</span>
              </div>
              <div className="stat-icon" style={{ color: 'var(--color-secondary)', background: 'rgba(124, 58, 237, 0.1)' }}><Clock size={20} /></div>
            </div>

            <div className="glass-card stat-card">
              <div className="stat-info">
                <span className="stat-label">Loyalty Balance</span>
                <span className="stat-value">{wallet?.loyaltyPoints || 0} pts</span>
              </div>
              <div className="stat-icon" style={{ color: 'var(--color-accent)', background: 'rgba(6, 182, 212, 0.1)' }}><Percent size={20} /></div>
            </div>
          </div>

          <div className="recharge-grid" style={{ marginBottom: '3rem' }}>
            
            {/* Payment Details */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CreditCard size={18} /> 1. Manual Cash Details</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                Transfer the exact amount for your chosen AI license to one of our verified local bank or mobile cash wallets below.
              </p>

              <div className="bank-account-box">
                <h5 style={{ marginBottom: '0.25rem' }}>Standard Chartered Bank</h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Title: Youngo Subscription Services</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600, marginTop: '0.25rem' }}>Account No: {systemSettings?.bank_account || '1234-5678-9012'} (IBAN available)</p>
              </div>

              <div className="bank-account-box" style={{ borderColor: 'var(--color-secondary)' }}>
                <h5 style={{ marginBottom: '0.25rem' }}>EasyPaisa Mobile Cash</h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Title: Jawad Khan</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-secondary)', fontWeight: 600, marginTop: '0.25rem' }}>Phone: {systemSettings?.easypaisa_number || '0300-1234567'}</p>
              </div>

              <div className="bank-account-box" style={{ borderColor: 'var(--color-accent)' }}>
                <h5 style={{ marginBottom: '0.25rem' }}>JazzCash Mobile Cash</h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Title: Jawad Khan</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-accent)', fontWeight: 600, marginTop: '0.25rem' }}>Phone: {systemSettings?.jazzcash_number || '0312-7654321'}</p>
              </div>
            </div>

            {/* Submission Form */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Upload size={18} /> 2. Upload Payment Proof</h3>

              {checkoutSuccess ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <CheckCircle2 size={40} style={{ color: 'var(--color-success)', margin: '0 auto 1rem auto' }} />
                  <h4 style={{ marginBottom: '0.5rem' }}>Receipt Dispatched Successfully!</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Admin verification is underway. Your playground credits will be allocated once approved.
                  </p>
                  <button onClick={() => setCheckoutSuccess(false)} className="gradient-btn" style={{ marginTop: '1.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    Topup another tool
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCheckoutSubmit}>
                  {error && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid var(--color-danger)',
                      color: 'var(--color-danger)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1.25rem',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <ShieldAlert size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Select AI Tool License</label>
                    <select
                      className="form-input"
                      value={selectedToolId}
                      onChange={(e) => {
                        setSelectedToolId(e.target.value);
                        setDiscountData(null);
                      }}
                    >
                      {tools.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name} ({t.price} PKR - {t.creditsPerPurchase} cr)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Select Payment Method</label>
                    <select
                      className="form-input"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="Bank Transfer">Bank Transfer (Standard Chartered)</option>
                      <option value="EasyPaisa">EasyPaisa Mobile Cash</option>
                      <option value="JazzCash">JazzCash Mobile Cash</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bank Transaction Reference / ID</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. TRX-9988223"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      required
                    />
                  </div>

                  {/* Promo coupon input */}
                  <div className="form-group">
                    <label className="form-label">Discount Coupon (Optional)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="ENTER CODE"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        style={{ textTransform: 'uppercase' }}
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="gradient-btn"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                      >
                        Apply
                      </button>
                    </div>
                    {discountData && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', display: 'block', marginTop: '0.25rem' }}>
                        Promo applied: {discountData.type === 'Percentage' ? `${discountData.value}%` : `${discountData.value} PKR`} discount!
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload Receipt Image (PNG, JPG)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setReceiptFile(e.target.files[0])}
                      required
                      style={{
                        padding: '0.5rem',
                        border: '1px dashed var(--border-color)',
                        width: '100%',
                        borderRadius: 'var(--radius-md)'
                      }}
                    />
                  </div>

                  {/* Pricing Breakdown */}
                  <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Subtotal:</span>
                      <span>{price} PKR</span>
                    </div>
                    {discount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)', marginBottom: '0.5rem' }}>
                        <span>Coupon Discount:</span>
                        <span>-{discount} PKR</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                      <span>Final Payable:</span>
                      <span style={{ color: 'var(--color-accent)' }}>{total} PKR</span>
                    </div>
                  </div>

                  <button type="submit" disabled={checkoutLoading} className="gradient-btn" style={{ width: '100%', justifyContent: 'center' }}>
                    {checkoutLoading ? 'Submitting Receipt...' : 'Submit Checkout'} <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Loyalty Points Redemption card */}
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '3rem', maxWidth: '600px' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Percent size={18} style={{ color: 'var(--color-accent)' }} /> Redeem Loyalty Points</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Convert your loyalty points into wallet credits. **10 Loyalty Points = 1 Credit**.
            </p>

            {redeemSuccess && <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--color-success)', color: 'var(--color-success)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>{redeemSuccess}</div>}
            {redeemError && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>{redeemError}</div>}

            <form onSubmit={handleRedeemLoyalty} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label className="form-label">Points to Redeem (Multiples of 10)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 50"
                  min={10}
                  step={10}
                  value={redeemPoints}
                  onChange={(e) => setRedeemPoints(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={redeemLoading || !redeemPoints} className="gradient-btn" style={{ padding: '0.75rem 1.5rem', height: '42px' }}>
                {redeemLoading ? 'Redeeming...' : 'Convert Points'}
              </button>
            </form>
            <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Current Balance: <strong>{wallet?.loyaltyPoints || 0} pts</strong> (Worth: <strong>{Math.floor((wallet?.loyaltyPoints || 0) / 10)} credits</strong>)
            </span>
          </div>

          {/* Billing Order History */}
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={18} /> Order Billing Ledger</h3>
          <div className="data-table-container">
            {loadingOrders ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading billing records...</div>
            ) : orders.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No billing invoices found.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order Code</th>
                    <th>Payment Method</th>
                    <th>Payable (PKR)</th>
                    <th>Status</th>
                    <th>Submitted Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord._id}>
                      <td><strong style={{ fontFamily: 'monospace' }}>{ord.orderId}</strong></td>
                      <td>{ord.paymentMethod}</td>
                      <td>{ord.totalAmount} PKR</td>
                      <td>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          background: ord.paymentStatus === 'Completed' ? 'rgba(34, 197, 94, 0.1)' : ord.paymentStatus === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: ord.paymentStatus === 'Completed' ? 'var(--color-success)' : ord.paymentStatus === 'Pending' ? 'var(--color-warning)' : 'var(--color-danger)'
                        }}>
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </main>
      </div>
      <Footer />
    </>
  );
};

export default UserWallet;
