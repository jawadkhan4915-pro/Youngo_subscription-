import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Sliders, ArrowRight, Bot, Image as ImageIcon, Mic, Code2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import TiltCard from '../../components/TiltCard.jsx';
import AIAgentsMarquee from '../../components/AIAgentsMarquee.jsx';
import './public.css';

const Pricing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Custom Plan interactive state
  const availableAIs = [
    { id: 'gpt', name: 'ChatGPT 4o', costPer100: 10, icon: <Bot size={14} /> },
    { id: 'claude', name: 'Claude 3.5 Sonnet', costPer100: 12, icon: <Code2 size={14} /> },
    { id: 'mj', name: 'Midjourney v6.1', costPer100: 18, icon: <ImageIcon size={14} /> },
    { id: 'eleven', name: 'ElevenLabs Voice', costPer100: 15, icon: <Mic size={14} /> },
  ];

  const [selectedAIs, setSelectedAIs] = useState(['gpt', 'claude']);
  const [customCredits, setCustomCredits] = useState(500);

  const toggleAISelection = (id) => {
    if (selectedAIs.includes(id)) {
      if (selectedAIs.length > 1) {
        setSelectedAIs(selectedAIs.filter((item) => item !== id));
      }
    } else {
      setSelectedAIs([...selectedAIs, id]);
    }
  };

  // Calculate dynamic custom plan price
  const calculateCustomPrice = () => {
    const baseRatePerCredit = 0.08;
    const aiMultiplier = selectedAIs.length * 0.15;
    const total = (customCredits * baseRatePerCredit) * (1 + aiMultiplier);
    return Math.max(20, Math.round(total));
  };

  const plans = [
    {
      name: 'Starter',
      price: '$30',
      description: 'Ideal for casual AI prompt testing & homework.',
      features: [
        '300 Credits allocated',
        'Access to ChatGPT Plus & Claude 3.5',
        'Daily limit of 50 prompts',
        'Manual screenshot verification',
        'Standard Email support'
      ],
      popular: false,
      btnText: 'Get Starter ($30)'
    },
    {
      name: 'Standard',
      price: '$55',
      description: 'Perfect for researchers, coders, and power users.',
      features: [
        '650 Credits allocated (Bonus 50 cr)',
        'Access to ChatGPT 4o & Claude 3.5',
        'Access to Midjourney v6.1 Visuals',
        'Daily limit of 120 prompts',
        '5% Loyalty points rebate',
        'Priority Ticket support'
      ],
      popular: false,
      btnText: 'Get Standard ($55)'
    },
    {
      name: 'Pro',
      price: '$110',
      description: 'Best for agencies, developers, & creators.',
      features: [
        '1,450 Credits allocated (Bonus 150 cr)',
        'Full catalog access (Image, Voice, Video)',
        'Access to ElevenLabs & Midjourney v6.1',
        'Daily limit of 350 prompts',
        '10% Referral earnings share',
        '24/7 Priority WhatsApp support'
      ],
      popular: true,
      btnText: 'Get Pro ($110)'
    }
  ];

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
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
            <Sparkles size={14} className="text-indigo-400" /> 4 Flexible Plans
          </span>
          <h1 className="section-title">
            Simple Wallet <span className="highlight-gradient">Top-up Plans</span>
          </h1>
          <p className="section-desc">
            Choose from fixed top-up packages or build your own custom AI selection plan.
          </p>
        </motion.div>

        {/* 4 Plans Grid */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="pricing-grid"
          style={{ marginBottom: '4rem' }}
        >
          {/* Plan 1: Starter ($30) */}
          {plans.map((plan, index) => (
            <TiltCard key={index} maxTilt={8} depth={15} className="h-full">
              <div className={`glass-card pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <span className="popular-badge">Best Value</span>}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <h3 className="plan-name">{plan.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>{plan.description}</p>
                    <div className="plan-price">
                      {plan.price}
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

          {/* Plan 4: Custom Plan (Interactive AI & Credit Selector) */}
          <TiltCard maxTilt={8} depth={15} className="h-full">
            <div className="glass-card pricing-card custom-plan-card">
              <span className="popular-badge" style={{ background: 'linear-gradient(135deg, #06b6d4, #0284c7)' }}>Interactive</span>
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <div>
                  <h3 className="plan-name" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sliders size={18} className="text-cyan-400" /> Custom Plan
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1rem', lineHeight: '1.4' }}>
                    Select your preferred AIs & custom credit balance.
                  </p>

                  <div className="plan-price">
                    ${calculateCustomPrice()}
                    <span>/ topup</span>
                  </div>

                  {/* AI Selector Chips */}
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>1. Select AI Engines:</label>
                  <div className="ai-chip-grid">
                    {availableAIs.map((ai) => {
                      const isSelected = selectedAIs.includes(ai.id);
                      return (
                        <button
                          type="button"
                          key={ai.id}
                          onClick={() => toggleAISelection(ai.id)}
                          className={`ai-chip ${isSelected ? 'selected' : ''}`}
                        >
                          {ai.icon}
                          <span>{ai.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Credit Range Slider */}
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                    <span>2. Desired Credits:</span>
                    <strong style={{ color: 'var(--color-accent)' }}>{customCredits} Credits</strong>
                  </label>
                  <input
                    type="range"
                    min={200}
                    max={3000}
                    step={100}
                    value={customCredits}
                    onChange={(e) => setCustomCredits(Number(e.target.value))}
                    style={{
                      width: '100%',
                      margin: '0.75rem 0 1.25rem 0',
                      accentColor: 'var(--color-accent)',
                      cursor: 'pointer'
                    }}
                  />

                  <ul className="plan-features" style={{ gap: '0.65rem' }}>
                    <li>
                      <Check size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                      <span>{selectedAIs.length} AIs enabled in workspace</span>
                    </li>
                    <li>
                      <Check size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                      <span>Flexible credit allocation</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(isAuthenticated ? "/dashboard/wallet" : "/register")}
                  className="gradient-btn"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '0.85rem 1rem',
                    fontWeight: 600,
                    marginTop: '1.75rem',
                    background: 'linear-gradient(135deg, #06b6d4, #6366f1)'
                  }}
                >
                  Checkout Custom (${calculateCustomPrice()})
                </button>
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* AI Agents Marquee Banner */}
        <AIAgentsMarquee />

        {/* How Credits Work 3D Card */}
        <TiltCard maxTilt={5} depth={10} style={{ marginTop: '3rem' }}>
          <div className="glass-card" style={{ padding: '2.5rem 2rem', textAlign: 'center', maxWidth: '780px', margin: '0 auto' }}>
            <h3 style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '1.3rem' }}>
              <Zap size={18} className="text-indigo-400" /> How Credit Consumption Works
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.65' }}>
              Each text prompt sent to ChatGPT 4o or Claude Sonnet deducts <strong>1 credit</strong>. Generating high-resolution visuals in Midjourney v6.1 or synthesizing speech in ElevenLabs deducts <strong>5 credits</strong> due to server load. Credits remain active for 30 days after manual payment confirmation.
            </p>
          </div>
        </TiltCard>

      </div>

      <Footer />
    </div>
  );
};

export default Pricing;
