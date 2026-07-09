import React from 'react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import './public.css';

const Terms = () => {
  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '80vh', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Terms of Service</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Last updated: July 9, 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: '1.7', color: 'var(--text-muted)' }}>
          <p>
            By accessing this website, we assume you accept these terms and conditions. Do not continue to use Youngo Subscription if you do not agree to take all of the terms and conditions stated on this page.
          </p>

          <h3 style={{ color: 'var(--text-main)' }}>1. Allocation of Credits</h3>
          <p>
            Credits purchased on the platform are designated solely for use in the Youngo AI Playground. Credits are non-transferable, cannot be redeemed for legal currency, and expire 30 days after the date the manual payment is approved.
          </p>

          <h3 style={{ color: 'var(--text-main)' }}>2. Permissible Use & Prohibitions</h3>
          <p>
            Users are strictly prohibited from:
            <ul>
              <li>Using automated scripts to scrape outputs from the playground</li>
              <li>Submitting prompts containing illegal, violent, or hate-speech directives</li>
              <li>Sharing their dashboard credential details with other users</li>
              <li>Falsifying mobile bank transfer receipts or screenshot uploads</li>
            </ul>
            Violation of these terms will lead to immediate account suspension or permanent banning.
          </p>

          <h3 style={{ color: 'var(--text-main)' }}>3. Limitation of Liability</h3>
          <p>
            We provide AI access proxies on an "as-is" basis. Since external AI providers (OpenAI, Anthropic, Google) control raw model uptime and capabilities, Youngo is not liable for temporary service interruptions or changes in API models.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Terms;
