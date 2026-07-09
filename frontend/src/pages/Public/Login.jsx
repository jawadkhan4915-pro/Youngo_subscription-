import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Lock, Mail, ArrowRight, ShieldAlert, KeyRound } from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import './public.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Verification state fallback
  const [showOTPVerify, setShowOTPVerify] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const { login, verifyEmailOTP } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Re-fetch context check
      if (email === 'admin@youngo.com') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      // Check if user is unverified
      if (result.message && result.message.includes('verify your email')) {
        setShowOTPVerify(true);
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setOtpError('');
    setOtpLoading(true);

    const result = await verifyEmailOTP(email, otp);
    setOtpLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setOtpError(result.message || 'Verification failed. Invalid OTP code.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-wrapper">
        <div className="glass-card auth-card">
          {!showOTPVerify ? (
            /* 1. Login Form */
            <>
              <div className="auth-header">
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Sign in to your premium AI playground</p>
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

              <form onSubmit={handleLoginSubmit}>
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

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Password</label>
                    <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}>Forgot password?</Link>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="gradient-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                  {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
                </button>
              </form>

              <div className="auth-footer">
                Don't have an account? <Link to="/register">Sign up</Link>
              </div>
            </>
          ) : (
            /* 2. OTP Verification Form */
            <>
              <div className="auth-header">
                <h2 className="auth-title">Verify Email</h2>
                <p className="auth-subtitle">We sent a 6-digit OTP code to <strong>{email}</strong></p>
              </div>

              {otpError && (
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
                  <span>{otpError}</span>
                </div>
              )}

              <form onSubmit={handleOTPSubmit}>
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

                <button type="submit" disabled={otpLoading} className="gradient-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                  {otpLoading ? 'Verifying...' : 'Verify OTP'} <ArrowRight size={16} />
                </button>
              </form>

              <div className="auth-footer">
                Wrong email address? <button onClick={() => setShowOTPVerify(false)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }}>Go back</button>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
