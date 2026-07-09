import React from 'react';
import './components.css';

export const Skeleton = ({ width, height, borderRadius = 'var(--radius-sm)', style }) => {
  return (
    <div
      className="skeleton"
      style={{
        width: width || '100%',
        height: height || '1.5rem',
        borderRadius,
        ...style
      }}
    />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Skeleton width="48px" height="48px" borderRadius="var(--radius-full)" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Skeleton width="60%" height="1.25rem" />
          <Skeleton width="40%" height="0.85rem" />
        </div>
      </div>
      <Skeleton width="100%" height="4rem" />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        <Skeleton width="30%" height="1.5rem" />
        <Skeleton width="25%" height="1.5rem" />
      </div>
    </div>
  );
};

export default Skeleton;
