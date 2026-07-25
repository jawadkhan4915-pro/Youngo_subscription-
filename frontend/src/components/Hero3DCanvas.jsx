import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles, Zap, Shield, Bot, Image as ImageIcon, MessageSquare, Mic, Coins, CheckCircle, ArrowUpRight } from 'lucide-react';

const Hero3DCanvas = () => {
  const containerRef = useRef(null);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { damping: 20, stiffness: 200 };
  const rotateX = useSpring(useTransform(y, [0, 1], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(x, [0, 1], [-18, 18]), springConfig);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="hero-3d-wrapper"
    >
      {/* Dynamic Background Glowing Light Orbs */}
      <div className="hero-orb orb-primary" />
      <div className="hero-orb orb-secondary" />
      <div className="hero-orb orb-accent" />

      {/* Main 3D Perspective Stage Container */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="hero-3d-stage"
      >
        {/* Central Gateway Dashboard Card */}
        <div className="hero-main-card glass-card preserve-3d">
          <div className="stage-header">
            <div className="stage-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
            <div className="stage-badge">
              <Sparkles size={12} className="text-indigo-400 animate-pulse" />
              <span>YOUNGO UNIFIED PLAYGROUND 3.0</span>
            </div>
            <div className="stage-balance">
              <Coins size={14} style={{ color: '#06b6d4' }} />
              <span>Wallet: <strong>2,500 CR</strong></span>
            </div>
          </div>

          <div className="stage-body">
            <div className="prompt-bar">
              <Bot size={18} className="prompt-icon" />
              <span className="prompt-placeholder">Prompt any AI tool in real-time...</span>
              <button className="prompt-btn">
                <span>Run AI</span>
                <Zap size={14} />
              </button>
            </div>

            <div className="stage-grid">
              <div className="active-session-card">
                <div className="session-icon chatgpt-icon">
                  <MessageSquare size={20} />
                </div>
                <div className="session-info">
                  <h4>ChatGPT 4o Pro</h4>
                  <p>Model: GPT-4o Omni • Active Token Stream</p>
                </div>
                <span className="status-indicator active">
                  <span className="pulse-dot"></span> Online
                </span>
              </div>

              <div className="active-session-card">
                <div className="session-icon midjourney-icon">
                  <ImageIcon size={20} />
                </div>
                <div className="session-info">
                  <h4>Midjourney v6.1</h4>
                  <p>Photo-Realistic 8k Generation Engine</p>
                </div>
                <span className="status-indicator active">
                  <span className="pulse-dot"></span> Ready
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Live Metrics Bar */}
          <div className="stage-footer">
            <div className="stat-pill">
              <Shield size={13} style={{ color: '#10b981' }} />
              <span>100% Verified API Tokens</span>
            </div>
            <div className="stat-pill">
              <Zap size={13} style={{ color: '#8b5cf6' }} />
              <span>Sub-second Latency</span>
            </div>
          </div>
        </div>

        {/* Floating 3D Tool Cards Layer 1: ChatGPT */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transform: 'translateZ(75px)' }}
          className="floating-card float-top-left glass-card"
        >
          <div className="float-icon gpt-bg">
            <MessageSquare size={18} color="#ffffff" />
          </div>
          <div>
            <div className="float-title">ChatGPT Plus</div>
            <div className="float-sub">GPT-4o & Canvas</div>
          </div>
          <ArrowUpRight size={14} className="float-arrow" />
        </motion.div>

        {/* Floating 3D Tool Cards Layer 2: Midjourney */}
        <motion.div
          animate={{ y: [0, 14, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          style={{ transform: 'translateZ(90px)' }}
          className="floating-card float-bottom-right glass-card"
        >
          <div className="float-icon mj-bg">
            <ImageIcon size={18} color="#ffffff" />
          </div>
          <div>
            <div className="float-title">Midjourney v6</div>
            <div className="float-sub">8K AI Visuals</div>
          </div>
          <ArrowUpRight size={14} className="float-arrow" />
        </motion.div>

        {/* Floating 3D Tool Cards Layer 3: Claude Pro */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{ transform: 'translateZ(60px)' }}
          className="floating-card float-top-right glass-card"
        >
          <div className="float-icon claude-bg">
            <Bot size={18} color="#ffffff" />
          </div>
          <div>
            <div className="float-title">Claude 3.5 Sonnet</div>
            <div className="float-sub">200k Context</div>
          </div>
        </motion.div>

        {/* Floating 3D Tool Cards Layer 4: ElevenLabs */}
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          style={{ transform: 'translateZ(85px)' }}
          className="floating-card float-bottom-left glass-card"
        >
          <div className="float-icon eleven-bg">
            <Mic size={18} color="#ffffff" />
          </div>
          <div>
            <div className="float-title">ElevenLabs</div>
            <div className="float-sub">Human Voice AI</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Hero3DCanvas;
