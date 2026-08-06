import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, KeyRound, ShieldAlert, CheckCircle2, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import Mascot3D from '../../components/Mascot3D.jsx';
import TiltCard from '../../components/TiltCard.jsx';
import api from '../../services/api.js';
import './public.css';

const ForgotResetPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mascotMode, setMascotMode] = useState('idle');

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
      setMascotMode('error');
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
      setMascotMode('error');
      setError(err.response?.data?.error || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-wrapper">
      <Navbar />

      <div className="auth-wrapper">
        <div className="auth-container">
          
          {/* Left Column: 3D Mascot Stage */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="auth-stage-col"
          >
            <Mascot3D mode={mascotMode} />
            <h2 className="auth-stage-heading">Account Recovery</h2>
            <p className="auth-stage-sub">
              Don't worry! We will dispatch a secure 6-digit OTP code to verify ownership and reset your password.
            </p>
            <div className="auth-feature-pills">
              <span className="auth-pill"><ShieldCheck size={12} style={{ display: 'inline', marginRight: 4 }} /> Instant OTP Reset</span>
              <span className="auth-pill"><Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} /> 256-Bit Encrypted</span>
            </div>
          </motion.div>

          {/* Right Column: Auth Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="auth-card-col"
          >
            <TiltCard maxTilt={4} depth={0} glare={false} className="w-full">
              <div className="glass-card auth-card">
                {success ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                    <CheckCircle2 size={52} style={{ color: 'var(--color-success)', margin: '0 auto 1rem auto' }} />
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>Password Reset!</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                      Your password has been changed successfully. Redirecting you to login screen...
                    </p>
                  </div>
                ) : step === 1 ? (
                  <>
                    <div className="auth-header">
                      <h2 className="auth-title">Forgot Password</h2>
                      <p className="auth-subtitle">Enter registered email to receive reset OTP</p>
                    </div>

                    {error && (
                      <div style={{
                        background: 'rgba(244, 63, 94, 0.1)',
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
                            placeholder="name@example.com"
                            value={email}
                            onFocus={() => setMascotMode('email')}
                            onBlur={() => setMascotMode('idle')}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ paddingLeft: '2.5rem' }}
                          />
                          <Mail size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        </div>
                      </div>

                      <button type="submit" disabled={loading} className="gradient-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem', padding: '0.85rem' }}>
                        {loading ? 'Sending Code...' : 'Send Reset Code'} <ArrowRight size={17} />
                      </button>
                    </form>

                    <div className="auth-footer">
                      Remember password?{' '}
                      <Link 
                        to="/login" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/login');
                        }}
                      >
                        Sign in
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="auth-header">
                      <h2 className="auth-title">Reset Password</h2>
                      <p className="auth-subtitle">Enter 6-digit OTP code and new password</p>
                    </div>

                    {error && (
                      <div style={{
                        background: 'rgba(244, 63, 94, 0.1)',
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
                        <label className="form-label">Enter 6-Digit OTP Code</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="123456"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            style={{ paddingLeft: '2.5rem', letterSpacing: '0.4em', fontWeight: 'bold', fontSize: '1.25rem', textAlign: 'center' }}
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
                            placeholder="••••••••"
                            value={newPassword}
                            onFocus={() => setMascotMode('password')}
                            onBlur={() => setMascotMode('idle')}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            style={{ paddingLeft: '2.5rem' }}
                          />
                          <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        </div>
                      </div>

                      <button type="submit" disabled={loading} className="gradient-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem', padding: '0.85rem' }}>
                        {loading ? 'Updating Password...' : 'Reset Password'} <ArrowRight size={17} />
                      </button>
                    </form>

                    <div className="auth-footer">
                      Wrong email? <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}>Start over</button>
                    </div>
                  </>
                )}
              </div>
            </TiltCard>
          </motion.div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ForgotResetPassword;
