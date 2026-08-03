import React from 'react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import { ShieldCheck, Cookie, Lock, Eye, AlertTriangle, Cpu, FileText } from 'lucide-react';
import './public.css';

const Privacy = () => {
  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '85vh', maxWidth: '900px' }}>
        
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            color: 'var(--color-accent)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1rem'
          }}>
            <ShieldCheck size={16} /> Privacy Policy & Data Security
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Privacy & Cookie Policy</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Effective Date: August 3, 2026 &bull; How we handle your data, cookies, and third-party API connectivity.
          </p>
        </div>

        {/* Highlighted Warning Box */}
        <div className="glass-card" style={{
          padding: '1.75rem',
          marginBottom: '2.5rem',
          borderLeft: '4px solid var(--color-accent)',
          background: 'rgba(6, 182, 212, 0.05)'
        }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <Cookie size={24} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                Cookies & Storage Policy Notice
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                We use <strong>cookies, local storage, and secure HTTP session tokens</strong> to maintain user authorization, remember dark/light theme choices, monitor credit expenditure, and prevent security vulnerabilities. By using Youngo Subscription, you consent to our use of cookies.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: '1.75', color: 'var(--text-muted)' }}>
          
          {/* Section 1 */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Cpu size={20} style={{ color: 'var(--color-primary)' }} /> 1. Third-Party AI API Services Disclosure
            </h3>
            <p style={{ marginBottom: '1rem' }}>
              Youngo Subscription acts strictly as an API service provider and aggregator. 
            </p>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Not Bot Owners:</strong> We do not own, train, or host third-party AI models (e.g. ChatGPT, Midjourney, Claude, Gemini). Prompts executed in our playground are transmitted via secure API endpoints to third-party model providers.</li>
              <li><strong>Data Protection:</strong> We do not sell or rent your personal user information to third-party advertisers.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <AlertTriangle size={20} style={{ color: 'var(--color-warning)' }} /> 2. Data Loss Exclusion & Responsibility Disclaimer
            </h3>
            <p style={{ marginBottom: '1rem' }}>
              While we implement robust database backups and encryption standards:
            </p>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Youngo Subscription is <strong>not liable or responsible</strong> for any loss of user data, prompt records, output history, or unexpected third-party service terminations.</li>
              <li>Upstream AI vendors may periodically purge API logs or alter availability without prior notice.</li>
              <li>Users maintain full responsibility for saving and backing up any important outputs produced through the playground.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Cookie size={20} style={{ color: 'var(--color-accent)' }} /> 3. Detailed Cookie Usage
            </h3>
            <p style={{ marginBottom: '1rem' }}>
              Our platform uses the following categories of cookies and browser storage:
            </p>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Strictly Necessary Cookies:</strong> Required to authenticate logged-in accounts and maintain active API tokens.</li>
              <li><strong>Preference Cookies:</strong> Store theme modes (Dark/Light) and language selections across sessions.</li>
              <li><strong>Analytics Storage:</strong> Anonymized metrics to optimize server load and credit consumption charts.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Lock size={20} style={{ color: 'var(--color-success)' }} /> 4. Data Security & Payment Verification
            </h3>
            <p>
              Account credentials are encrypted using industry-standard bcrypt hashing algorithms. Uploaded payment receipts for wallet recharges are stored securely and accessible only to authorized administrators for transaction audits.
            </p>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
};

export default Privacy;
