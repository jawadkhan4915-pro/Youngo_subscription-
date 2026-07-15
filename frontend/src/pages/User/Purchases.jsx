import React, { useEffect, useState } from 'react';
import { ShoppingBag, CheckCircle2, Clock, XCircle, ExternalLink, Cpu, CreditCard } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import api from '../../services/api.js';
import '../dashboard.css';

const statusConfig = {
  Completed: {
    color: 'var(--color-success)',
    bg: 'rgba(34,197,94,0.1)',
    icon: <CheckCircle2 size={14} />
  },
  Pending: {
    color: 'var(--color-warning)',
    bg: 'rgba(245,158,11,0.1)',
    icon: <Clock size={14} />
  },
  Rejected: {
    color: 'var(--color-danger)',
    bg: 'rgba(239,68,68,0.1)',
    icon: <XCircle size={14} />
  }
};

const UserPurchases = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/my-orders');
      if (res.data?.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  return (
    <>
      <Navbar />
      <div className="dashboard-page-container">
        <Sidebar isAdminPanel={false} />

        <main className="workspace-content" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="workspace-header">
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>My Purchases</h1>
              <p style={{ color: 'var(--text-muted)' }}>
                View all your AI tool subscription orders and payment history.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {['Completed', 'Pending', 'Rejected'].map(status => {
                const count = orders.filter(o => o.paymentStatus === status).length;
                const cfg = statusConfig[status];
                return (
                  <div key={status} style={{
                    padding: '0.4rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    background: cfg.bg,
                    color: cfg.color,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: `1px solid ${cfg.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    {cfg.icon} {count} {status}
                  </div>
                );
              })}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
              Loading purchase history...
            </div>
          ) : orders.length === 0 ? (
            <div className="glass-card" style={{
              padding: '5rem',
              textAlign: 'center',
              maxWidth: '520px',
              margin: '2rem auto',
              border: '1px dashed var(--border-color)'
            }}>
              <ShoppingBag size={56} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>No purchases yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Browse our AI tools catalog and subscribe to premium tools to start using the Playground.
              </p>
              <a href="/tools" className="gradient-btn" style={{ display: 'inline-flex' }}>
                <Cpu size={16} /> Browse AI Tools
              </a>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '1.5rem' }}>
              {/* Orders Table */}
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Tools</th>
                      <th>Total (PKR)</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const cfg = statusConfig[order.paymentStatus] || statusConfig.Pending;
                      return (
                        <tr
                          key={order._id}
                          style={{
                            cursor: 'pointer',
                            background: selected?._id === order._id ? 'var(--bg-card-hover)' : 'transparent'
                          }}
                          onClick={() => setSelected(selected?._id === order._id ? null : order)}
                        >
                          <td>
                            <code style={{
                              fontFamily: 'monospace',
                              fontSize: '0.8rem',
                              color: 'var(--color-accent)',
                              fontWeight: 600
                            }}>
                              #{order.orderId || order._id?.toString().slice(-8).toUpperCase()}
                            </code>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              {order.items?.slice(0, 2).map((item, i) => (
                                <span key={i} style={{ fontSize: '0.85rem' }}>{item.name}</span>
                              ))}
                              {order.items?.length > 2 && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  +{order.items.length - 2} more
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <strong>{order.totalAmount?.toLocaleString()} PKR</strong>
                            {order.discount > 0 && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--color-success)' }}>
                                -{order.discount} PKR saved
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <CreditCard size={14} style={{ color: 'var(--text-muted)' }} />
                              {order.paymentMethod || 'Manual'}
                            </div>
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.78rem',
                              padding: '0.25rem 0.625rem',
                              borderRadius: 'var(--radius-full)',
                              fontWeight: 600,
                              background: cfg.bg,
                              color: cfg.color
                            }}>
                              {cfg.icon} {order.paymentStatus}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {formatDate(order.createdAt)}
                          </td>
                          <td>
                            <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Order Detail Side Panel */}
              {selected && (
                <div className="glass-card" style={{ padding: '1.75rem', position: 'sticky', top: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: 0 }}>Order Details</h4>
                    <button
                      onClick={() => setSelected(null)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.25rem' }}
                    >
                      ×
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Order ID */}
                    <div style={{ background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Order Reference</div>
                      <code style={{ fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'monospace' }}>
                        #{selected.orderId || selected._id?.toString().slice(-8).toUpperCase()}
                      </code>
                    </div>

                    {/* Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Payment Status</span>
                      {(() => {
                        const cfg = statusConfig[selected.paymentStatus] || statusConfig.Pending;
                        return (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.8rem',
                            padding: '0.3rem 0.75rem',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: 700,
                            background: cfg.bg,
                            color: cfg.color
                          }}>
                            {cfg.icon} {selected.paymentStatus}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Items */}
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>
                        Items Purchased
                      </div>
                      {selected.items?.map((item, i) => (
                        <div key={i} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '0.6rem 0',
                          borderBottom: '1px solid var(--border-color)',
                          fontSize: '0.875rem'
                        }}>
                          <span>{item.name}</span>
                          <span>{item.price} PKR</span>
                        </div>
                      ))}
                    </div>

                    {/* Pricing breakdown */}
                    <div style={{ background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                      {selected.discount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Coupon Discount</span>
                          <span style={{ color: 'var(--color-success)' }}>-{selected.discount} PKR</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700 }}>
                        <span>Total Paid</span>
                        <span>{selected.totalAmount} PKR</span>
                      </div>
                    </div>

                    {/* Date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <span>Placed on</span>
                      <span>{formatDate(selected.createdAt)}</span>
                    </div>

                    {/* Payment method */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <span>Payment Method</span>
                      <span>{selected.paymentMethod || 'Manual Transfer'}</span>
                    </div>

                    {selected.paymentStatus === 'Pending' && (
                      <div style={{
                        background: 'rgba(245,158,11,0.08)',
                        border: '1px solid rgba(245,158,11,0.3)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.875rem',
                        fontSize: '0.82rem',
                        color: 'var(--color-warning)',
                        lineHeight: 1.5
                      }}>
                        ⏳ Your payment is being verified by our admin team. This typically takes up to 24 hours.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default UserPurchases;
