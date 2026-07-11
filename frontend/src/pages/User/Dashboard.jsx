import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Coins, Sparkles, AlertTriangle, ArrowRight, HelpCircle, Activity, LayoutDashboard, Cpu } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import api from '../../services/api.js';
import '../dashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/settings/user/stats');
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <>
      <Navbar />
      <div className="dashboard-page-container">
        <Sidebar isAdminPanel={false} />
        
        <main className="workspace-content">
          <div className="workspace-header">
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>User Dashboard</h1>
              <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.name}. Check your shared AI nodes details.</p>
            </div>
            <Link to="/dashboard/playground" className="gradient-btn">
              Open Playground <Sparkles size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Syncing secure nodes...</div>
          ) : stats ? (
            <>
              {/* Stats Row */}
              <div className="stats-grid">
                <div className="glass-card stat-card">
                  <div className="stat-info">
                    <span className="stat-label">Wallet Credits</span>
                    <span className="stat-value">{stats.wallet?.credits} cr</span>
                  </div>
                  <div className="stat-icon"><Coins size={20} /></div>
                </div>

                <div className="glass-card stat-card">
                  <div className="stat-info">
                    <span className="stat-label">Spent Credits</span>
                    <span className="stat-value">{stats.wallet?.spent} cr</span>
                  </div>
                  <div className="stat-icon" style={{ background: 'rgba(124, 58, 237, 0.1)', color: 'var(--color-secondary)' }}><Activity size={20} /></div>
                </div>

                <div className="glass-card stat-card">
                  <div className="stat-info">
                    <span className="stat-label">Active Subscriptions</span>
                    <span className="stat-value">{stats.activeSubscriptions?.length}</span>
                  </div>
                  <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-accent)' }}><Cpu size={20} /></div>
                </div>

                <div className="glass-card stat-card">
                  <div className="stat-info">
                    <span className="stat-label">Loyalty Points</span>
                    <span className="stat-value">{stats.wallet?.loyaltyPoints} pts</span>
                  </div>
                  <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success)' }}><Sparkles size={20} /></div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
                
                {/* Active Subscriptions */}
                <div>
                  <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Cpu size={18} /> Active AI Licenses</h3>
                  
                  {stats.activeSubscriptions?.length === 0 ? (
                    <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border-color)' }}>
                      <AlertTriangle size={32} style={{ color: 'var(--color-warning)', margin: '0 auto 1rem auto' }} />
                      <h4 style={{ marginBottom: '0.5rem' }}>No Active Subscriptions</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        Browse our AI catalog to purchase your first topup license and unlock playground tools.
                      </p>
                      <Link to="/tools" className="gradient-btn" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                        Explore Catalog
                      </Link>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {stats.activeSubscriptions.map((sub) => (
                        <div key={sub._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <img src={sub.tool?.logo || 'https://picsum.photos/40'} alt={sub.tool?.name} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                            <div>
                              <h4 style={{ margin: 0 }}>{sub.tool?.name}</h4>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Expire date: {new Date(sub.expiresAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div style={{ minWidth: '150px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>
                              <span>Credits:</span>
                              <strong>{sub.creditsRemaining} remaining</strong>
                            </div>
                            <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{
                                width: `${Math.min(100, (sub.creditsRemaining / 100) * 100)}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))'
                              }}></div>
                            </div>
                          </div>

                          <Link to="/dashboard/playground" className="gradient-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                            Launch Sandbox
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Activities Logs */}
                <div>
                  <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={18} /> Recent Prompts</h3>

                  <div className="glass-card" style={{ padding: '1.5rem' }}>
                    {stats.recentLogs?.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No prompts ran yet.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {stats.recentLogs.map((log) => (
                          <div key={log._id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                            <div style={{ maxWidth: '75%' }}>
                              <h5 style={{ margin: '0 0 0.25rem 0' }}>{log.tool?.name}</h5>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                "{log.prompt}"
                              </p>
                            </div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                              -{log.creditsDeducted} cr
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Could not load statistics data.</div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default UserDashboard;
