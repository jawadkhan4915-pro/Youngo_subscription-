import React, { useEffect, useRef } from 'react';
import './components.css';

/**
 * AiAgent3DBackground: Next-Gen High-Impact 3D AI Agent Background Engine
 * Renders:
 * 1. Animated 3D AI Agent Core with Holographic Rotating Polyhedron & Energy Rings
 * 2. 5 Floating 3D AI Tool Nodes (ChatGPT 4o, Midjourney v6, Claude 3.5, Gemini Pro, ElevenLabs)
 * 3. Animated Laser Streams & Energy Pulses flowing between AI nodes
 * 4. High-contrast Constellation Mesh & Mouse Parallax
 */
const AiAgent3DBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 3D Geometry Setup for Central AI Core Dodecahedron
    const phi = (1 + Math.sqrt(5)) / 2;
    const b = 1 / phi;
    const baseVertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
      [0, -b, -phi], [0, b, -phi], [0, -b, phi], [0, b, phi],
      [-b, -phi, 0], [b, -phi, 0], [-b, phi, 0], [b, phi, 0],
      [-phi, 0, -b], [phi, 0, -b], [-phi, 0, b], [phi, 0, b]
    ];

    const coreScale = 160;
    const coreVertices = baseVertices.map(([x, y, z]) => ({
      x: x * coreScale,
      y: y * coreScale,
      z: z * coreScale,
    }));

    // AI Tool Agent Nodes Orbiting Data
    const aiAgents = [
      { name: 'ChatGPT 4o', color: '#10a37f', radius: 280, speed: 0.007, angle: 0, tilt: 0.35, icon: '🤖' },
      { name: 'Midjourney v6', color: '#3b82f6', radius: 360, speed: -0.005, angle: 1.25, tilt: -0.28, icon: '🎨' },
      { name: 'Claude 3.5', color: '#f59e0b', radius: 440, speed: 0.004, angle: 2.5, tilt: 0.42, icon: '🧠' },
      { name: 'Gemini Pro', color: '#a855f7', radius: 520, speed: -0.006, angle: 3.75, tilt: -0.35, icon: '✨' },
      { name: 'ElevenLabs', color: '#06b6d4', radius: 400, speed: 0.008, angle: 5.1, tilt: 0.25, icon: '🎙️' },
    ];

    // Constellation Particles
    const numParticles = Math.min(Math.floor(width / 18), 75);
    const particles = Array.from({ length: numParticles }, () => ({
      x: (Math.random() - 0.5) * width * 1.6,
      y: (Math.random() - 0.5) * height * 1.6,
      z: Math.random() * 800 - 400,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      vz: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1.5,
      color: ['#6366f1', '#06b6d4', '#8b5cf6', '#38bdf8', '#10b981'][Math.floor(Math.random() * 5)],
    }));

    let rotX = 0;
    let rotY = 0;
    let rotZ = 0;
    let pulseTime = 0;

    const render = () => {
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const parallaxX = (mouse.x - width / 2) * 0.18;
      const parallaxY = (mouse.y - height / 2) * 0.18;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2 + parallaxX;
      const centerY = height / 2 + parallaxY;
      const fov = 650;

      rotX += 0.006;
      rotY += 0.008;
      rotZ += 0.004;
      pulseTime += 0.03;

      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

      // 1. Draw Background Neural Constellation
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.x < -width) p.x = width;
        if (p.x > width) p.x = -width;
        if (p.y < -height) p.y = height;
        if (p.y > height) p.y = -height;
        if (p.z < -400) p.z = 400;
        if (p.z > 400) p.z = -400;

        const scale = fov / (fov + p.z + 500);
        const px = centerX + p.x * scale;
        const py = centerY + p.y * scale;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.beginPath();
          ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.min(scale * 0.6, 0.75);
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
          ctx.fill();

          for (let j = idx + 1; j < particles.length; j += 3) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 200) {
              const scale2 = fov / (fov + p2.z + 500);
              const p2x = centerX + p2.x * scale2;
              const p2y = centerY + p2.y * scale2;

              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(p2x, p2y);
              ctx.strokeStyle = p.color;
              ctx.globalAlpha = (1 - dist / 200) * 0.25;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }
      });
      ctx.shadowBlur = 0;

      // 2. Draw Pulsing Holographic Core Rings
      const ringRadius = 190 + Math.sin(pulseTime) * 12;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, ringRadius, ringRadius * 0.45, rotZ, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      ctx.setLineDash([8, 12]);
      ctx.stroke();
      ctx.setLineDash([]);

      const innerRingRadius = 130 + Math.cos(pulseTime * 1.5) * 8;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, innerRingRadius, innerRingRadius * 0.4, -rotZ * 1.4, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 3. Rotate & Project 3D Polyhedron Core Vertices
      const projectedCore = coreVertices.map((v) => {
        let y1 = v.y * cosX - v.z * sinX;
        let z1 = v.y * sinX + v.z * cosX;
        let x2 = v.x * cosY + z1 * sinY;
        let z2 = -v.x * sinY + z1 * cosY;
        let x3 = x2 * cosZ - y1 * sinZ;
        let y3 = x2 * sinZ + y1 * cosZ;

        const scale = fov / (fov + z2 + 250);
        return {
          x: centerX + x3 * scale,
          y: centerY + y3 * scale,
          z: z2,
          scale,
        };
      });

      // Render Core Edges & Glowing Vertices
      for (let i = 0; i < projectedCore.length; i++) {
        const v1 = projectedCore[i];

        ctx.beginPath();
        ctx.arc(v1.x, v1.y, 4 * v1.scale, 0, Math.PI * 2);
        ctx.fillStyle = '#6366f1';
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#6366f1';
        ctx.globalAlpha = 0.9;
        ctx.fill();

        for (let j = i + 1; j < projectedCore.length; j++) {
          const v2 = projectedCore[j];
          const dx = v1.x - v2.x;
          const dy = v1.y - v2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 135 * v1.scale) {
            ctx.beginPath();
            ctx.moveTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            const grad = ctx.createLinearGradient(v1.x, v1.y, v2.x, v2.y);
            grad.addColorStop(0, 'rgba(99, 102, 241, 0.5)');
            grad.addColorStop(1, 'rgba(6, 182, 212, 0.5)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.6 * v1.scale;
            ctx.globalAlpha = 0.55;
            ctx.stroke();
          }
        }
      }
      ctx.shadowBlur = 0;

      // 4. Render Orbiting 3D AI Tool Agent Nodes
      aiAgents.forEach((agent) => {
        agent.angle += agent.speed;

        const rawX = Math.cos(agent.angle) * agent.radius;
        const rawZ = Math.sin(agent.angle) * agent.radius;
        const rawY = Math.sin(agent.angle * 2.2) * 45 + rawZ * agent.tilt;

        const scale = fov / (fov + rawZ + 300);
        const agentX = centerX + rawX * scale;
        const agentY = centerY + rawY * scale;

        // Laser Beam from Core to Node
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(agentX, agentY);
        ctx.strokeStyle = agent.color;
        ctx.globalAlpha = 0.22 * scale;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([5, 7]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated Traveling Pulse along laser beam
        const pulseProgress = ((pulseTime * agent.speed * 80) % 1 + 1) % 1;
        const pulseX = centerX + (agentX - centerX) * pulseProgress;
        const pulseY = centerY + (agentY - centerY) * pulseProgress;

        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 3.5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = agent.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = agent.color;
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw 3D Badge Node Container
        const badgeRadius = 26 * scale;

        // Outer Neon Glow Aura
        ctx.beginPath();
        ctx.arc(agentX, agentY, badgeRadius + 6, 0, Math.PI * 2);
        ctx.fillStyle = agent.color;
        ctx.shadowBlur = 16;
        ctx.shadowColor = agent.color;
        ctx.globalAlpha = 0.35;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner Glass Circle
        ctx.beginPath();
        ctx.arc(agentX, agentY, badgeRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(14, 22, 40, 0.92)';
        ctx.strokeStyle = agent.color;
        ctx.lineWidth = 2.2 * scale;
        ctx.globalAlpha = Math.max(0.7, scale);
        ctx.fill();
        ctx.stroke();

        // Agent Icon
        ctx.font = `${Math.max(12, Math.floor(15 * scale))}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1;
        ctx.fillText(agent.icon, agentX, agentY);

        // Floating Title Pill
        if (scale > 0.65) {
          ctx.font = `700 ${Math.floor(11 * scale)}px Inter, sans-serif`;
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.fillText(agent.name, agentX, agentY + badgeRadius + 14);
          ctx.shadowBlur = 0;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="ai-agent-3d-bg-container">
      <canvas ref={canvasRef} className="ai-agent-3d-canvas" />
      <div className="ai-agent-3d-overlay" />
    </div>
  );
};

export default AiAgent3DBackground;
