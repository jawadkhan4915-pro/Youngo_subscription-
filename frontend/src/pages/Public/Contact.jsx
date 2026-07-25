import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle2, Sparkles, MessageSquare } from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import TiltCard from '../../components/TiltCard.jsx';
import './public.css';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="landing-wrapper">
      <Navbar />

      <div className="hero-mesh-bg" />
      <div className="hero-grid-overlay" />

      <div className="container" style={{ padding: '4rem 1.5rem 6rem 1.5rem', minHeight: '80vh', position: 'relative', zIndex: 5 }}>
        
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <span className="hero-badge">
            <MessageSquare size={14} className="text-indigo-400" /> Support & Inquiry
          </span>
          <h1 className="section-title">
            Get in <span className="highlight-gradient">Touch</span>
          </h1>
          <p className="section-desc">
            Have queries about bulk AI licenses, credits, or custom subscriptions? Send us a message.
          </p>
        </motion.div>

        {/* 2-Column Responsive Layout */}
        <div className="grid-cols-2-responsive" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start', marginBottom: '4rem' }}>
          
          {/* Info Details */}
          <motion.div 
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}
          >
            <TiltCard maxTilt={8} depth={15}>
              <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <div className="feature-icon-wrapper" style={{ margin: 0 }}>
                  <Mail size={22} />
                </div>
                <div>
                  <h4 style={{ marginBottom: '0.25rem', fontSize: '1.1rem' }}>Email Support</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>support@youngo.com</p>
                </div>
              </div>
            </TiltCard>

            <TiltCard maxTilt={8} depth={15}>
              <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <div className="feature-icon-wrapper icon-purple" style={{ margin: 0 }}>
                  <Phone size={22} />
                </div>
                <div>
                  <h4 style={{ marginBottom: '0.25rem', fontSize: '1.1rem' }}>Call Sales</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>+92 300 1234567</p>
                </div>
              </div>
            </TiltCard>

            <TiltCard maxTilt={8} depth={15}>
              <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <div className="feature-icon-wrapper icon-cyan" style={{ margin: 0 }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 style={{ marginBottom: '0.25rem', fontSize: '1.1rem' }}>Location</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>DHA Phase 6, Lahore, Pakistan</p>
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <TiltCard maxTilt={5} depth={10} glare={false}>
              <div className="glass-card" style={{ padding: '2.75rem 2.25rem' }}>
                {submitted ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
                    <CheckCircle2 size={52} style={{ color: 'var(--color-success)', margin: '0 auto 1.5rem auto' }} />
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>Message Dispatched!</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                      Thank you for reaching out. A customer support agent will respond to your email address within 24 hours.
                    </p>
                    <button onClick={() => setSubmitted(false)} className="gradient-btn" style={{ marginTop: '1.75rem', padding: '0.75rem 1.75rem' }}>Send Another Query</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input type="text" className="form-input" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input type="email" className="form-input" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <input type="text" className="form-input" placeholder="Billing question / customized plan" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Message Details</label>
                      <textarea className="form-input" rows={5} placeholder="Describe your inquiry in detail..." value={message} onChange={(e) => setMessage(e.target.value)} required />
                    </div>

                    <button type="submit" className="gradient-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.85rem' }}>
                      Send Message <Send size={16} />
                    </button>
                  </form>
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

export default Contact;
