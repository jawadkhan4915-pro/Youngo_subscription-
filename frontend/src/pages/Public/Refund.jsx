import React from 'react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import './public.css';

const Refund = () => {
  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '80vh', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Refund Policy</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Last updated: July 9, 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: '1.7', color: 'var(--text-muted)' }}>
          <p>
            Thank you for choosing Youngo Subscription. We want to ensure you have a satisfactory experience on our MERN AI subscription sharing platform.
          </p>

          <h3 style={{ color: 'var(--text-main)' }}>1. General Policy</h3>
          <p>
            Due to the direct API transaction fees charged by external providers (such as OpenAI, Google, Anthropic, Midjourney) for token completions and prompt executions, all successful credit purchases on Youngo are **final and non-refundable**.
          </p>

          <h3 style={{ color: 'var(--text-main)' }}>2. Pending Transactions</h3>
          <p>
            If your order is currently "Pending" approval by the admin, you can request a cancellation by opening a Support Ticket in the user dashboard. Once cancelled by the admin, we will initiate manual cash refunds to your mobile wallet (JazzCash/EasyPaisa) within 3-5 business days.
          </p>

          <h3 style={{ color: 'var(--text-main)' }}>3. Exceptional Circumstances</h3>
          <p>
            Refunds or replacement credits may be offered at the sole discretion of the Youngo administration if:
            <ul>
              <li>A transaction was double-charged due to manual bank verification lag</li>
              <li>A technical glitch on our platform prevents credit allocations after payment approval</li>
            </ul>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Refund;
