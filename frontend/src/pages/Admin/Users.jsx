import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Search, Ban, UserCheck, Trash2, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import Navbar from '../../components/Navbar.jsx';
import api from '../../services/api.js';
import '../dashboard.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Status variables
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Wallet reset Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetCredits, setResetCredits] = useState(100);
  const [resetLoading, setResetLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users-admin?search=${search}&status=${statusFilter}`);
      if (res.data?.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load users list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter]);

  const handleStatusChange = async (userId, newStatus) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.put(`/users-admin/${userId}`, { status: newStatus });
      if (res.data?.success) {
        setSuccess(`User status changed to ${newStatus}`);
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account? This cannot be undone.')) return;
    
    setError('');
    setSuccess('');
    try {
      const res = await api.delete(`/users-admin/${userId}`);
      if (res.data?.success) {
        setSuccess('User account deleted');
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleWalletResetSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setResetLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/users-admin/reset-wallet', {
        userId: selectedUser._id,
        credits: resetCredits
      });

      if (res.data?.success) {
        setSuccess(`Reset user wallet to ${resetCredits} credits`);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset credits');
    } finally {
      setResetLoading(false);
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
              <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Users Manager</h1>
              <p style={{ color: 'var(--text-muted)' }}>Suspend or ban users, view purchase summaries, and adjust playground limits.</p>
            </div>
          </div>

          {/* Flash feedback alerts */}
          {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>{error}</div>}
          {success && <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--color-success)', color: 'var(--color-success)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>{success}</div>}

          {/* Search bar & filter controls */}
          <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '350px' }}>
                <input
                  type="text"
                  placeholder="Search user by name/email..."
                  className="form-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>

              <select
                className="form-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ maxWidth: '180px' }}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Suspended">Suspended</option>
                <option value="Banned">Banned</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="data-table-container">
            {loading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Querying user directory logs...</div>
            ) : users.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No matching users found.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Email Address</th>
                    <th>Credits Pool</th>
                    <th>Status</th>
                    <th>Join Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((usr) => (
                    <tr key={usr._id}>
                      <td style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', borderBottom: 'none' /* inside flex wrapper */ }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-card-hover)', overflow: 'hidden' }}>
                          <img src={usr.avatar || 'https://picsum.photos/32'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <strong>{usr.name}</strong>
                      </td>
                      <td>{usr.email}</td>
                      <td><strong style={{ color: 'var(--color-primary)' }}>{usr.wallet?.totalCredits || 0} cr</strong></td>
                      <td>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          background: usr.status === 'Active' ? 'rgba(34, 197, 94, 0.1)' : usr.status === 'Suspended' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: usr.status === 'Active' ? 'var(--color-success)' : usr.status === 'Suspended' ? 'var(--color-warning)' : 'var(--color-danger)'
                        }}>
                          {usr.status}
                        </span>
                      </td>
                      <td>{new Date(usr.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {usr.status === 'Active' ? (
                            <button onClick={() => handleStatusChange(usr._id, 'Suspended')} className="theme-toggle" title="Suspend user">
                              <Ban size={16} style={{ color: 'var(--color-warning)' }} />
                            </button>
                          ) : (
                            <button onClick={() => handleStatusChange(usr._id, 'Active')} className="theme-toggle" title="Activate user">
                              <UserCheck size={16} style={{ color: 'var(--color-success)' }} />
                            </button>
                          )}
                          
                          {usr.status !== 'Banned' && (
                            <button onClick={() => handleStatusChange(usr._id, 'Banned')} className="theme-toggle" title="Ban user">
                              <Ban size={16} style={{ color: 'var(--color-danger)' }} />
                            </button>
                          )}

                          <button onClick={() => setSelectedUser(usr)} className="theme-toggle" title="Reset credits wallet">
                            <RotateCcw size={16} style={{ color: 'var(--color-accent)' }} />
                          </button>

                          <button onClick={() => handleDeleteUser(usr._id)} className="theme-toggle" title="Delete account permanent">
                            <Trash2 size={16} style={{ color: 'var(--color-danger)' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Reset credits modal popup */}
          {selectedUser && (
            <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
              <div className="modal-container glass-card" onClick={(e) => e.stopPropagation()}>
                <h3>Reset Credits: {selectedUser.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  This will override the user's active wallet balance to the specified credits amount.
                </p>

                <form onSubmit={handleWalletResetSubmit}>
                  <div className="form-group">
                    <label className="form-label">Set Credits Count</label>
                    <input
                      type="number"
                      className="form-input"
                      value={resetCredits}
                      onChange={(e) => setResetCredits(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button type="button" onClick={() => setSelectedUser(null)} className="form-input" style={{ width: 'auto', background: 'none' }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={resetLoading} className="gradient-btn">
                      {resetLoading ? 'Resetting...' : 'Confirm Reset'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
};

export default AdminUsers;
