import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import api from '../../services/api.js';
import './public.css';

const ForgotResetPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1 = input email, 2 = input OTP & new password
  
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgotpassword', { email });
      if (res.data?.success) {
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to dispatch reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/resetpassword', { email, otp, newPassword });
      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-wrapper">
        <div className="glass-card auth-card">
          {success ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <CheckCircle2 size={48} style={{ color: 'var(--color-success)', margin: '0 auto 1rem auto' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>Password Reset!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Your password has been changed successfully. Redirecting you to login screen...
              </p>
            </div>
          ) : step === 1 ? (
            /* Step 1: Request OTP */
            <>
              <div className="auth-header">
                <h2 className="auth-title">Forgot Password</h2>
                <p className="auth-subtitle">Enter email to receive password reset OTP</p>
              </div>

              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--color-danger)',
                  color: 'var(--color-danger)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <ShieldAlert size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleForgotSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="gradient-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                  {loading ? 'Sending Code...' : 'Send Reset Code'} <ArrowRight size={16} />
                </button>
              </form>

              <div className="auth-footer">
                Remember password? <Link to="/login">Sign in</Link>
              </div>
            </>
          ) : (
            /* Step 2: Input OTP & Reset */
            <>
              <div className="auth-header">
                <h2 className="auth-title">Reset Password</h2>
                <p className="auth-subtitle">Verify OTP and enter your new password</p>
              </div>

              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--color-danger)',
                  color: 'var(--color-danger)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <ShieldAlert size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleResetSubmit}>
                <div className="form-group">
                  <label className="form-label">Enter 6-Digit OTP</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="123456"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      style={{ paddingLeft: '2.5rem', letterSpacing: '0.5em', fontWeight: 'bold', fontSize: '1.25rem', textAlign: 'center' }}
                    />
                    <KeyRound size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Minimum 6 characters"
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="gradient-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                  {loading ? 'Resetting Password...' : 'Reset Password'} <ArrowRight size={16} />
                </button>
              </form>

              <div className="auth-footer">
                Wrong email? <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }}>Go back</button>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ForgotResetPassword;
