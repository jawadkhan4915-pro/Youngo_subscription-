import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Coins, 
  Users, 
  Bot, 
  Layers, 
  CreditCard, 
  Rocket, 
  Star,
  ChevronRight
} from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import TiltCard from '../../components/TiltCard.jsx';
import Hero3DCanvas from '../../components/Hero3DCanvas.jsx';
import AIAgentsMarquee from '../../components/AIAgentsMarquee.jsx';
import api from '../../services/api.js';
import './public.css';

const Home = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  // Container motion stagger variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <div className="landing-wrapper">
      <Navbar />
      
      {/* 1. Hero Section with 3D Canvas */}
      <section className="hero-section">
        <div className="hero-mesh-bg"></div>
        <div className="hero-grid-overlay"></div>
        
        <div className="container hero-container">
          <div className="hero-left-content">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="hero-badge"
            >
              <Sparkles size={15} className="hero-badge-sparkle" />
              <span>Next-Gen MERN AI Subscription Engine</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="hero-title"
            >
              Unlock <span className="highlight-gradient">All Premium AI Tools</span> <br />
              With One Shared Wallet
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hero-desc"
            >
              Streamline your workflow with instant access to <strong>ChatGPT Plus, Gemini Advanced, Claude 3.5, Midjourney v6, and ElevenLabs</strong>. Pay only for the credits you use with direct receipt verification and zero monthly markup.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hero-actions"
            >
              <Link to="/tools" className="gradient-btn hero-cta-primary">
                <span>Explore AI Playground</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/pricing" className="glass-btn hero-cta-secondary">
                <span>View Credit Plans</span>
              </Link>
            </motion.div>

            {/* Social Trust Metrics */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="hero-trust-bar"
            >
              <div className="trust-item">
                <div className="trust-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <span className="trust-text"><strong>4.9/5</strong> rating by 2,400+ creators</span>
              </div>
              <div className="trust-divider" />
              <div className="trust-item">
                <ShieldCheck size={16} color="#10b981" />
                <span className="trust-text">100% Instant OTP & Receipt Audits</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: 3D Perspective Canvas */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-right-stage"
          >
            <Hero3DCanvas />
          </motion.div>
        </div>
      </section>

      {/* Supported AI Agents Showcase */}
      <AIAgentsMarquee />

      {/* 2. Popular AI Tools 3D Catalog */}
      <section className="slider-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">UNLIMITED CREATIVITY</span>
            <h2 className="section-title">Popular AI Tools Playground</h2>
            <p className="section-desc">Launch top-tier conversational, code, image, and voice models right from your browser.</p>
          </div>

          {loading ? (
            <div className="catalog-loading">
              <div className="loading-spinner"></div>
              <span>Fetching premium tools catalog...</span>
            </div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-50px' }}
              className="tools-grid"
            >
              {tools.map((tool) => (
                <TiltCard 
                  key={tool._id} 
                  maxTilt={10} 
                  depth={20} 
                  className="tool-card-wrapper"
                  onClick={() => navigate(`/tools/${tool._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="glass-card tool-card">
                    <div className="tool-card-top">
                      <img src={tool.logo || 'https://picsum.photos/48'} alt={tool.name} className="tool-logo" />
                      <div className="tool-meta">
                        <h3 className="tool-name">{tool.name}</h3>
                        <span className="tool-cat-badge">{tool.category?.name || 'AI Assistant'}</span>
                      </div>
                    </div>
                    <p className="tool-desc">{tool.description}</p>
                    <div className="tool-card-bottom">
                      <div className="tool-price-tag">
                        <span className="price-num">{tool.price} PKR</span>
                        <span className="price-unit">/ {tool.creditsPerPurchase} credits</span>
                      </div>
                      <Link to={`/tools/${tool._id}`} className="tool-link-btn">
                        <span>Details</span>
                        <ChevronRight size={15} />
                      </Link>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* 3. Interactive 3D Feature Matrix */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">WHY CHOOSE YOUNGO</span>
            <h2 className="section-title">Engineered For Developers & Digital Creators</h2>
            <p className="section-desc">We deliver maximum cost efficiency, security, and unified AI access under one platform.</p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            className="features-grid"
          >
            <TiltCard maxTilt={12} depth={25}>
              <motion.div variants={fadeInUp} className="glass-card feature-card">
                <div className="feature-icon-wrapper icon-purple">
                  <Coins size={26} />
                </div>
                <h3 className="feature-title">90% Cost Savings</h3>
                <p className="feature-desc">Avoid paying $20/mo individually to ChatGPT, Midjourney, Claude, and ElevenLabs. Access all under one wallet balance.</p>
              </motion.div>
            </TiltCard>

            <TiltCard maxTilt={12} depth={25}>
              <motion.div variants={fadeInUp} className="glass-card feature-card">
                <div className="feature-icon-wrapper icon-cyan">
                  <Zap size={26} />
                </div>
                <h3 className="feature-title">Unified AI Gateway</h3>
                <p className="feature-desc">Interact with conversational LLMs, generate 8K photorealistic art, and synthesize speech from a single dashboard.</p>
              </motion.div>
            </TiltCard>

            <TiltCard maxTilt={12} depth={25}>
              <motion.div variants={fadeInUp} className="glass-card feature-card">
                <div className="feature-icon-wrapper icon-emerald">
                  <ShieldCheck size={26} />
                </div>
                <h3 className="feature-title">Manual Receipt Verification</h3>
                <p className="feature-desc">Deposit funds via mobile banking or cash, submit your receipt reference, and get instant verified credit allocation.</p>
              </motion.div>
            </TiltCard>
          </motion.div>
        </div>
      </section>

      {/* 4. 3D How It Works Stepper */}
      <section className="workflow-section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">THREE SIMPLE STEPS</span>
            <h2 className="section-title">How Youngo Works</h2>
            <p className="section-desc">Get started in under 3 minutes with seamless OTP setup and manual payment verification.</p>
          </div>

          <div className="workflow-grid">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="glass-card workflow-step-card"
            >
              <div className="step-num-badge">01</div>
              <div className="step-icon-box">
                <Users size={24} color="#6366f1" />
              </div>
              <h3 className="step-title">Create & Verify Account</h3>
              <p className="step-desc">Register with your email and verify your identity instantly using the secure 6-digit OTP code sent to your inbox.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              viewport={{ once: true }}
              className="glass-card workflow-step-card"
            >
              <div className="step-num-badge badge-purple">02</div>
              <div className="step-icon-box icon-purple">
                <CreditCard size={24} color="#8b5cf6" />
              </div>
              <h3 className="step-title">Deposit Wallet Balance</h3>
              <p className="step-desc">Transfer cash via your local mobile wallet or bank app, upload your receipt screenshot, and receive rapid manual approval.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="glass-card workflow-step-card"
            >
              <div className="step-num-badge badge-cyan">03</div>
              <div className="step-icon-box icon-cyan">
                <Rocket size={24} color="#06b6d4" />
              </div>
              <h3 className="step-title">Launch AI Playground</h3>
              <p className="step-desc">Use your verified wallet balance to prompt ChatGPT, Midjourney, Claude, and more without individual subscription limits.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Statistics Overview Banner */}
      <section className="stats-section">
        <div className="container">
          <TiltCard maxTilt={6} depth={15}>
            <div className="glass-card stats-banner">
              <div className="stat-col">
                <h3 className="stat-number">15,000+</h3>
                <p className="stat-label">AI Prompts Executed</p>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-col">
                <h3 className="stat-number stat-purple">2,400+</h3>
                <p className="stat-label">Active Subscribers</p>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-col">
                <h3 className="stat-number stat-cyan">12+</h3>
                <p className="stat-label">Premium Shared Tools</p>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-col">
                <h3 className="stat-number stat-emerald">99.9%</h3>
                <p className="stat-label">Uptime Guarantee</p>
              </div>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* 6. Glorious Final CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="glass-card cta-card">
            <div className="cta-glow-orb" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="cta-content"
            >
              <span className="cta-badge">
                <Sparkles size={14} /> Ready to elevate your workflow?
              </span>
              <h2 className="cta-title">
                Start Exploring Next-Gen AI Tools Today
              </h2>
              <p className="cta-desc">
                Join thousands of students, developers, and creators leveraging Youngo's shared credit wallet system.
              </p>
              <div className="cta-buttons">
                <Link to="/register" className="gradient-btn cta-btn">
                  <span>Create Free Account</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/tools" className="glass-btn cta-btn-secondary">
                  <span>Browse All Tools</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
