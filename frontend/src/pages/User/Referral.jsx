import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Users, Copy, Check, Gift, Coins, Share2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import './referral.css'; // Let's write a small local stylesheet if needed, or inline/global
import '../dashboard.css';

const UserReferral = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}/register?ref=${user?.referralCode || ''}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock list of referrals for user analytics preview
  const mockReferralLog = [
    { name: 'Hamza Khan', date: '2026-06-18', reward: 20, status: 'Completed' },
    { name: 'Ali Ahmed', date: '2026-06-28', reward: 20, status: 'Completed' }
  ];

  return (
    <>
      <Navbar />
      <div className="dashboard-page-container">
        <Sidebar isAdminPanel={false} />

        <main className="workspace-content">
          <div className="workspace-header">
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Referral Program</h1>
              <p style={{ color: 'var(--text-muted)' }}>Invite your friends and earn premium AI playground credits together.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'start', marginBottom: '3rem' }}>
            
            {/* Link clipboard */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Share2 size={18} /> Invite Friends</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                Share your personalized invite link with developers, designers, or writers. When they register and verify, **both** of you receive **20 free credits** instantly!
              </p>

              <div className="form-group">
                <label className="form-label">Your Referral Link</label>
                <div className="clipboard-box">
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>{referralLink}</span>
                  <button onClick={copyToClipboard} className="theme-toggle" style={{ padding: '0.35rem' }}>
                    {copied ? <Check size={18} style={{ color: 'var(--color-success)' }} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
                <div style={{ flex: 1, padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <h4 style={{ color: 'var(--color-primary)', fontSize: '1.5rem', margin: 0 }}>40 cr</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Referral Earnings</span>
                </div>
                <div style={{ flex: 1, padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <h4 style={{ color: 'var(--color-accent)', fontSize: '1.5rem', margin: 0 }}>2</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Friends Invited</span>
                </div>
              </div>
            </div>

            {/* Loyalty points card */}
            <div className="glass-card" style={{ padding: '2.5rem 2rem', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(6, 182, 212, 0.15))', border: '1px solid rgba(79, 70, 229, 0.2)', textAlign: 'center' }}>
              <div className="feature-icon-wrapper" style={{ marginBottom: '1rem' }}><Gift size={24} /></div>
              <h3 style={{ marginBottom: '0.5rem' }}>Earn Bonuses</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                As you spend credits in the playground or invite active users, you accumulate Loyalty Points which can be redeemed for pro access passes.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', fontWeight: 600, color: 'var(--color-accent)' }}>
                <Coins size={16} /> 120 points accumulated
              </div>
            </div>

          </div>

          {/* Referral ledger */}
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} /> Invite History Logs</h3>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Friend Name</th>
                  <th>Signup Date</th>
                  <th>Reward payout</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {mockReferralLog.map((ref, idx) => (
                  <tr key={idx}>
                    <td>{ref.name}</td>
                    <td>{ref.date}</td>
                    <td><strong style={{ color: 'var(--color-success)' }}>+{ref.reward} credits</strong></td>
                    <td>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(34, 197, 94, 0.1)',
                        color: 'var(--color-success)'
                      }}>
                        {ref.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </main>
      </div>
      <Footer />
    </>
  );
};

export default UserReferral;
