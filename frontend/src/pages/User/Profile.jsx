import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { User, Lock, Trash2, KeyRound, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import Navbar from '../../components/Navbar.jsx';
import api from '../../services/api.js';
import '../dashboard.css';

const UserProfile = () => {
  const { user, updateUserProfile } = useAuth();
  
  // Profile update form
  const [name, setName] = useState(user?.name || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Change Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // Delete Account
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    setProfileLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const result = await updateUserProfile(formData);
    setProfileLoading(false);

    if (result.success) {
      setProfileSuccess(true);
      setAvatarFile(null);
    } else {
      setProfileError(result.message || 'Profile update failed');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);
    setPassLoading(true);

    try {
      const res = await api.put('/auth/changepassword', { currentPassword, newPassword });
      if (res.data?.success) {
        setPassSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      setPassError(err.response?.data?.error || 'Password update failed');
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: Are you absolutely sure you want to permanently delete your Youngo account? This action is irreversible and you will lose all remaining credits.')) return;
    
    setDeleteLoading(true);
    try {
      const res = await api.delete('/auth/deleteaccount');
      if (res.data?.success) {
        window.location.href = '/';
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete account');
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-page-container">
        <Sidebar isAdminPanel={false} />

        <main className="workspace-content">
          <div className="workspace-header">
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Profile & Settings</h1>
              <p style={{ color: 'var(--text-muted)' }}>Configure your identity preferences, credentials, and avatar uploads.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start', marginBottom: '3rem' }}>
            
            {/* Profile Update Details */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={18} /> Profile Details</h3>
              
              {profileError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={16} />
                  <span>{profileError}</span>
                </div>
              )}

              {profileSuccess && (
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--color-success)', color: 'var(--color-success)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <form onSubmit={handleProfileSubmit}>
                <div className="form-group" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 1rem auto', border: '2px solid var(--border-color)' }}>
                    <img src={user?.avatar || 'https://picsum.photos/80'} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files[0])}
                    style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address (Read Only)</label>
                  <input type="email" className="form-input" value={user?.email || ''} disabled style={{ cursor: 'not-allowed', opacity: 0.6 }} />
                </div>

                <button type="submit" disabled={profileLoading} className="gradient-btn" style={{ width: '100%', justifyContent: 'center' }}>
                  {profileLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            </div>

            {/* Change Password Panel */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Lock size={18} /> Security & Password</h3>
              
              {passError && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={16} />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--color-success)', color: 'var(--color-success)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} />
                  <span>Password changed successfully!</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Minimum 6 characters"
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" disabled={passLoading} className="gradient-btn" style={{ width: '100%', justifyContent: 'center' }}>
                  {passLoading ? 'Updating Password...' : 'Change Password'}
                </button>
              </form>

              {/* Danger Zone */}
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '2.5rem', paddingTop: '1.5rem' }}>
                <h5 style={{ color: 'var(--color-danger)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Trash2 size={14} /> Danger Zone</h5>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem', lineHeight: '1.4' }}>
                  Permanently remove your account, subscription parameters, billing invoice details, and logs from our servers.
                </p>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  style={{
                    width: '100%',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--color-danger)',
                    color: 'var(--color-danger)',
                    padding: '0.6rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  {deleteLoading ? 'Deleting Account...' : 'Delete Account'}
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;
