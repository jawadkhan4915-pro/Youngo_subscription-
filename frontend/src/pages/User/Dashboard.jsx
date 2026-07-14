import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Coins, Sparkles, AlertTriangle, ArrowRight, HelpCircle, Activity, LayoutDashboard, Cpu } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
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

  const COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  const getDailyUsageData = () => {
    if (!stats || !stats.dailyUsage) return [];
    
    // Generate an array of the last 7 dates in YYYY-MM-DD format
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const date = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${date}`);
    }

    // Map each date to either the aggregated database value or 0
    return dates.map(dateStr => {
      const dbRecord = stats.dailyUsage.find(item => item._id === dateStr);
      const d = new Date(dateStr);
      const formattedLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        date: dateStr,
        displayDate: formattedLabel,
        credits: dbRecord ? dbRecord.creditsSpent : 0,
        requests: dbRecord ? dbRecord.requestsCount : 0
      };
    });
  };

  const getToolUsageData = () => {
    if (!stats || !stats.toolUsage || stats.toolUsage.length === 0) {
      return [];
    }
    return stats.toolUsage.map(item => ({
      name: item.toolName,
      value: item.creditsSpent || 0,
      requests: item.requestsCount || 0
    })).filter(item => item.value > 0);
  };

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

              {/* Analytics & Charts Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
                
                {/* Credit Usage History Chart */}
                <div className="glass-card" style={{ padding: '2rem', minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Activity size={18} style={{ color: 'var(--color-primary)' }} /> Credit Consumption (Last 7 Days)
                  </h3>
                  <div style={{ flex: 1, width: '100%', height: '240px' }}>
                    {getDailyUsageData().length === 0 ? (
                      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                        Syncing analytics...
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={getDailyUsageData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorCredits" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                          <XAxis 
                            dataKey="displayDate" 
                            stroke="var(--text-muted)" 
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="var(--text-muted)" 
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              background: 'rgba(15, 23, 42, 0.9)', 
                              border: '1px solid var(--border-color)', 
                              borderRadius: '8px',
                              color: 'var(--text-main)',
                              fontSize: '12px'
                            }}
                            labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="credits" 
                            name="Credits Spent"
                            stroke="var(--color-primary)" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorCredits)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Tool Distribution Chart */}
                <div className="glass-card" style={{ padding: '2rem', minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Cpu size={18} style={{ color: 'var(--color-secondary)' }} /> Expenditure by AI Node
                  </h3>
                  <div style={{ flex: 1, width: '100%', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getToolUsageData().length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <LayoutDashboard size={32} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
                        No usage statistics recorded yet.
                        <p style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>Spend credits in the sandbox to populate chart.</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getToolUsageData()}
                            cx="50%"
                            cy="45%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {getToolUsageData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: 'rgba(15, 23, 42, 0.9)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              color: 'var(--text-main)',
                              fontSize: '12px'
                            }}
                            formatter={(value, name, props) => [`${value} Credits (${props.payload.requests} requests)`, 'Spent']}
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36} 
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
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
