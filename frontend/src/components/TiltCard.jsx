import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Reusable 3D Perspective Tilt Card with hardware-accelerated Framer Motion
 * Creates realistic 3D depth, tilt, and dynamic lighting glare illusion.
 * Fixed: removed transformStyle: preserve-3d from content wrapper to prevent
 * pointer-event blocking on interactive elements (inputs, buttons, links).
 */
const TiltCard = ({ 
  children, 
  className = '', 
  style = {}, 
  maxTilt = 12, 
  depth = 30,
  glare = true,
  onClick,
  ...props 
}) => {
  const cardRef = useRef(null);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { damping: 25, stiffness: 300 };
  const rotateXSpring = useSpring(useTransform(y, [0, 1], [maxTilt, -maxTilt]), springConfig);
  const rotateYSpring = useSpring(useTransform(x, [0, 1], [-maxTilt, maxTilt]), springConfig);

  const glareX = useTransform(x, [0, 1], ['0%', '100%']);
  const glareY = useTransform(y, [0, 1], ['0%', '100%']);
  const glareOpacity = useTransform(x, [0, 0.5, 1], [0.15, 0.3, 0.15]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width);
    y.set(mouseY / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        perspective: '1000px',
        position: 'relative',
        ...style,
      }}
      className={className}
      {...props}
    >
      <motion.div
        style={{
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
          width: '100%',
          height: '100%',
          position: 'relative',
          borderRadius: 'var(--radius-md)',
        }}
      >
        {/* Card Content */}
        <div style={{ position: 'relative', zIndex: 5 }}>
          {children}
        </div>

        {/* Dynamic Light Sheen / Glare Layer */}
        {glare && (
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              borderRadius: 'inherit',
              zIndex: 10,
              opacity: glareOpacity,
            }}
          >
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                background: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.18) 0%, transparent 60%)`,
                pointerEvents: 'none',
              }}
            />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default TiltCard;
