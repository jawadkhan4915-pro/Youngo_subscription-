import React from 'react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import './public.css';

const Privacy = () => {
  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '80vh', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Last updated: July 9, 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: '1.7', color: 'var(--text-muted)' }}>
          <p>
            At Youngo Subscription, accessible from our website, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Youngo and how we use it.
          </p>

          <h3 style={{ color: 'var(--text-main)' }}>1. Information We Collect</h3>
          <p>
            When you register for an Account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number. We also collect uploaded payment receipt screenshot proof to audit manual order transactions.
          </p>

          <h3 style={{ color: 'var(--text-main)' }}>2. How We Use Your Information</h3>
          <p>
            We use the information we collect in various ways, including to:
            <ul>
              <li>Provide, operate, and maintain our AI playground platform</li>
              <li>Improve, personalize, and expand our services</li>
              <li>Understand and analyze how you use our credit system</li>
              <li>Verify payments and screenshot proofs submitted during topup</li>
              <li>Communicate with you for customer service and security updates</li>
            </ul>
          </p>

          <h3 style={{ color: 'var(--text-main)' }}>3. Log Files</h3>
          <p>
            Youngo follows a standard procedure of using log files. These files log visitors when they prompt tools in the playground. The information collected by log files includes internet protocol (IP) addresses, browser type, Date and time stamp, and number of credits spent.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Privacy;
