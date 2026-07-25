import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, Image as ImageIcon, Mic, Code2, Search, Video, Cpu } from 'lucide-react';
import TiltCard from './TiltCard.jsx';

/**
 * AIAgentsMarquee component displaying 3D glowing badges & logos of top AI agents.
 */
const AIAgentsMarquee = () => {
  const aiAgents = [
    {
      name: 'ChatGPT 4o Pro',
      type: 'LLM & Vision',
      provider: 'OpenAI',
      color: '#10a37f',
      icon: <Bot size={22} color="#ffffff" />,
      gradient: 'linear-gradient(135deg, #10a37f, #059669)',
      tag: 'GPT-4o Omni'
    },
    {
      name: 'Gemini Advanced',
      type: 'Multimodal AI',
      provider: 'Google',
      color: '#8b5cf6',
      icon: <Sparkles size={22} color="#ffffff" />,
      gradient: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
      tag: '1M Context'
    },
    {
      name: 'Claude 3.5 Sonnet',
      type: 'Reasoning & Code',
      provider: 'Anthropic',
      color: '#d97706',
      icon: <Code2 size={22} color="#ffffff" />,
      gradient: 'linear-gradient(135deg, #d97706, #b45309)',
      tag: 'Sonnet 3.5'
    },
    {
      name: 'Midjourney v6.1',
      type: '8K Photorealism',
      provider: 'Midjourney',
      color: '#6366f1',
      icon: <ImageIcon size={22} color="#ffffff" />,
      gradient: 'linear-gradient(135deg, #6366f1, #4338ca)',
      tag: 'Visual Engine'
    },
    {
      name: 'ElevenLabs AI',
      type: 'Voice Synthesis',
      provider: 'ElevenLabs',
      color: '#06b6d4',
      icon: <Mic size={22} color="#ffffff" />,
      gradient: 'linear-gradient(135deg, #06b6d4, #0284c7)',
      tag: 'Human Voice'
    },
    {
      name: 'Perplexity Pro',
      type: 'AI Search Engine',
      provider: 'Perplexity',
      color: '#22c55e',
      icon: <Search size={22} color="#ffffff" />,
      gradient: 'linear-gradient(135deg, #22c55e, #15803d)',
      tag: 'Live Web'
    },
    {
      name: 'Sora Video AI',
      type: 'Cinematic Video',
      provider: 'OpenAI',
      color: '#ec4899',
      icon: <Video size={22} color="#ffffff" />,
      gradient: 'linear-gradient(135deg, #ec4899, #be185d)',
      tag: 'Text-to-Video'
    },
    {
      name: 'Cognition Devin',
      type: 'Autonomous Software',
      provider: 'Cognition',
      color: '#3b82f6',
      icon: <Cpu size={22} color="#ffffff" />,
      gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      tag: 'AI Engineer'
    }
  ];

  return (
    <div className="ai-agents-section" style={{ padding: '3.5rem 0', position: 'relative', overflow: 'hidden' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="hero-badge">
            <Sparkles size={13} className="text-indigo-400" /> Supported AI Networks
          </span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.5rem' }}>
            Powering Next-Gen <span className="highlight-gradient">AI Agents & Models</span>
          </h3>
        </div>

        {/* 3D Agent Badges Grid */}
        <div className="agent-badges-grid">
          {aiAgents.map((agent, index) => (
            <TiltCard key={index} maxTilt={12} depth={20} className="agent-badge-wrapper">
              <div className="glass-card agent-badge-card">
                <div className="agent-icon-box" style={{ background: agent.gradient }}>
                  {agent.icon}
                </div>
                <div className="agent-info">
                  <h4 className="agent-name">{agent.name}</h4>
                  <span className="agent-provider">{agent.provider} • {agent.type}</span>
                </div>
                <span className="agent-tag">{agent.tag}</span>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAgentsMarquee;
