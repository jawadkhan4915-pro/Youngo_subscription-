import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, Send, Github, Twitter, MessageCircle } from 'lucide-react';
import './components.css';

const Footer = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for subscribing to our newsletter!');
  };

  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1: Brand details */}
          <div className="footer-col">
            <Link to="/" className="nav-brand" style={{ padding: 0 }}>
              <Sparkles size={20} />
              <span>Youngo</span>
            </Link>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              The premium MERN AI Subscription Sharing Platform. Get secure, credit-allocated access to leading industry tools at a fraction of the cost.
            </p>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)' }}>
              <a href="#" className="theme-toggle" aria-label="Github"><Github size={18} /></a>
              <a href="#" className="theme-toggle" aria-label="Twitter"><Twitter size={18} /></a>
              <a href="#" className="theme-toggle" aria-label="Discord"><MessageCircle size={18} /></a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="footer-col">
            <h4 className="footer-title">Platform</h4>
            <ul className="footer-links">
              <li><Link to="/tools">Browse AI Tools</Link></li>
              <li><Link to="/pricing">Pricing Plans</Link></li>
              <li><Link to="/blogs">Blog Updates</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
            </ul>
          </div>

          {/* Col 3: Legal Links */}
          <div className="footer-col">
            <h4 className="footer-title">Legal</h4>
            <ul className="footer-links">
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/refund">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="footer-col">
            <h4 className="footer-title">Stay Updated</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Subscribe to get notified about new AI tools and features added weekly.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="email"
                  placeholder="Enter email"
                  required
                  style={{
                    width: '100%',
                    padding: '0.6rem 2.5rem 0.6rem 1rem',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    borderRadius: 'var(--radius-md)'
                  }}
                />
                <Mail size={16} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
              <button type="submit" className="gradient-btn" style={{ padding: '0.6rem 1rem' }} aria-label="Subscribe">
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
          display: 'flex',
          justify-content: 'space-between',
          alignItems: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <span>&copy; {new Date().getFullYear()} Youngo Subscription. All rights reserved.</span>
          <span>Designed with premium SaaS metrics.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
