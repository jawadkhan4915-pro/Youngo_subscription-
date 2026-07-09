import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Zap, Coins, Users, MessageSquareCode } from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import api from '../../services/api.js';
import './public.css';

const Home = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const res = await api.get('/tools');
        if (res.data?.success) {
          setTools(res.data.data);
        }
      } catch (err) {
        console.error('Error loading landing tools:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, []);

  return (
    <>
      <Navbar />
      
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="hero-grid"></div>
        <div className="container hero-content">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-badge"
          >
            <Sparkles size={14} />
            <span>Premium MERN AI Subscription Hub</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="hero-title"
          >
            Unlock All Premium AI Tools <br />
            With One Single Wallet
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hero-desc"
          >
            Access ChatGPT Plus, Gemini Advanced, Claude Pro, Midjourney, ElevenLabs, and more. 
            Pay for the credits you use, with manual receipt verification and instant dashboard activation.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="hero-actions"
          >
            <Link to="/tools" className="gradient-btn" style={{ fontSize: '1.05rem', padding: '0.85rem 2rem' }}>
              Explore AI Tools <ArrowRight size={18} />
            </Link>
            <Link to="/pricing" style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.85rem 2rem',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              fontSize: '1.05rem',
              fontWeight: 500
            }}>
              View Pricing
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. Popular Tools Slider */}
      <section className="slider-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Popular AI Tools Available</h2>
            <p className="section-desc">Instantly unlock and chat or generate images using premium shared memberships.</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading AI Playground Catalog...</div>
          ) : (
            <div className="slider-container">
              {tools.map((tool) => (
                <motion.div 
                  key={tool._id} 
                  whileHover={{ y: -4 }}
                  className="glass-card tool-card"
                >
                  <div className="tool-header">
                    <img src={tool.logo || 'https://picsum.photos/48'} alt={tool.name} className="tool-logo" />
                    <div className="tool-meta">
                      <span className="tool-name">{tool.name}</span>
                      <span className="tool-cat">{tool.category?.name || 'AI Assistant'}</span>
                    </div>
                  </div>
                  <p className="tool-desc">{tool.description}</p>
                  <div className="tool-price-row">
                    <span className="tool-price">{tool.price} PKR <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ {tool.creditsPerPurchase} cr</span></span>
                    <Link to={`/tools/${tool._id}`} style={{
                      color: 'var(--color-primary)',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      Details <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Why Choose Us */}
      <section className="container" style={{ padding: '6rem 1.5rem' }}>
        <div className="section-header">
          <h2 className="section-title">Why Choose Youngo?</h2>
          <p className="section-desc">We deliver the ultimate value proposition for developers, researchers, and creators.</p>
        </div>

        <div className="features-grid">
          <div className="glass-card feature-card">
            <div className="feature-icon-wrapper">
              <Coins size={24} />
            </div>
            <h3 className="feature-title">Extremely Affordable</h3>
            <p className="feature-desc">Instead of spending 60k+ PKR/mo subscribing to 10+ AI tools, access all of them under shared wallets.</p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon-wrapper">
              <Zap size={24} />
            </div>
            <h3 className="feature-title">Unified Playground</h3>
            <p className="feature-desc">Prompt ChatGPT, Claude, generate images with Midjourney, and synthesize speech from a single dashboard.</p>
          </div>

          <div className="glass-card feature-card">
            <div className="feature-icon-wrapper">
              <ShieldCheck size={24} />
            </div>
            <h3 className="feature-title">Secure & Transparent</h3>
            <p className="feature-desc">Manual payment validation checks guarantee direct receipt audits and secure credit additions.</p>
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section style={{ background: 'rgba(30, 41, 59, 0.15)', padding: '5rem 0' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-desc">Get setup and running in under three minutes.</p>
          </div>

          <div className="grid-cols-3" style={{ textAlign: 'center' }}>
            <div style={{ padding: '1rem' }}>
              <h3 style={{ color: 'var(--color-primary)', fontSize: '2.5rem', marginBottom: '1rem' }}>01</h3>
              <h4 style={{ marginBottom: '0.5rem' }}>Create Account</h4>
              <p style={{ color: 'var(--text-muted)' }}>Register with email and verify using the instant 6-digit OTP code.</p>
            </div>
            <div style={{ padding: '1rem' }}>
              <h3 style={{ color: 'var(--color-secondary)', fontSize: '2.5rem', marginBottom: '1rem' }}>02</h3>
              <h4 style={{ marginBottom: '0.5rem' }}>Add Wallet Balance</h4>
              <p style={{ color: 'var(--text-muted)' }}>Select desired AI tools, transfer money via bank or mobile cash, and upload receipt screenshot.</p>
            </div>
            <div style={{ padding: '1rem' }}>
              <h3 style={{ color: 'var(--color-accent)', fontSize: '2.5rem', marginBottom: '1rem' }}>03</h3>
              <h4 style={{ marginBottom: '0.5rem' }}>Start AI Playground</h4>
              <p style={{ color: 'var(--text-muted)' }}>Once verified, access the secure playground interface and prompt premium tools instantly!</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Statistics Overview */}
      <section className="container" style={{ padding: '5rem 1.5rem' }}>
        <div className="glass-card" style={{ padding: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          <div>
            <h3 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-primary)' }}>15,000+</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Total Prompts Ran</p>
          </div>
          <div>
            <h3 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-secondary)' }}>2,400+</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Active Subscribers</p>
          </div>
          <div>
            <h3 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-accent)' }}>12+</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Premium Tools Shared</p>
          </div>
          <div>
            <h3 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-success)' }}>99.9%</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Shared API Uptime</p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Home;
