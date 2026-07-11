import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import Navbar from '../../components/Navbar.jsx';
import api from '../../services/api.js';
import { Shield, Sparkles, Megaphone, Save, Bell } from 'lucide-react';
import '../dashboard.css';

const AdminSettings = () => {
  // System Settings state
  const [maintenance, setMaintenance] = useState(false);
  const [bankAccount, setBankAccount] = useState('1234-5678-9012');
  const [easyPaisa, setEasyPaisa] = useState('0300-1234567');
  const [jazzCash, setJazzCash] = useState('0312-7654321');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Announcement publisher state
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annEndDate, setAnnEndDate] = useState('');
  const [annSuccess, setAnnSuccess] = useState('');
  const [annError, setAnnError] = useState('');
  const [annLoading, setAnnLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/settings/public');
        if (res.data?.success) {
          const s = res.data.data;
          setBankAccount(s.bank_account || '1234-5678-9012');
          setEasyPaisa(s.easypaisa_number || '0300-1234567');
          setJazzCash(s.jazzcash_number || '0312-7654321');
          setMaintenance(s.maintenance_mode === true || s.maintenance_mode === 'true');
        }
      } catch (err) {
        console.error('Failed to fetch system settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/settings/admin/settings/batch', {
        bank_account: bankAccount,
        easypaisa_number: easyPaisa,
        jazzcash_number: jazzCash,
        maintenance_mode: maintenance
      });

      if (res.data?.success) {
        setSuccess('System settings successfully synced to database!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update system settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishAnnouncement = async (e) => {
    e.preventDefault();
    setAnnSuccess('');
    setAnnError('');
    setAnnLoading(true);

    try {
      const res = await api.post('/settings/announcements', {
        title: annTitle,
        message: annMessage,
        endDate: annEndDate
      });

      if (res.data?.success) {
        setAnnSuccess('System announcement banner published successfully! Reload page to view.');
        setAnnTitle('');
        setAnnMessage('');
        setAnnEndDate('');
        setTimeout(() => setAnnSuccess(''), 4000);
      }
    } catch (err) {
      setAnnError(err.response?.data?.error || 'Failed to publish announcement');
    } finally {
      setAnnLoading(false);
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
              <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>System Settings</h1>
              <p style={{ color: 'var(--text-muted)' }}>Configure platform maintenance modes, bank details, and notification thresholds.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start', marginBottom: '3rem' }}>
            
            {/* 1. Global Settings Form */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={18} style={{ color: 'var(--color-primary)' }} /> Core Configurations
              </h3>

              {success && <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--color-success)', color: 'var(--color-success)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>{success}</div>}
              {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>{error}</div>}

              <form onSubmit={handleSaveSettings}>
                <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                  <div>
                    <h4 style={{ margin: 0 }}>Maintenance Mode</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Toggles public offline splash screen.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenance}
                    onChange={(e) => setMaintenance(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Default Bank Account Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">EasyPaisa Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={easyPaisa}
                    onChange={(e) => setEasyPaisa(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">JazzCash Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={jazzCash}
                    onChange={(e) => setJazzCash(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="gradient-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}>
                  <Save size={16} /> {loading ? 'Saving configuration...' : 'Save Settings'}
                </button>
              </form>
            </div>

            {/* 2. Announcement Publisher Form */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Megaphone size={18} style={{ color: 'var(--color-accent)' }} /> Announcement Publisher
              </h3>

              {annSuccess && <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--color-success)', color: 'var(--color-success)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>{annSuccess}</div>}
              {annError && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>{annError}</div>}

              <form onSubmit={handlePublishAnnouncement}>
                <div className="form-group">
                  <label className="form-label">Announcement Title / Prefix</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. SYSTEM MAINTENANCE"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Announcement Message Body</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="Provide detailed instruction to users..."
                    value={annMessage}
                    onChange={(e) => setAnnMessage(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expiry End Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={annEndDate}
                    onChange={(e) => setAnnEndDate(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" disabled={annLoading} className="gradient-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem', background: 'var(--color-accent)' }}>
                  <Bell size={16} /> {annLoading ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </form>
            </div>

          </div>
        </main>
      </div>
    </>
  );
};

export default AdminSettings;
