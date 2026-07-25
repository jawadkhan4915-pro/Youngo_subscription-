import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Reusable 3D Perspective Tilt Card with hardware-accelerated Framer Motion
 * Creates realistic 3D depth, tilt, and dynamic lighting glare illusion.
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
        perspective: 1000,
        transformStyle: 'preserve-3d',
        ...style,
      }}
      className={`relative ${className}`}
      {...props}
    >
      <motion.div
        style={{
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
          transformStyle: 'preserve-3d',
        }}
        className="w-full h-full relative overflow-hidden rounded-[var(--radius-md)] transition-shadow duration-300"
      >
        {/* Card Content with 3D depth shift and click layer */}
        <div style={{ transform: `translateZ(${depth}px)`, transformStyle: 'preserve-3d', position: 'relative', zIndex: 5 }}>
          {children}
        </div>

        {/* Dynamic Light Sheen / Glare Layer */}
        {glare && (
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: `radial-gradient(circle at ${glareX.get()} ${glareY.get()}, rgba(255, 255, 255, 0.22) 0%, transparent 60%)`,
              opacity: glareOpacity,
              borderRadius: 'inherit',
              zIndex: 10,
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default TiltCard;
