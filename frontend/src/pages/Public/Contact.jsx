import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
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
    <>
      <Navbar />
      <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>Get in Touch</h1>
          <p style={{ color: 'var(--text-muted)' }}>Have queries about bulk AI licenses, credits, or custom subscriptions? Send us a message.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem', alignItems: 'start', marginBottom: '4rem' }}>
          
          {/* Info Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="feature-icon-wrapper" style={{ margin: 0 }}>
                <Mail size={20} />
              </div>
              <div>
                <h4 style={{ marginBottom: '0.25rem' }}>Email Support</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>support@youngo.com</p>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="feature-icon-wrapper" style={{ margin: 0 }}>
                <Phone size={20} />
              </div>
              <div>
                <h4 style={{ marginBottom: '0.25rem' }}>Call Sales</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>+92 300 1234567</p>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="feature-icon-wrapper" style={{ margin: 0 }}>
                <MapPin size={20} />
              </div>
              <div>
                <h4 style={{ marginBottom: '0.25rem' }}>Location</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>DHA Phase 6, Lahore, Pakistan</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="glass-card" style={{ padding: '2.5rem' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <CheckCircle2 size={48} style={{ color: 'var(--color-success)', margin: '0 auto 1.5rem auto' }} />
                <h3 style={{ marginBottom: '0.5rem' }}>Message Dispatched!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  Thank you for reaching out. A customer agent will respond to your email address within 24 hours.
                </p>
                <button onClick={() => setSubmitted(false)} className="gradient-btn" style={{ marginTop: '1.5rem', padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>Send another query</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" placeholder="John" value={name} onChange={(e) => setName(e.target.value)} required />
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
                  <textarea className="form-input" rows={5} placeholder="Describe your inquiry..." value={message} onChange={(e) => setMessage(e.target.value)} required />
                </div>

                <button type="submit" className="gradient-btn" style={{ width: '100%', justifyContent: 'center' }}>
                  Send Message <Send size={16} />
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;
