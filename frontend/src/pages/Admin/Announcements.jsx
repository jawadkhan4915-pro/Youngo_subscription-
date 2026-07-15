import React, { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2, CheckCircle2, XCircle, Clock, ToggleLeft, ToggleRight, Eye } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import Navbar from '../../components/Navbar.jsx';
import api from '../../services/api.js';
import '../dashboard.css';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('Banner');
  const [endDate, setEndDate] = useState('');

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Preview panel
  const [previewOpen, setPreviewOpen] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      // Fetch all (active) announcements from the public endpoint
      const res = await api.get('/settings/announcements');
      if (res.data?.success) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
      setError('Failed to load announcements. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFormLoading(true);

    try {
      const res = await api.post('/settings/announcements', {
        title,
        message,
        type,
        endDate
      });

      if (res.data?.success) {
        setSuccess(`Announcement "${title}" published successfully! It is now live for all users.`);
        setTitle('');
        setMessage('');
        setType('Banner');
        setEndDate('');
        fetchAnnouncements();
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to publish announcement. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const isExpired = (date) => new Date(date) < new Date();

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

  const daysRemaining = (endDate) => {
    const diff = new Date(endDate) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // Tomorrow date for min
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
              <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Announcements Manager</h1>
              <p style={{ color: 'var(--text-muted)' }}>
                Publish and manage system-wide announcement banners visible to all users.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{
                background: 'rgba(79,70,229,0.1)',
                border: '1px solid rgba(79,70,229,0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                color: 'var(--color-primary)',
                fontWeight: 600
              }}>
                {announcements.filter(a => !isExpired(a.endDate)).length} Live
              </div>
              <button
                onClick={() => setPreviewOpen(!previewOpen)}
                className="theme-toggle"
                style={{ gap: '0.5rem', display: 'flex', alignItems: 'center', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                title="Preview banner"
              >
                <Eye size={16} />
                <span>Preview</span>
              </button>
            </div>
          </div>

          {/* Live Preview */}
          {previewOpen && (title || message) && (
            <div style={{
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
              color: '#fff',
              padding: '0.75rem 2rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.9rem',
              position: 'relative'
            }}>
              <Megaphone size={18} />
              <span>
                <strong>{title || 'Announcement Title'}</strong>: {message || 'Your announcement message will appear here...'}
              </span>
              <span style={{
                position: 'absolute',
                right: '1rem',
                fontSize: '0.75rem',
                opacity: 0.8,
                background: 'rgba(255,255,255,0.2)',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)'
              }}>
                Live Preview
              </span>
            </div>
          )}

          {/* Status messages */}
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

            {/* Create Form */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                <Plus size={18} style={{ color: 'var(--color-accent)' }} /> Publish Announcement
              </h3>

              <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Announcement Title / Prefix</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. SYSTEM MAINTENANCE"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={80}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                    Appears bolded before the message body.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Announcement Message Body</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Provide the full announcement message for your users..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    maxLength={500}
                    style={{ resize: 'vertical' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                    {message.length} / 500 characters
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Display Type</label>
                    <select
                      className="form-input"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="Banner">Banner (Top Bar)</option>
                      <option value="Popup">Popup Modal</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Expiry End Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={endDate}
                      min={minDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Type info block */}
                <div style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.875rem 1rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6
                }}>
                  <strong style={{ color: 'var(--text-main)' }}>ℹ️ How it works:</strong> Announcements will be shown to all users until the expiry date. Users can dismiss banners for their session. Only active (non-expired) announcements are displayed.
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="gradient-btn"
                  style={{ width: '100%', justifyContent: 'center', background: 'var(--color-accent)' }}
                >
                  <Megaphone size={16} />
                  {formLoading ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </form>
            </div>

            {/* Announcements List */}
            <div>
              <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Megaphone size={18} /> Published Announcements
              </h3>

              {loading ? (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading announcements...
                </div>
              ) : announcements.length === 0 ? (
                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Megaphone size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <p>No active announcements found.</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Use the form on the left to publish your first announcement.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {announcements.map((ann) => {
                    const expired = isExpired(ann.endDate);
                    const remaining = daysRemaining(ann.endDate);

                    return (
                      <div
                        key={ann._id}
                        className="glass-card"
                        style={{
                          padding: '1.5rem',
                          borderLeft: `4px solid ${expired ? 'var(--color-danger)' : 'var(--color-accent)'}`,
                          opacity: expired ? 0.7 : 1,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                              <span style={{
                                fontSize: '0.72rem',
                                padding: '0.2rem 0.6rem',
                                borderRadius: 'var(--radius-full)',
                                fontWeight: 600,
                                background: expired ? 'rgba(239,68,68,0.12)' : 'rgba(6,182,212,0.12)',
                                color: expired ? 'var(--color-danger)' : 'var(--color-accent)'
                              }}>
                                {expired ? 'EXPIRED' : 'LIVE'}
                              </span>
                              <span style={{
                                fontSize: '0.72rem',
                                padding: '0.2rem 0.6rem',
                                borderRadius: 'var(--radius-full)',
                                fontWeight: 600,
                                background: 'rgba(79,70,229,0.1)',
                                color: 'var(--color-primary)'
                              }}>
                                {ann.type}
                              </span>
                              {!expired && (
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Clock size={12} />
                                  {remaining} day{remaining !== 1 ? 's' : ''} remaining
                                </span>
                              )}
                            </div>

                            <h4 style={{ margin: 0, marginBottom: '0.4rem', fontWeight: 700 }}>
                              {ann.title}
                            </h4>
                            <p style={{
                              margin: 0,
                              fontSize: '0.875rem',
                              color: 'var(--text-muted)',
                              lineHeight: 1.55,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {ann.message}
                            </p>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                              <div>Published: {formatDate(ann.startDate || ann.createdAt)}</div>
                              <div style={{ color: expired ? 'var(--color-danger)' : 'var(--text-muted)' }}>
                                Expires: {formatDate(ann.endDate)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Note about expired announcements */}
              {announcements.length > 0 && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)'
                }}>
                  💡 <strong>Note:</strong> Only non-expired announcements are shown here (fetched from the public endpoint). Expired announcements are automatically hidden from the frontend but remain in the database.
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </>
  );
};

export default AdminAnnouncements;
