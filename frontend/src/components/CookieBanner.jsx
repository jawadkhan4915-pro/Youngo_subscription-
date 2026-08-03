import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X, Check } from 'lucide-react';
import './components.css';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('youngo_cookie_consent');
    if (!consent) {
      // Show banner after 1s delay
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('youngo_cookie_consent', 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner-glass">
      <div className="cookie-banner-content">
        <Cookie size={24} className="cookie-icon" />
        <div className="cookie-text">
          <p>
            We use cookies & storage to keep you logged in and optimize performance. 
            We are an API provider and do not own third-party AI chat bots. Read our{' '}
            <Link to="/terms" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Terms of Service</Link>{' '}
            and{' '}
            <Link to="/privacy" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Privacy Policy</Link>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button onClick={handleAccept} className="gradient-btn" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
            <Check size={14} /> Accept & Close
          </button>
          <button onClick={() => setVisible(false)} className="theme-toggle" title="Dismiss">
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
