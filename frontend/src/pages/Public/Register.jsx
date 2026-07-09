import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { User, Mail, Lock, Gift, ShieldAlert, ArrowRight, KeyRound } from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import './public.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Verification state
  const [showOTPVerify, setShowOTPVerify] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const { register, verifyEmailOTP } = useAuth();
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(name, email, password, referralCode);
    setLoading(false);

    if (result.success) {
      setShowOTPVerify(true);
    } else {
      setError(result.message || 'Registration failed. Please try again.');
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
            /* 1. Register Form */
            <>
              <div className="auth-header">
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Get 20 free credits upon verification</p>
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

              <form onSubmit={handleRegisterSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <User size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Minimum 6 characters"
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Referral Code (Optional)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="YGO-XXXXXX"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <Gift size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="gradient-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                  {loading ? 'Creating Account...' : 'Sign Up'} <ArrowRight size={16} />
                </button>
              </form>

              <div className="auth-footer">
                Already have an account? <Link to="/login">Sign in</Link>
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
                Did not receive OTP? <button onClick={() => setShowOTPVerify(false)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }}>Resend code</button>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Register;
