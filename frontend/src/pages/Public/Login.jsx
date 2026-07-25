import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { Lock, Mail, ArrowRight, ShieldAlert, KeyRound, Eye, EyeOff, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import Mascot3D from '../../components/Mascot3D.jsx';
import TiltCard from '../../components/TiltCard.jsx';
import './public.css';

const Login = () => {
  const [email, setEmail] = useState('admin@youngo.com');
  const [password, setPassword] = useState('AdminPassword123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mascotMode, setMascotMode] = useState('idle');

  // OTP Verification state
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
      if (email === 'admin@youngo.com') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setMascotMode('error');
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
      setMascotMode('error');
      setOtpError(result.message || 'Verification failed. Invalid OTP code.');
    }
  };

  return (
    <div className="landing-wrapper">
      <Navbar />

      <div className="auth-wrapper">
        <div className="auth-container">
          
          {/* Left Column: 3D Interactive Mascot Stage */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="auth-stage-col"
          >
            <Mascot3D mode={mascotMode} />
            <h2 className="auth-stage-heading">
              Welcome to <span className="highlight-gradient">Youngo AI</span>
            </h2>
            <p className="auth-stage-sub">
              Your AI assistant is ready. Sign in to access your shared credit wallet & unified playground.
            </p>
            <div className="auth-feature-pills">
              <span className="auth-pill"><Zap size={12} style={{ display: 'inline', marginRight: 4 }} /> Instant Gateway</span>
              <span className="auth-pill"><ShieldCheck size={12} style={{ display: 'inline', marginRight: 4 }} /> 100% OTP Secured</span>
              <span className="auth-pill"><Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} /> 12+ Premium Tools</span>
            </div>
          </motion.div>

          {/* Right Column: Glassmorphism Login Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="auth-card-col"
          >
            <TiltCard maxTilt={6} depth={15} glare={false} className="w-full">
              <div className="glass-card auth-card">
                {!showOTPVerify ? (
                  <>
                    <div className="auth-header">
                      <h2 className="auth-title">Sign In</h2>
                      <p className="auth-subtitle">Enter your credentials to manage AI tools</p>

                      {/* Quick Auto-fill Demo Credentials */}
                      <div className="demo-account-box">
                        <button
                          type="button"
                          className="demo-btn"
                          onClick={() => {
                            setEmail('admin@youngo.com');
                            setPassword('AdminPassword123');
                            setMascotMode('idle');
                          }}
                        >
                          <div style={{ fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                            <KeyRound size={13} /> Auto-fill Admin Demo
                          </div>
                          <div style={{ color: 'var(--text-muted)' }}>
                            Email: <strong style={{ color: 'var(--text-main)' }}>admin@youngo.com</strong> | Pass: <strong style={{ color: 'var(--text-main)' }}>AdminPassword123</strong>
                          </div>
                        </button>

                        <button
                          type="button"
                          className="demo-btn demo-btn-user"
                          onClick={() => {
                            setEmail('user@youngo.com');
                            setPassword('UserPassword123');
                            setMascotMode('idle');
                          }}
                        >
                          <div style={{ fontWeight: 600, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                            <KeyRound size={13} /> Auto-fill Subscriber Demo
                          </div>
                          <div style={{ color: 'var(--text-muted)' }}>
                            Email: <strong style={{ color: 'var(--text-main)' }}>user@youngo.com</strong> | Pass: <strong style={{ color: 'var(--text-main)' }}>UserPassword123</strong>
                          </div>
                        </button>
                      </div>
                    </div>

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
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
                        }}
                      >
                        <ShieldAlert size={16} />
                        <span>{error}</span>
                      </motion.div>
                    )}

                    <form onSubmit={handleLoginSubmit}>
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

                      <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <label className="form-label" style={{ margin: 0 }}>Password</label>
                          <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 500 }}>Forgot password?</Link>
                        </div>
                        <div className="password-input-wrapper">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onFocus={() => setMascotMode('password')}
                            onBlur={() => setMascotMode('idle')}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                          />
                          <Lock size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                          <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={loading} 
                        className="gradient-btn" 
                        style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem', padding: '0.85rem' }}
                      >
                        {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={17} />
                      </button>
                    </form>

                    <div className="auth-footer">
                      Don't have an account? <Link to="/register">Sign up for free</Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="auth-header">
                      <h2 className="auth-title">Verify OTP</h2>
                      <p className="auth-subtitle">We emailed a 6-digit verification code to <strong>{email}</strong></p>
                    </div>

                    {otpError && (
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
                        <span>{otpError}</span>
                      </div>
                    )}

                    <form onSubmit={handleOTPSubmit}>
                      <div className="form-group">
                        <label className="form-label">Enter 6-Digit Code</label>
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

                      <button type="submit" disabled={otpLoading} className="gradient-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                        {otpLoading ? 'Verifying...' : 'Verify OTP'} <ArrowRight size={16} />
                      </button>
                    </form>

                    <div className="auth-footer">
                      Need to change email? <button onClick={() => setShowOTPVerify(false)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}>Go back</button>
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

export default Login;
