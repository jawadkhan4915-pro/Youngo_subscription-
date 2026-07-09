import React, { useEffect, useState } from 'react';
import { HelpCircle, Plus, Send, ChevronLeft, ShieldAlert, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import Navbar from '../../components/Navbar.jsx';
import api from '../../services/api.js';
import '../dashboard.css';

const UserSupport = () => {
  const [view, setView] = useState('LIST'); // LIST, CREATE, DETAIL
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Technical');
  const [priority, setPriority] = useState('Medium');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Reply states
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/support/my-tickets');
      if (res.data?.success) {
        setTickets(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
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
      console.error('Failed to open ticket details', err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    try {
      const res = await api.post('/support', { subject, category, priority, message });
      if (res.data?.success) {
        setFormSuccess(true);
        setSubject('');
        setMessage('');
        fetchTickets();
        setTimeout(() => {
          setView('LIST');
          setFormSuccess(false);
        }, 1500);
      }
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to submit ticket');
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
      }
    } catch (err) {
      console.error('Reply submission error', err);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      const res = await api.post(`/support/close/${selectedTicket._id}`);
      if (res.data?.success) {
        // Refresh details
        const details = await api.get(`/support/${selectedTicket._id}`);
        setSelectedTicket(details.data.data);
        fetchTickets();
      }
    } catch (err) {
      console.error('Failed to close ticket', err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-page-container">
        <Sidebar isAdminPanel={false} />

        <main className="workspace-content" style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* Header */}
          <div className="workspace-header">
            {view === 'LIST' ? (
              <>
                <div>
                  <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Support Center</h1>
                  <p style={{ color: 'var(--text-muted)' }}>Get direct technical and billing assistance from our administrators.</p>
                </div>
                <button onClick={() => setView('CREATE')} className="gradient-btn">
                  Create Ticket <Plus size={16} />
                </button>
              </>
            ) : (
              <button onClick={() => setView('LIST')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 500 }}>
                <ChevronLeft size={20} /> Back to Ticket List
              </button>
            )}
          </div>

          {/* Views */}
          {view === 'LIST' ? (
            /* LIST VIEW */
            <div className="data-table-container">
              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading support logs...</div>
              ) : tickets.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <HelpCircle size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
                  <h4>No Support Tickets Found</h4>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>If you face any issues, feel free to open a ticket.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Subject</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Last Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t) => (
                      <tr key={t._id} onClick={() => handleOpenTicket(t)} style={{ cursor: 'pointer' }} className="table-row-hover">
                        <td><strong style={{ fontFamily: 'monospace' }}>{t.ticketId}</strong></td>
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
          ) : view === 'CREATE' ? (
            /* CREATE VIEW */
            <div className="glass-card" style={{ padding: '2.5rem', maxWidth: '600px', margin: '0 auto' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Create Support Ticket</h3>

              {formError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={16} />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--color-success)', color: 'var(--color-success)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} />
                  <span>Support ticket created successfully! Redirecting...</span>
                </div>
              )}

              <form onSubmit={handleCreateSubmit}>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input type="text" className="form-input" placeholder="Inquiry details" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Technical">Technical Issue</option>
                      <option value="Billing">Billing / Payment</option>
                      <option value="Account">Account Settings</option>
                      <option value="General">General Inquiry</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Message Details</label>
                  <textarea className="form-input" rows={5} placeholder="State your issue clearly..." value={message} onChange={(e) => setMessage(e.target.value)} required />
                </div>

                <button type="submit" className="gradient-btn" style={{ width: '100%', justifyContent: 'center' }}>
                  Submit Ticket
                </button>
              </form>
            </div>
          ) : (
            /* DETAIL CHAT VIEW */
            selectedTicket && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'start', flex: 1 }}>
                
                {/* Chat Section */}
                <div className="ticket-chat-container">
                  <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>Ticket #{selectedTicket.ticketId}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedTicket.subject}</span>
                    </div>
                    {selectedTicket.status !== 'Closed' && (
                      <button onClick={handleCloseTicket} className="gradient-btn" style={{ background: 'none', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: '0.4rem 0.85rem', fontSize: '0.8rem', boxShadow: 'none' }}>
                        Close Ticket
                      </button>
                    )}
                  </div>

                  {/* Message pane */}
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem', paddingRight: '0.5rem' }}>
                    {selectedTicket.messages?.map((msg, index) => {
                      const isAdminMsg = msg.sender?.role === 'Admin';
                      return (
                        <div key={index} style={{
                          display: 'flex',
                          flexDirection: isAdminMsg ? 'row' : 'row-reverse',
                          gap: '0.75rem',
                          alignItems: 'flex-start',
                          maxWidth: '75%',
                          marginLeft: isAdminMsg ? 0 : 'auto'
                        }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-card-hover)', overflow: 'hidden', flexShrink: 0 }}>
                            <img src={msg.sender?.avatar || 'https://picsum.photos/28'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textAlign: isAdminMsg ? 'left' : 'right' }}>
                              {msg.sender?.name} • {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div style={{
                              padding: '0.75rem 1rem',
                              borderRadius: 'var(--radius-md)',
                              background: isAdminMsg ? 'var(--bg-card-hover)' : 'var(--color-primary)',
                              color: isAdminMsg ? 'var(--text-main)' : '#ffffff',
                              border: isAdminMsg ? '1px solid var(--border-color)' : 'none',
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

                  {/* Send box */}
                  {selectedTicket.status === 'Closed' ? (
                    <div style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <AlertCircle size={16} /> Ticket closed. You cannot send replies.
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

                {/* Ticket Meta details side pane */}
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4>Ticket Info</h4>
                  <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Category:</span>
                      <strong style={{ color: 'var(--text-main)' }}>{selectedTicket.category}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Priority:</span>
                      <strong style={{ color: 'var(--text-main)' }}>{selectedTicket.priority}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Current Status:</span>
                      <strong style={{ color: 'var(--text-main)' }}>{selectedTicket.status}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Assigned to:</span>
                      <strong style={{ color: 'var(--text-main)' }}>{selectedTicket.assignedTo?.name || 'Unassigned'}</strong>
                    </div>
                  </div>
                </div>

              </div>
            )
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default UserSupport;
