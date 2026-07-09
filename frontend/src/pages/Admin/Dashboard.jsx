import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, Coins, CreditCard, Cpu, ShieldAlert, CheckCircle2, Megaphone, Clock, Activity } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import Navbar from '../../components/Navbar.jsx';
import api from '../../services/api.js';
import '../dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings/admin/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-page-container">
        <Sidebar isAdminPanel={true} />

        <main className="workspace-content">
          <div className="workspace-header">
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Admin Analytics</h1>
              <p style={{ color: 'var(--text-muted)' }}>MERN Platform Dashboard. Monitor revenue streams and API query limits.</p>
            </div>
            <button onClick={fetchStats} className="gradient-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Refresh Stats
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Assembling database indexes...</div>
          ) : stats ? (
            <>
              {/* Grid 1: Stats Summary Row */}
              <div className="stats-grid">
                <div className="glass-card stat-card">
                  <div className="stat-info">
                    <span className="stat-label">Total Revenue</span>
                    <span className="stat-value">{stats.stats?.totalRevenue} PKR</span>
                  </div>
                  <div className="stat-icon"><Coins size={20} /></div>
                </div>

                <div className="glass-card stat-card">
                  <div className="stat-info">
                    <span className="stat-label">Monthly Revenue</span>
                    <span className="stat-value">{stats.stats?.monthlyRevenue} PKR</span>
                  </div>
                  <div className="stat-icon" style={{ color: 'var(--color-secondary)', background: 'rgba(124, 58, 237, 0.1)' }}><Coins size={20} /></div>
                </div>

                <div className="glass-card stat-card">
                  <div className="stat-info">
                    <span className="stat-label">Registered Users</span>
                    <span className="stat-value">{stats.stats?.totalUsers}</span>
                  </div>
                  <div className="stat-icon" style={{ color: 'var(--color-accent)', background: 'rgba(6, 182, 212, 0.1)' }}><Users size={20} /></div>
                </div>

                <div className="glass-card stat-card">
                  <div className="stat-info">
                    <span className="stat-label">Pending Payments</span>
                    <span className="stat-value" style={{ color: stats.stats?.pendingPayments > 0 ? 'var(--color-warning)' : 'inherit' }}>
                      {stats.stats?.pendingPayments}
                    </span>
                  </div>
                  <div className="stat-icon" style={{ color: 'var(--color-warning)', background: 'rgba(245, 158, 11, 0.1)' }}><CreditCard size={20} /></div>
                </div>
              </div>

              {/* Grid 2: Micro stats row */}
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Daily Credits Used:</span>
                  <strong style={{ color: 'var(--color-accent)' }}>{stats.stats?.creditsUsedToday} cr</strong>
                </div>
                <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Licenses:</span>
                  <strong>{stats.stats?.activeSubs}</strong>
                </div>
                <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Shared Tools:</span>
                  <strong>{stats.stats?.totalTools}</strong>
                </div>
              </div>

              {/* Charts grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                
                {/* Revenue chart */}
                <div className="glass-card" style={{ padding: '2rem', height: '350px' }}>
                  <h4 style={{ marginBottom: '1.5rem' }}>Daily Revenue Chart (PKR)</h4>
                  <ResponsiveContainer width="100%" height="85%">
                    <AreaChart data={stats.charts?.revenue || []}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} />
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} />
                      <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Popularity chart */}
                <div className="glass-card" style={{ padding: '2rem', height: '350px' }}>
                  <h4 style={{ marginBottom: '1.5rem' }}>Tool Usage Popularity</h4>
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={stats.charts?.toolPopularity || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={9} />
                      <YAxis stroke="var(--text-muted)" fontSize={11} />
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} />
                      <Bar dataKey="value" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

              </div>

              {/* Recent lists */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                
                {/* Recent Orders */}
                <div>
                  <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={18} /> Recent Orders</h3>
                  <div className="data-table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Order Code</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentOrders?.map((ord) => (
                          <tr key={ord._id}>
                            <td>{ord.user?.name}</td>
                            <td><strong style={{ fontFamily: 'monospace' }}>{ord.orderId}</strong></td>
                            <td>{ord.totalAmount} PKR</td>
                            <td>
                              <span style={{
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.5rem',
                                borderRadius: 'var(--radius-full)',
                                background: ord.paymentStatus === 'Completed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                color: ord.paymentStatus === 'Completed' ? 'var(--color-success)' : 'var(--color-warning)'
                              }}>
                                {ord.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent usage activities */}
                <div>
                  <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={18} /> Recent Sandbox Prompts</h3>
                  <div className="data-table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Tool</th>
                          <th>Prompt Query</th>
                          <th>Credits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentActivities?.map((act) => (
                          <tr key={act._id}>
                            <td>{act.user?.name}</td>
                            <td>{act.tool?.name}</td>
                            <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              "{act.prompt}"
                            </td>
                            <td><strong style={{ color: 'var(--color-danger)' }}>-{act.creditsDeducted} cr</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Could not load database analytics metrics.</div>
          )}
        </main>
      </div>
    </>
  );
};

export default AdminDashboard;
