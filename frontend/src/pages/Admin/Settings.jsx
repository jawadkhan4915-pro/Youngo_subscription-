import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar.jsx';
import Navbar from '../../components/Navbar.jsx';
import api from '../../services/api.js';
import '../dashboard.css';

const AdminSettings = () => {
  const [maintenance, setMaintenance] = useState(false);
  const [bankAccount, setBankAccount] = useState('1234-5678-9012');
  const [easyPaisa, setEasyPaisa] = useState('0300-1234567');
  const [success, setSuccess] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSuccess('System settings updated successfully!');
    setTimeout(() => setSuccess(''), 2500);
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

          {success && <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--color-success)', color: 'var(--color-success)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>{success}</div>}

          <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px' }}>
            <form onSubmit={handleSave}>
              <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
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

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
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

              <button type="submit" className="gradient-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}>
                Save Settings
              </button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminSettings;
