import React from 'react';
import { motion } from 'framer-motion';

/**
 * Mascot3D: Interactive 3D AI Assistant Character
 * Reacts dynamically to user interactions (idle, email focus, password privacy, error)
 * Uses Framer Motion spring physics, 3D perspective layers, and glowing energy rings.
 */
const Mascot3D = ({ mode = 'idle', className = '' }) => {
  // Eye rotation calculation for focus states
  const getEyeTransform = () => {
    switch (mode) {
      case 'email':
        return { y: 3, x: 2, scaleY: 1 };
      case 'password':
        return { y: -2, x: 0, scaleY: 0.1 }; // Privacy squint / closed eyes
      case 'error':
        return { y: 0, x: 0, scaleY: 0.6 };
      default:
        return { y: 0, x: 0, scaleY: 1 };
    }
  };

  const eyeState = getEyeTransform();

  return (
    <div className={`mascot-3d-container ${className}`}>
      {/* Background Floating Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.65, 0.35],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="mascot-ambient-glow"
      />

      <div className="mascot-stage">
        {/* 3D Floating Shadow */}
        <motion.div
          animate={{ scale: [0.8, 1, 0.8], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mascot-shadow"
        />

        {/* Mascot Main Body Stack */}
        <motion.div
          animate={{
            y: mode === 'password' ? [0, 4, 0] : [0, -12, 0],
            rotateZ: mode === 'email' ? [0, 2, 0] : [0, 0, 0],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="mascot-body-wrapper"
        >
          {/* Head Unit */}
          <div className="mascot-head glass-card">
            {/* Antenna with pulsing orb */}
            <div className="mascot-antenna">
              <div className="antenna-stem" />
              <motion.div
                animate={{
                  scale: mode === 'error' ? [1, 1.4, 1] : [1, 1.2, 1],
                  background: mode === 'error' ? '#f43f5e' : '#06b6d4',
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="antenna-orb"
              />
            </div>

            {/* Glowing Face Visor */}
            <div className="mascot-visor">
              {/* Left Eye */}
              <div className="eye-socket">
                <motion.div
                  animate={{
                    y: eyeState.y,
                    x: eyeState.x,
                    scaleY: eyeState.scaleY,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`mascot-eye ${mode === 'error' ? 'eye-error' : ''}`}
                >
                  <div className="eye-pupil" />
                </motion.div>
              </div>

              {/* Right Eye */}
              <div className="eye-socket">
                <motion.div
                  animate={{
                    y: eyeState.y,
                    x: eyeState.x,
                    scaleY: eyeState.scaleY,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`mascot-eye ${mode === 'error' ? 'eye-error' : ''}`}
                >
                  <div className="eye-pupil" />
                </motion.div>
              </div>

              {/* Mouth expression LED */}
              <div className="mascot-mouth">
                {mode === 'password' ? (
                  <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} className="mouth-privacy" />
                ) : mode === 'error' ? (
                  <div className="mouth-sad" />
                ) : (
                  <div className="mouth-smile" />
                )}
              </div>
            </div>

            {/* Side Ear Guards */}
            <div className="ear-guard ear-left" />
            <div className="ear-guard ear-right" />
          </div>

          {/* Torso Core Unit */}
          <div className="mascot-torso glass-card">
            <div className="core-reactor">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="reactor-ring"
              />
              <div className="reactor-core" />
            </div>
          </div>

          {/* Privacy Cover Hands (Triggered when entering password) */}
          {mode === 'password' && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="privacy-hands"
            >
              <div className="robot-hand hand-left" />
              <div className="robot-hand hand-right" />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Mascot3D;
