import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import TiltCard from '../../components/TiltCard.jsx';
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

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
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
            <Sparkles size={14} className="text-indigo-400" /> Transparent Pricing
          </span>
          <h1 className="section-title">
            Simple Wallet <span className="highlight-gradient">Top-up Plans</span>
          </h1>
          <p className="section-desc">
            Top up your wallet, unlock AI licenses, and only pay for exactly what you prompt.
          </p>
        </motion.div>

        {/* Pricing Cards 3D Grid */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="pricing-grid"
          style={{ marginBottom: '4rem' }}
        >
          {plans.map((plan, index) => (
            <TiltCard key={index} maxTilt={10} depth={20} className="h-full">
              <div className={`glass-card pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <span className="popular-badge">Best Value</span>}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <h3 className="plan-name">{plan.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>{plan.description}</p>
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
                    className={plan.popular ? 'gradient-btn' : 'glass-btn'}
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      justifyContent: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.85rem 1rem',
                      fontWeight: 600,
                      marginTop: '2rem'
                    }}
                  >
                    {plan.btnText}
                  </Link>
                </div>
              </div>
            </TiltCard>
          ))}
        </motion.div>

        {/* How Credits Work 3D Card */}
        <TiltCard maxTilt={5} depth={10}>
          <div className="glass-card" style={{ padding: '2.5rem 2rem', textAlign: 'center', maxWidth: '750px', margin: '0 auto' }}>
            <h3 style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '1.3rem' }}>
              <Zap size={18} className="text-indigo-400" /> How Credit Consumption Works
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.65' }}>
              Each text prompt sent to ChatGPT Plus or Claude Sonnet deducts <strong>1 credit</strong>. Generating high-resolution visuals in Midjourney v6 or synthesizing speech in ElevenLabs deducts <strong>5 credits</strong> due to server load. Credits remain active for 30 days after manual payment confirmation.
            </p>
          </div>
        </TiltCard>

      </div>

      <Footer />
    </div>
  );
};

export default Pricing;
