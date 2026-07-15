import React, { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, ShieldAlert, CreditCard, MessageSquare, Megaphone, Users, Inbox } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import api from '../../services/api.js';
import '../dashboard.css';

const typeIconMap = {
  System: <ShieldAlert size={18} />,
  Payment: <CreditCard size={18} />,
  Support: <MessageSquare size={18} />,
  Announcement: <Megaphone size={18} />,
  Referral: <Users size={18} />
};

const typeColorMap = {
  System: 'var(--color-primary)',
  Payment: 'var(--color-success)',
  Support: 'var(--color-accent)',
  Announcement: 'var(--color-warning)',
  Referral: 'var(--color-secondary)'
};

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    if (notifications.every(n => n.isRead)) return;
    setMarking(true);
    try {
      const res = await api.post('/settings/notifications/read');
      if (res.data?.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        // Dispatch custom event so Navbar badge resets immediately
        window.dispatchEvent(new CustomEvent('notifications-marked-read'));
      }
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    } finally {
      setMarking(false);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  return (
    <>
      <Navbar />
      <div className="dashboard-page-container">
        <Sidebar isAdminPanel={false} />

        <main className="workspace-content" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div className="workspace-header">
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                Notifications
                {unreadCount > 0 && (
                  <span style={{
                    background: 'var(--color-danger)',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    lineHeight: 1
                  }}>
                    {unreadCount} new
                  </span>
                )}
              </h1>
              <p style={{ color: 'var(--text-muted)' }}>
                Your system alerts, payment confirmations, and platform announcements.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {/* Filter Tabs */}
              <div style={{
                display: 'flex',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden'
              }}>
                {['all', 'unread'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    style={{
                      padding: '0.5rem 1rem',
                      border: 'none',
                      background: filter === tab ? 'var(--color-primary)' : 'transparent',
                      color: filter === tab ? '#fff' : 'var(--text-muted)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textTransform: 'capitalize'
                    }}
                  >
                    {tab} {tab === 'unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
                  </button>
                ))}
              </div>

              <button
                onClick={handleMarkAllRead}
                disabled={marking || unreadCount === 0}
                className="gradient-btn"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', opacity: unreadCount === 0 ? 0.5 : 1 }}
              >
                <CheckCheck size={16} />
                {marking ? 'Marking...' : 'Mark All Read'}
              </button>
            </div>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
              <Bell size={32} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>Loading your notifications...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-card" style={{
              padding: '5rem',
              textAlign: 'center',
              maxWidth: '500px',
              margin: '2rem auto',
              color: 'var(--text-muted)'
            }}>
              <Inbox size={56} style={{ opacity: 0.25, marginBottom: '1.5rem' }} />
              <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
              </h3>
              <p style={{ fontSize: '0.9rem' }}>
                {filter === 'unread'
                  ? 'You have no unread notifications. Switch to "All" to see your history.'
                  : 'When you receive payment confirmations, support replies, or system alerts, they\'ll show up here.'
                }
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '860px' }}>
              {filtered.map((notif) => {
                const icon = typeIconMap[notif.type] || <Bell size={18} />;
                const color = typeColorMap[notif.type] || 'var(--color-primary)';

                return (
                  <div
                    key={notif._id}
                    className="glass-card"
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'flex-start',
                      borderLeft: `4px solid ${notif.isRead ? 'var(--border-color)' : color}`,
                      background: notif.isRead ? 'var(--bg-card)' : `${color}08`,
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: `${color}18`,
                      color: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '0.35rem' }}>
                        <h4 style={{ margin: 0, fontWeight: notif.isRead ? 500 : 700, fontSize: '0.95rem' }}>
                          {notif.title}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {formatTime(notif.createdAt)}
                          </span>
                          {!notif.isRead && (
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: color,
                              flexShrink: 0,
                              boxShadow: `0 0 6px ${color}`
                            }} />
                          )}
                        </div>
                      </div>

                      <p style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.55
                      }}>
                        {notif.message}
                      </p>

                      {/* Type badge */}
                      <span style={{
                        marginTop: '0.6rem',
                        display: 'inline-block',
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        background: `${color}15`,
                        color: color,
                        fontWeight: 600,
                        letterSpacing: '0.03em'
                      }}>
                        {notif.type}
                      </span>
                    </div>

                    {/* Read indicator */}
                    {notif.isRead && (
                      <Check size={14} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '0.2rem' }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary footer */}
          {notifications.length > 0 && !loading && (
            <div style={{
              marginTop: '2rem',
              padding: '0.875rem 1.25rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              display: 'flex',
              justifyContent: 'space-between',
              maxWidth: '860px'
            }}>
              <span>Showing {filtered.length} of {notifications.length} notifications</span>
              <span>{unreadCount} unread · {notifications.length - unreadCount} read</span>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default UserNotifications;
