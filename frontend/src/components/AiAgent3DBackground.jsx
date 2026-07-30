import React, { useEffect, useRef } from 'react';
import './components.css';

/**
 * AiAgent3DBackground: Next-Gen 3D Interactive AI Agent Background Engine
 * Renders a high-performance 3D canvas with:
 * 1. 3D Geometric AI Core (Rotating Dodecahedron & Glowing Energy Rings)
 * 2. Floating 3D AI Tool Nodes (ChatGPT, Midjourney, Claude, Gemini, ElevenLabs)
 * 3. Neural Constellation Stream (Interactive particle mesh reacting to cursor)
 * 4. Ambient Holographic Light Orbs
 */
const AiAgent3DBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Canvas Sizing
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse Tracking for Parallax
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

    // 3D Geometry Setup (Dodecahedron Vertices for AI Core)
    const phi = (1 + Math.sqrt(5)) / 2;
    const b = 1 / phi;
    const c = 2 - phi;

    const baseVertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
      [0, -b, -phi], [0, b, -phi], [0, -b, phi], [0, b, phi],
      [-b, -phi, 0], [b, -phi, 0], [-b, phi, 0], [b, phi, 0],
      [-phi, 0, -b], [phi, 0, -b], [-phi, 0, b], [phi, 0, b]
    ];

    // Scale 3D Vertices
    const coreScale = 130;
    const coreVertices = baseVertices.map(([x, y, z]) => ({
      x: x * coreScale,
      y: y * coreScale,
      z: z * coreScale,
    }));

    // AI Tool Agents Orbit Data
    const aiAgents = [
      { name: 'ChatGPT 4o', color: '#10a37f', radius: 240, speed: 0.008, angle: 0, tilt: 0.4, icon: '🤖' },
      { name: 'Midjourney v6', color: '#3b82f6', radius: 320, speed: -0.006, angle: 1.2, tilt: -0.3, icon: '🎨' },
      { name: 'Claude 3.5', color: '#d97706', radius: 400, speed: 0.005, angle: 2.5, tilt: 0.5, icon: '🧠' },
      { name: 'Gemini Pro', color: '#8b5cf6', radius: 480, speed: -0.007, angle: 3.8, tilt: -0.4, icon: '✨' },
      { name: 'ElevenLabs', color: '#06b6d4', radius: 360, speed: 0.009, angle: 5.0, tilt: 0.2, icon: '🎙️' },
    ];

    // Neural Particle Mesh
    const numParticles = Math.min(Math.floor(width / 22), 65);
    const particles = Array.from({ length: numParticles }, () => ({
      x: (Math.random() - 0.5) * width * 1.5,
      y: (Math.random() - 0.5) * height * 1.5,
      z: Math.random() * 800 - 400,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      vz: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2.5 + 1.2,
      color: ['#6366f1', '#06b6d4', '#8b5cf6', '#10b981'][Math.floor(Math.random() * 4)],
    }));

    // Rotation Angles
    let rotX = 0;
    let rotY = 0;
    let rotZ = 0;

    // Render Loop
    const render = () => {
      // Smooth Mouse Interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const parallaxX = (mouse.x - width / 2) * 0.15;
      const parallaxY = (mouse.y - height / 2) * 0.15;

      ctx.clearRect(0, 0, width, height);

      // Center Focal Point
      const centerX = width / 2 + parallaxX;
      const centerY = height / 2 + parallaxY;
      const fov = 600; // 3D Camera Field of View

      // Increment Core Rotation
      rotX += 0.005;
      rotY += 0.007;
      rotZ += 0.003;

      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

      // 1. Draw Neural Particle Mesh Background
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
          ctx.globalAlpha = Math.min(scale * 0.35, 0.5);
          ctx.fill();

          // Connect nearby particles with glowing laser links
          for (let j = idx + 1; j < particles.length; j += 4) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 180) {
              const scale2 = fov / (fov + p2.z + 500);
              const p2x = centerX + p2.x * scale2;
              const p2y = centerY + p2.y * scale2;

              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(p2x, p2y);
              ctx.strokeStyle = p.color;
              ctx.globalAlpha = (1 - dist / 180) * 0.12;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }
      });

      // 2. Rotate & Project 3D Core Vertices
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

      // Draw Core Vertex Glowing Nodes & Edges
      ctx.globalAlpha = 0.75;
      for (let i = 0; i < projectedCore.length; i++) {
        const v1 = projectedCore[i];

        ctx.beginPath();
        ctx.arc(v1.x, v1.y, 2.8 * v1.scale, 0, Math.PI * 2);
        ctx.fillStyle = '#6366f1';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#6366f1';
        ctx.fill();

        for (let j = i + 1; j < projectedCore.length; j++) {
          const v2 = projectedCore[j];
          const dx = v1.x - v2.x;
          const dy = v1.y - v2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110 * v1.scale) {
            ctx.beginPath();
            ctx.moveTo(v1.x, v1.y);
            ctx.lineTo(v2.x, v2.y);
            const grad = ctx.createLinearGradient(v1.x, v1.y, v2.x, v2.y);
            grad.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
            grad.addColorStop(1, 'rgba(6, 182, 212, 0.35)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.1 * v1.scale;
            ctx.stroke();
          }
        }
      }
      ctx.shadowBlur = 0;

      // 3. Render Orbiting 3D AI Tool Agent Nodes
      aiAgents.forEach((agent) => {
        agent.angle += agent.speed;

        const rawX = Math.cos(agent.angle) * agent.radius;
        const rawZ = Math.sin(agent.angle) * agent.radius;
        const rawY = Math.sin(agent.angle * 2) * 35 + rawZ * agent.tilt;

        const scale = fov / (fov + rawZ + 300);
        const agentX = centerX + rawX * scale;
        const agentY = centerY + rawY * scale;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(agentX, agentY);
        ctx.strokeStyle = agent.color;
        ctx.globalAlpha = 0.12 * scale;
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);

        const badgeRadius = 20 * scale;

        ctx.beginPath();
        ctx.arc(agentX, agentY, badgeRadius + 4, 0, Math.PI * 2);
        ctx.fillStyle = agent.color;
        ctx.globalAlpha = 0.2;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(agentX, agentY, badgeRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(14, 22, 40, 0.85)';
        ctx.strokeStyle = agent.color;
        ctx.lineWidth = 1.8 * scale;
        ctx.globalAlpha = Math.max(0.35, scale);
        ctx.fill();
        ctx.stroke();

        ctx.font = `${Math.max(10, Math.floor(12 * scale))}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(agent.icon, agentX, agentY);

        if (scale > 0.75) {
          ctx.font = `600 ${Math.floor(9.5 * scale)}px Inter, sans-serif`;
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(agent.name, agentX, agentY + badgeRadius + 11);
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
