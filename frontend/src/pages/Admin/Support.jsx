import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { HelpCircle, ChevronLeft, Send, Check, AlertCircle, MessageSquare, User, Cpu } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import Navbar from '../../components/Navbar.jsx';
import api from '../../services/api.js';
import '../dashboard.css';

const AdminSupport = () => {
  const { user } = useAuth();
  
  const [view, setView] = useState('LIST'); // LIST, DETAIL
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Message reply states
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/support'); // Admin get all
      if (res.data?.success) {
        setTickets(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleOpenTicket = async (ticket) => {
    try {
      const res = await api.get(`/support/${ticket._id}`);
      if (res.data?.success) {
        setSelectedTicket(res.data.data);
        setView('DETAIL');
      }
    } catch (err) {
      console.error('Failed to open ticket details:', err);
    }
  };

  const handleAssignToMe = async () => {
    if (!selectedTicket) return;
    try {
      const res = await api.post('/support/assign', {
        ticketId: selectedTicket._id,
        adminId: user._id
      });
      if (res.data?.success) {
        // Reload details
        const details = await api.get(`/support/${selectedTicket._id}`);
        setSelectedTicket(details.data.data);
        fetchTickets();
      }
    } catch (err) {
      console.error('Assign ticket failed', err);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    try {
      const res = await api.post(`/support/close/${selectedTicket._id}`);
      if (res.data?.success) {
        // Reload details
        const details = await api.get(`/support/${selectedTicket._id}`);
        setSelectedTicket(details.data.data);
        fetchTickets();
      }
    } catch (err) {
      console.error('Close ticket failed', err);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || replyLoading) return;

    setReplyLoading(true);
    try {
      const res = await api.post('/support/reply', {
        ticketId: selectedTicket._id,
        message: replyText
      });

      if (res.data?.success) {
        setReplyText('');
        // Reload details
        const details = await api.get(`/support/${selectedTicket._id}`);
        setSelectedTicket(details.data.data);
        fetchTickets();
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-page-container">
        <Sidebar isAdminPanel={true} />

        <main className="workspace-content" style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* Header */}
          <div className="workspace-header">
            {view === 'LIST' ? (
              <div>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Support Ticket Manager</h1>
                <p style={{ color: 'var(--text-muted)' }}>Respond to queries, assign tickets, and close support sessions.</p>
              </div>
            ) : (
              <button onClick={() => setView('LIST')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 500 }}>
                <ChevronLeft size={20} /> Back to Ticket Inbox
              </button>
            )}
          </div>

          {/* Views */}
          {view === 'LIST' ? (
            <div className="data-table-container">
              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading customer tickets...</div>
              ) : tickets.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No customer tickets found.</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User Name</th>
                      <th>Subject</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Updated Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t) => (
                      <tr key={t._id} onClick={() => handleOpenTicket(t)} style={{ cursor: 'pointer' }} className="table-row-hover">
                        <td><strong>{t.user?.name}</strong></td>
                        <td>{t.subject}</td>
                        <td>{t.category}</td>
                        <td>
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            background: t.priority === 'High' ? 'rgba(239, 68, 68, 0.1)' : t.priority === 'Medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                            color: t.priority === 'High' ? 'var(--color-danger)' : t.priority === 'Medium' ? 'var(--color-warning)' : 'var(--color-success)'
                          }}>
                            {t.priority}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                            background: t.status === 'Closed' ? 'rgba(148, 163, 184, 0.1)' : t.status === 'Replied' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                            color: t.status === 'Closed' ? 'var(--text-muted)' : t.status === 'Replied' ? 'var(--color-accent)' : 'var(--color-primary)'
                          }}>
                            {t.status}
                          </span>
                        </td>
                        <td>{new Date(t.updatedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            selectedTicket && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'start', flex: 1 }}>
                
                {/* Chat window */}
                <div className="ticket-chat-container">
                  <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>Ticket #{selectedTicket.ticketId}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedTicket.subject}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {selectedTicket.assignedTo?._id !== user._id && selectedTicket.status !== 'Closed' && (
                        <button onClick={handleAssignToMe} className="gradient-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                          Assign to Me
                        </button>
                      )}
                      
                      {selectedTicket.status !== 'Closed' && (
                        <button onClick={handleCloseTicket} className="gradient-btn" style={{ background: 'none', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: '0.4rem 0.8rem', fontSize: '0.8rem', boxShadow: 'none' }}>
                          Close Ticket
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem', paddingRight: '0.5rem' }}>
                    {selectedTicket.messages?.map((msg, index) => {
                      const isSenderAdmin = msg.sender?.role === 'Admin';
                      return (
                        <div key={index} style={{
                          display: 'flex',
                          flexDirection: isSenderAdmin ? 'row-reverse' : 'row',
                          gap: '0.75rem',
                          alignItems: 'flex-start',
                          maxWidth: '75%',
                          marginLeft: isSenderAdmin ? 'auto' : 0
                        }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-card-hover)', overflow: 'hidden', flexShrink: 0 }}>
                            <img src={msg.sender?.avatar || 'https://picsum.photos/28'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textAlign: isSenderAdmin ? 'right' : 'left' }}>
                              {msg.sender?.name} • {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div style={{
                              padding: '0.75rem 1rem',
                              borderRadius: 'var(--radius-md)',
                              background: isSenderAdmin ? 'var(--color-primary)' : 'var(--bg-card-hover)',
                              color: isSenderAdmin ? '#ffffff' : 'var(--text-main)',
                              border: isSenderAdmin ? 'none' : '1px solid var(--border-color)',
                              fontSize: '0.9rem',
                              lineHeight: '1.5',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {msg.message}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Send panel */}
                  {selectedTicket.status === 'Closed' ? (
                    <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <AlertCircle size={16} /> Ticket closed.
                    </div>
                  ) : (
                    <form onSubmit={handleReplySubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Type reply message..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        disabled={replyLoading}
                        style={{ flex: 1 }}
                      />
                      <button type="submit" disabled={replyLoading || !replyText.trim()} className="gradient-btn" style={{ padding: '0.75rem 1.25rem' }}>
                        <Send size={16} />
                      </button>
                    </form>
                  )}
                </div>

                {/* Right sidebar details */}
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4>User details</h4>
                  <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-muted)' }}>
                    <div>Name: <strong style={{ color: 'var(--text-main)' }}>{selectedTicket.user?.name}</strong></div>
                    <div>Email: <strong style={{ color: 'var(--text-main)' }}>{selectedTicket.user?.email}</strong></div>
                    <div>Category: <strong style={{ color: 'var(--text-main)' }}>{selectedTicket.category}</strong></div>
                    <div>Priority: <strong style={{ color: 'var(--text-main)' }}>{selectedTicket.priority}</strong></div>
                    <div>Assigned To: <strong style={{ color: 'var(--text-main)' }}>{selectedTicket.assignedTo?.name || 'Unassigned'}</strong></div>
                  </div>
                </div>

              </div>
            )
          )}
        </main>
      </div>
    </>
  );
};

export default AdminSupport;
