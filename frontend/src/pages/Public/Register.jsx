import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { User, Mail, Lock, Gift, ShieldAlert, ArrowRight, KeyRound, Eye, EyeOff, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import Mascot3D from '../../components/Mascot3D.jsx';
import TiltCard from '../../components/TiltCard.jsx';
import './public.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mascotMode, setMascotMode] = useState('idle');

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
      setMascotMode('error');
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
              Join <span className="highlight-gradient">Youngo Subscription</span>
            </h2>
            <p className="auth-stage-sub">
              Create an account to claim 100 free starting credits and explore ChatGPT Plus, Midjourney, Claude, and more.
            </p>
            <div className="auth-feature-pills">
              <span className="auth-pill"><Gift size={12} style={{ display: 'inline', marginRight: 4 }} /> 100 Free Credits</span>
              <span className="auth-pill"><ShieldCheck size={12} style={{ display: 'inline', marginRight: 4 }} /> Instant OTP Signup</span>
              <span className="auth-pill"><Zap size={12} style={{ display: 'inline', marginRight: 4 }} /> Test Before Buying</span>
            </div>
          </motion.div>

          {/* Right Column: Glassmorphism Register Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="auth-card-col"
          >
            <TiltCard maxTilt={4} depth={0} glare={false} className="w-full">
              <div className="glass-card auth-card">
                {!showOTPVerify ? (
                  <>
                    <div className="auth-header">
                      <h2 className="auth-title">Create Account</h2>
                      <p className="auth-subtitle">Get 20 free credits upon verification</p>
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

                    <form onSubmit={handleRegisterSubmit}>
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="John Doe"
                            value={name}
                            onFocus={() => setMascotMode('email')}
                            onBlur={() => setMascotMode('idle')}
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
                        <label className="form-label">Password</label>
                        <div className="password-input-wrapper">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-input"
                            placeholder="At least 6 characters"
                            value={password}
                            onFocus={() => setMascotMode('password')}
                            onBlur={() => setMascotMode('idle')}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
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

                      <div className="form-group">
                        <label className="form-label">Referral Code (Optional)</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. YOUNGO100"
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value)}
                            style={{ paddingLeft: '2.5rem' }}
                          />
                          <Gift size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={loading} 
                        className="gradient-btn" 
                        style={{ width: '100%', justifyContent: 'center', marginTop: '1.25rem', padding: '0.85rem' }}
                      >
                        {loading ? 'Creating Account...' : 'Sign Up Free'} <ArrowRight size={17} />
                      </button>
                    </form>

                    <div className="auth-footer">
                      Already have an account?{' '}
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
                      <h2 className="auth-title">Verify Email</h2>
                      <p className="auth-subtitle">We sent a 6-digit OTP code to <strong>{email}</strong></p>
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
                        {otpLoading ? 'Verifying...' : 'Complete Signup'} <ArrowRight size={16} />
                      </button>
                    </form>

                    <div className="auth-footer">
                      Wrong email address? <button onClick={() => setShowOTPVerify(false)} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}>Go back</button>
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

export default Register;
