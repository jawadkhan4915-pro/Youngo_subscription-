import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import './public.css';

const Pricing = () => {
  const { isAuthenticated } = useAuth();
  const plans = [
    {
      name: 'Starter',
      price: '500',
      description: 'Ideal for casual AI testing and homework.',
      features: [
        '100 Credits allocated',
        'Access to ChatGPT Plus & Claude Pro',
        'Daily limit of 40 prompts',
        'Manual screenshot verification',
        'Standard Email support'
      ],
      popular: false,
      btnText: 'Get Started'
    },
    {
      name: 'Pro (Best Value)',
      price: '1,500',
      description: 'Perfect for researchers, coders, and power users.',
      features: [
        '350 Credits allocated (Bonus 50 cr)',
        'Access to All Premium AI Chatbots',
        'Access to Midjourney & ElevenLabs',
        'Daily limit of 100 prompts',
        '5% Loyalty points rebate',
        'Priority Ticket support'
      ],
      popular: true,
      btnText: 'Purchase Pro'
    },
    {
      name: 'Enterprise',
      price: '5,000',
      description: 'Best for small agencies and software houses.',
      features: [
        '1,200 Credits allocated (Bonus 200 cr)',
        'Full catalog access (Image, Voice, Video)',
        'Daily limit of 300 prompts',
        'Waitlist bypass for busy tools',
        '10% Referral earnings share',
        '24/7 Dedicated Slack/WhatsApp support'
      ],
      popular: false,
      btnText: 'Get Enterprise'
    }
  ];

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>Transparent Pricing Plans</h1>
          <p style={{ color: 'var(--text-muted)' }}>Top up your wallet, unlock licenses, and only pay for exactly what you prompt.</p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`glass-card pricing-card ${plan.popular ? 'popular' : ''}`}
            >
              {plan.popular && <span className="popular-badge">Popular</span>}
              <div>
                <h3 className="plan-name">{plan.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{plan.description}</p>
                <div className="plan-price">
                  {plan.price} PKR
                  <span>/ topup</span>
                </div>

                <ul className="plan-features">
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>
                      <Check size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to={isAuthenticated ? "/dashboard/wallet" : "/register"}
                className={plan.popular ? 'gradient-btn' : 'form-input'}
                style={{
                  width: '100%',
                  textAlign: 'center',
                  justifyContent: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  padding: '0.75rem 1rem',
                  fontWeight: 600,
                  marginTop: '1.5rem'
                }}
              >
                {plan.btnText}
              </Link>
            </div>
          ))}
        </div>

        {/* Note info */}
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', maxWidth: '700px', margin: '0 auto 4rem auto' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}><Sparkles size={16} /> How credit consumption works</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Each text prompt sent to ChatGPT or Claude deducts <strong>1 credit</strong>. Images generated in Midjourney or sound syntheses in ElevenLabs deduct <strong>5 credits</strong> due to high processing requirements. Credits expire 30 days after manual payment confirmation.
          </p>
        </div>

      </div>
      <Footer />
    </>
  );
};

export default Pricing;
