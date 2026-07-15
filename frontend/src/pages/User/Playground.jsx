import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Sparkles, Send, Cpu, AlertTriangle, User,
  Image as ImageIcon, Volume2, ShieldAlert, Trash2,
  Zap, ChevronRight, RefreshCw
} from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import api from '../../services/api.js';
import '../dashboard.css';

// Simple markdown renderer (no extra dependency needed)
function renderMarkdown(text) {
  if (!text) return '';

  let html = text
    // Escape HTML first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Code blocks (``` ... ```)
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="pg-code-block"><code class="lang-${lang || 'text'}">${code.trim()}</code></pre>`
    )
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="pg-inline-code">$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h4 class="pg-h4">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="pg-h3">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 class="pg-h2">$1</h2>')
    // Bold + Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Blockquote
    .replace(/^&gt; (.+)$/gm, '<blockquote class="pg-blockquote">$1</blockquote>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="pg-hr"/>')
    // Table (basic)
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim() && !c.match(/^[\s\-:]+$/));
      if (cells.length === 0) return match;
      return `<tr>${cells.map(c => `<td class="pg-td">${c.trim()}</td>`).join('')}</tr>`;
    })
    // Images  ![alt](url)
    .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g,
      '<div class="pg-image-wrap"><img src="$2" alt="$1" class="pg-image" /><span class="pg-image-caption">$1</span></div>'
    )
    // Links [text](url)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="pg-link">$1 ↗</a>'
    )
    // Checkboxes
    .replace(/^- \[x\] (.+)$/gm, '<div class="pg-check done">✅ $1</div>')
    .replace(/^- \[ \] (.+)$/gm, '<div class="pg-check">☐ $1</div>')
    // Numbered list items
    .replace(/^\d+\. (.+)$/gm, '<div class="pg-li-num">$1</div>')
    // Bullet points
    .replace(/^[-•] (.+)$/gm, '<div class="pg-li">$1</div>')
    // Line breaks
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');

  return html;
}

const Playground = () => {
  const { fetchMe } = useAuth();

  const [activeSubs, setActiveSubs] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Chat state: { [subId]: [{ role, content, timestamp, engine? }] }
  const [messages, setMessages] = useState({});
  const [inputPrompt, setInputPrompt] = useState('');
  const [executingPrompt, setExecutingPrompt] = useState(false);
  const [error, setError] = useState('');

  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load active subscriptions
  const fetchActiveSubs = useCallback(async () => {
    try {
      setLoadingSubs(true);
      setLoadError('');
      const res = await api.get('/settings/user/stats');
      if (res.data?.success) {
        const subs = res.data.data.activeSubscriptions || [];
        setActiveSubs(subs);
        if (subs.length > 0 && !selectedSub) {
          setSelectedSub(subs[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
      setLoadError('Could not load your subscriptions. Please check your connection and refresh.');
    } finally {
      setLoadingSubs(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveSubs();
  }, [fetchActiveSubs]);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedSub, executingPrompt]);

  // Focus input on tool switch
  useEffect(() => {
    if (selectedSub && !executingPrompt) {
      inputRef.current?.focus();
    }
  }, [selectedSub]);

  const handleSendPrompt = async (e) => {
    e.preventDefault();
    if (!inputPrompt.trim() || executingPrompt || !selectedSub) return;

    const toolId = selectedSub.tool?._id;
    if (!toolId) {
      setError('Tool reference missing. Please click a different subscription node, then try again.');
      return;
    }

    const currentSubId = selectedSub._id;
    const promptToSend = inputPrompt.trim();
    setInputPrompt('');
    setExecutingPrompt(true);
    setError('');

    // Add user message immediately
    const userMsg = {
      role: 'user',
      content: promptToSend,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => ({
      ...prev,
      [currentSubId]: [...(prev[currentSubId] || []), userMsg]
    }));

    try {
      const res = await api.post('/usage/execute', { toolId, prompt: promptToSend });

      if (res.data?.success) {
        const aiMsg = {
          role: 'assistant',
          content: res.data.result,
          timestamp: new Date().toISOString(),
          engine: res.data.engine,
          creditsSpent: res.data.creditsSpent
        };
        setMessages(prev => ({
          ...prev,
          [currentSubId]: [...(prev[currentSubId] || []), aiMsg]
        }));

        // Update credit balance
        const newCredits = res.data.creditsRemaining;
        setSelectedSub(prev => ({ ...prev, creditsRemaining: newCredits }));
        setActiveSubs(prev =>
          prev.map(sub => sub._id === currentSubId ? { ...sub, creditsRemaining: newCredits } : sub)
        );

        // Silent wallet sync — won't trigger page remount
        fetchMe(true);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'AI execution failed. Please try again.';
      setError(errMsg);
      const errMsg2 = {
        role: 'error',
        content: errMsg,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => ({
        ...prev,
        [currentSubId]: [...(prev[currentSubId] || []), errMsg2]
      }));
    } finally {
      setExecutingPrompt(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const clearChat = () => {
    if (!selectedSub) return;
    setMessages(prev => {
      const updated = { ...prev };
      delete updated[selectedSub._id];
      return updated;
    });
    setError('');
  };

  const getSubChatHistory = () => {
    if (!selectedSub) return [];
    return messages[selectedSub._id] || [];
  };

  const isImageTool = (name = '') => {
    const l = name.toLowerCase();
    return l.includes('midjourney') || l.includes('leonardo') || l.includes('dall') ||
      l.includes('designer') || l.includes('ideogram') || l.includes('firefly');
  };

  const isVoiceTool = (name = '') => {
    const l = name.toLowerCase();
    return l.includes('elevenlabs') || l.includes('suno') || l.includes('udio') || l.includes('mubert');
  };

  const creditCost = selectedSub
    ? (isImageTool(selectedSub.tool?.name) || isVoiceTool(selectedSub.tool?.name) ? 5 : 1)
    : 1;

  const chatHistory = getSubChatHistory();

  return (
    <>
      <Navbar />
      <div className="dashboard-page-container">
        <Sidebar isAdminPanel={false} />

        <main className="workspace-content" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem 2rem' }}>
          {/* Header */}
          <div className="workspace-header" style={{ marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={24} style={{ color: 'var(--color-primary)' }} />
                AI Playground
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Chat with premium AI agents using your active subscriptions.
              </p>
            </div>
          </div>

          {/* Loading state */}
          {loadingSubs ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem', color: 'var(--text-muted)', gap: '0.75rem' }}>
              <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
              Syncing active subscriptions...
            </div>
          ) : loadError ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '540px', margin: '2rem auto' }}>
              <AlertTriangle size={40} style={{ color: 'var(--color-warning)', marginBottom: '1rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>Connection Error</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{loadError}</p>
              <button onClick={fetchActiveSubs} className="gradient-btn">
                <RefreshCw size={16} /> Retry
              </button>
            </div>
          ) : activeSubs.length === 0 ? (
            <div className="glass-card" style={{
              padding: '4rem 3rem',
              textAlign: 'center',
              border: '1px dashed var(--border-color)',
              maxWidth: '600px',
              margin: '2rem auto'
            }}>
              <Sparkles size={56} style={{ color: 'var(--color-primary)', opacity: 0.4, marginBottom: '1.5rem' }} />
              <h3 style={{ marginBottom: '0.75rem' }}>Playground Offline</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
                You don't have any active AI tool subscriptions. Browse our catalog and purchase a plan to unlock
                the AI Playground with full chat capabilities.
              </p>
              <Link to="/tools" className="gradient-btn" style={{ display: 'inline-flex' }}>
                <Zap size={16} /> Browse AI Tools
              </Link>
            </div>
          ) : (
            <div className="playground-container">

              {/* Left: Tool selector sidebar */}
              <div className="playground-sidebar">
                <span style={{
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  fontWeight: 700,
                  paddingLeft: '0.25rem',
                  letterSpacing: '0.08em'
                }}>
                  My AI Agents ({activeSubs.length})
                </span>

                {activeSubs.map((sub) => {
                  const isActive = selectedSub?._id === sub._id;
                  const lowCredits = sub.creditsRemaining < 10;
                  return (
                    <div
                      key={sub._id}
                      onClick={() => { setSelectedSub(sub); setError(''); }}
                      className={`playground-tool-item ${isActive ? 'active' : ''}`}
                      style={{ position: 'relative' }}
                    >
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img
                          src={sub.tool?.logo || `https://picsum.photos/seed/${sub.tool?.name}/32/32`}
                          alt={sub.tool?.name}
                          style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = `https://picsum.photos/seed/${sub._id}/36/36`; }}
                        />
                        {isActive && (
                          <span style={{
                            position: 'absolute',
                            bottom: '-2px',
                            right: '-2px',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: 'var(--color-success)',
                            border: '2px solid var(--bg-card)',
                            boxShadow: '0 0 6px var(--color-success)'
                          }} />
                        )}
                      </div>

                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          color: isActive ? 'var(--color-primary)' : 'var(--text-main)'
                        }}>
                          {sub.tool?.name}
                        </div>
                        <div style={{
                          fontSize: '0.72rem',
                          color: lowCredits ? 'var(--color-warning)' : 'var(--text-muted)',
                          marginTop: '0.1rem'
                        }}>
                          {sub.creditsRemaining} credits {lowCredits ? '⚠️' : ''}
                        </div>
                      </div>

                      {isActive && <ChevronRight size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />}
                    </div>
                  );
                })}
              </div>

              {/* Right: Chat workspace */}
              <div className="playground-workspace">

                {/* Chat header bar */}
                <div style={{
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '0.875rem',
                  marginBottom: '0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <img
                      src={selectedSub?.tool?.logo || `https://picsum.photos/seed/${selectedSub?.tool?.name}/32/32`}
                      alt=""
                      style={{ width: '30px', height: '30px', borderRadius: 'var(--radius-sm)' }}
                      onError={(e) => { e.target.src = `https://picsum.photos/seed/${selectedSub?._id}/30/30`; }}
                    />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                        {selectedSub?.tool?.name}
                      </h4>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block', boxShadow: '0 0 4px var(--color-success)' }} />
                        Node Online
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Quota: <strong style={{ color: selectedSub?.creditsRemaining < 10 ? 'var(--color-warning)' : 'var(--text-main)' }}>
                        {selectedSub?.creditsRemaining} cr
                      </strong>
                    </span>
                    {chatHistory.length > 0 && (
                      <button
                        onClick={clearChat}
                        title="Clear chat history"
                        className="theme-toggle"
                        style={{ padding: '0.35rem' }}
                      >
                        <Trash2 size={14} style={{ color: 'var(--text-muted)' }} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Chat messages area */}
                <div className="playground-chat-history">

                  {/* Welcome message when no chat yet */}
                  {chatHistory.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                      <Sparkles size={32} style={{ color: 'var(--color-primary)', opacity: 0.5, marginBottom: '0.75rem' }} />
                      <p style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                        Welcome to {selectedSub?.tool?.name} Playground
                      </p>
                      <p style={{ fontSize: '0.82rem', lineHeight: 1.6, maxWidth: '380px', margin: '0 auto' }}>
                        This node is live and ready. Type any prompt below to get an AI response.
                        Each message costs <strong>{creditCost} credit{creditCost > 1 ? 's' : ''}</strong>.
                      </p>
                      {/* Quick prompt suggestions */}
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1.25rem' }}>
                        {getSuggestions(selectedSub?.tool?.name).map((s, i) => (
                          <button
                            key={i}
                            onClick={() => setInputPrompt(s)}
                            style={{
                              padding: '0.4rem 0.875rem',
                              background: 'var(--bg-card-hover)',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-full)',
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                              color: 'var(--text-main)',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => e.target.style.borderColor = 'var(--color-primary)'}
                            onMouseLeave={e => e.target.style.borderColor = 'var(--border-color)'}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Render chat messages */}
                  {chatHistory.map((msg, index) => {
                    const isUser = msg.role === 'user';
                    const isError = msg.role === 'error';

                    if (isError) {
                      return (
                        <div key={index} style={{
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          color: 'var(--color-danger)',
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.5rem',
                          maxWidth: '90%'
                        }}>
                          <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                          <span>{msg.content}</span>
                        </div>
                      );
                    }

                    return (
                      <div key={index} className={`chat-message ${isUser ? 'user' : 'system'}`}>
                        {/* Avatar */}
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: isUser
                            ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
                            : 'var(--bg-card-hover)',
                          border: isUser ? 'none' : '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          overflow: 'hidden'
                        }}>
                          {isUser
                            ? <User size={15} color="#fff" />
                            : <img
                              src={selectedSub?.tool?.logo || `https://picsum.photos/seed/${selectedSub?.tool?.name}/32/32`}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span>🤖</span>'; }}
                            />
                          }
                        </div>

                        {/* Bubble */}
                        <div style={{ maxWidth: isUser ? '70%' : '85%' }}>
                          <div className="chat-bubble" style={{
                            background: isUser ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'var(--bg-card-hover)',
                            border: isUser ? 'none' : '1px solid var(--border-color)',
                            color: isUser ? '#fff' : 'var(--text-main)',
                            borderTopRightRadius: isUser ? '4px' : undefined,
                            borderTopLeftRadius: !isUser ? '4px' : undefined
                          }}>
                            {isUser ? (
                              <p style={{ margin: 0, lineHeight: 1.55 }}>{msg.content}</p>
                            ) : (
                              <div
                                className="pg-markdown"
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                              />
                            )}

                            {/* Image render if URL detected and image tool */}
                            {!isUser && isImageTool(selectedSub?.tool?.name) && (
                              (() => {
                                const imgMatch = msg.content.match(/https?:\/\/[^\s"')]+\.(jpg|jpeg|png|webp|gif|svg)/i)
                                  || msg.content.match(/https?:\/\/picsum\.photos\/[^\s"')]+/i);
                                if (imgMatch) {
                                  return (
                                    <div style={{ marginTop: '0.75rem' }}>
                                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}>
                                        <ImageIcon size={12} /> Generated Render:
                                      </span>
                                      <img
                                        src={imgMatch[0]}
                                        alt="AI Generated"
                                        style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: 'var(--radius-md)', display: 'block' }}
                                      />
                                    </div>
                                  );
                                }
                                return null;
                              })()
                            )}

                            {/* Audio player for voice tools */}
                            {!isUser && isVoiceTool(selectedSub?.tool?.name) && msg.content.includes('soundhelix') && (
                              <div style={{ marginTop: '0.75rem' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem' }}>
                                  <Volume2 size={12} /> Audio Output:
                                </span>
                                <audio controls style={{ width: '100%', height: '36px' }}>
                                  <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" type="audio/mpeg" />
                                </audio>
                              </div>
                            )}
                          </div>

                          {/* Message meta */}
                          <div style={{
                            fontSize: '0.68rem',
                            color: 'var(--text-muted)',
                            marginTop: '0.3rem',
                            paddingLeft: '0.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            justifyContent: isUser ? 'flex-end' : 'flex-start'
                          }}>
                            {msg.timestamp && (
                              <span>{new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            )}
                            {!isUser && msg.engine === 'gemini' && (
                              <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>⚡ Gemini</span>
                            )}
                            {!isUser && msg.engine === 'simulation' && (
                              <span style={{ opacity: 0.6 }}>Demo Mode</span>
                            )}
                            {!isUser && msg.creditsSpent && (
                              <span>-{msg.creditsSpent} cr</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing indicator */}
                  {executingPrompt && (
                    <div className="chat-message system">
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'var(--bg-card-hover)',
                        border: '1px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <Cpu size={15} style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div className="chat-bubble" style={{
                        background: 'var(--bg-card-hover)',
                        border: '1px solid var(--border-color)',
                        borderTopLeftRadius: '4px',
                        display: 'flex', alignItems: 'center', gap: '5px', padding: '0.875rem 1.25rem'
                      }}>
                        <span style={{
                          width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-primary)',
                          animation: 'typing-dot 1.2s infinite', animationDelay: '0s'
                        }} />
                        <span style={{
                          width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-primary)',
                          animation: 'typing-dot 1.2s infinite', animationDelay: '0.3s'
                        }} />
                        <span style={{
                          width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-primary)',
                          animation: 'typing-dot 1.2s infinite', animationDelay: '0.6s'
                        }} />
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Error banner above input */}
                {error && (
                  <div style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: 'var(--color-danger)',
                    padding: '0.6rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    margin: '0.5rem 0'
                  }}>
                    <ShieldAlert size={14} />
                    <span style={{ flex: 1 }}>{error}</span>
                    <button onClick={() => setError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', fontSize: '1rem', padding: 0 }}>×</button>
                  </div>
                )}

                {/* Input form */}
                <form onSubmit={handleSendPrompt} className="playground-input-row">
                  <input
                    ref={inputRef}
                    type="text"
                    className="form-input"
                    placeholder={executingPrompt
                      ? `${selectedSub?.tool?.name} is thinking...`
                      : `Message ${selectedSub?.tool?.name}...`
                    }
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    disabled={executingPrompt}
                    style={{ flex: 1, transition: 'all 0.2s ease' }}
                    maxLength={2000}
                  />
                  <button
                    type="submit"
                    disabled={executingPrompt || !inputPrompt.trim()}
                    className="gradient-btn"
                    style={{ padding: '0.75rem 1.25rem', flexShrink: 0 }}
                  >
                    <Send size={16} />
                  </button>
                </form>

                {/* Footer meta */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.4rem',
                  padding: '0 0.25rem'
                }}>
                  <span>Cost: <strong>{creditCost} credit{creditCost > 1 ? 's' : ''}</strong> per message</span>
                  <span style={{ display: 'flex', gap: '0.75rem' }}>
                    <span>Enter to send</span>
                    <span>Safety filters active</span>
                  </span>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>

      {/* Playground CSS injected inline */}
      <style>{`
        @keyframes typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Markdown styles for AI responses */
        .pg-markdown { font-size: 0.9rem; line-height: 1.65; word-break: break-word; }
        .pg-markdown .pg-h2 { font-size: 1.15rem; font-weight: 700; margin: 0.75rem 0 0.4rem 0; }
        .pg-markdown .pg-h3 { font-size: 1rem; font-weight: 700; margin: 0.6rem 0 0.3rem 0; }
        .pg-markdown .pg-h4 { font-size: 0.9rem; font-weight: 700; margin: 0.5rem 0 0.25rem 0; color: var(--color-primary); }
        .pg-markdown .pg-li { padding-left: 1rem; position: relative; margin: 0.2rem 0; }
        .pg-markdown .pg-li::before { content: '•'; position: absolute; left: 0; color: var(--color-primary); }
        .pg-markdown .pg-li-num { padding-left: 1.5rem; margin: 0.2rem 0; counter-increment: list-counter; }
        .pg-markdown .pg-check { margin: 0.2rem 0; }
        .pg-markdown .pg-check.done { color: var(--color-success); }
        .pg-markdown .pg-blockquote {
          border-left: 3px solid var(--color-primary);
          padding: 0.5rem 1rem;
          margin: 0.5rem 0;
          background: rgba(79,70,229,0.06);
          border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
          font-style: italic;
        }
        .pg-markdown .pg-hr { border: none; border-top: 1px solid var(--border-color); margin: 0.75rem 0; }
        .pg-markdown .pg-code-block {
          background: rgba(0,0,0,0.35);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.875rem 1rem;
          overflow-x: auto;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 0.82rem;
          line-height: 1.5;
          margin: 0.6rem 0;
          white-space: pre;
        }
        .pg-markdown .pg-inline-code {
          background: rgba(0,0,0,0.25);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          padding: 0.1rem 0.35rem;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 0.82rem;
        }
        .pg-markdown .pg-link {
          color: var(--color-accent);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .pg-markdown .pg-td {
          border: 1px solid var(--border-color);
          padding: 0.35rem 0.6rem;
          font-size: 0.82rem;
        }
        .pg-markdown .pg-image-wrap {
          margin: 0.75rem 0;
          text-align: center;
        }
        .pg-markdown .pg-image {
          max-width: 100%;
          max-height: 280px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          display: block;
          margin: 0 auto;
        }
        .pg-markdown .pg-image-caption {
          font-size: 0.72rem;
          color: var(--text-muted);
          display: block;
          margin-top: 0.3rem;
        }

        .playground-tool-item { transition: all 0.2s ease; }
        .playground-tool-item:hover { transform: translateX(2px); }
      `}</style>

      <Footer />
    </>
  );
};

// Quick prompt suggestions per tool type
function getSuggestions(toolName = '') {
  const name = toolName.toLowerCase();
  if (name.includes('chatgpt') || name.includes('gpt') || name.includes('claude') || name.includes('gemini')) {
    return ['Explain quantum computing simply', 'Write a short poem about AI', 'What is the future of work?'];
  }
  if (name.includes('copilot') || name.includes('cursor') || name.includes('code')) {
    return ['Write a React custom hook', 'Explain async/await in JS', 'Fix this: for(i=0;i<n;i++)'];
  }
  if (name.includes('midjourney') || name.includes('dall') || name.includes('image')) {
    return ['A cyberpunk city at night', 'Watercolor painting of mountains', 'A futuristic robot in a garden'];
  }
  if (name.includes('elevenlabs') || name.includes('voice')) {
    return ['Hello, welcome to our platform!', 'Thank you for your purchase today.', 'Please hold, we will be right with you.'];
  }
  if (name.includes('suno') || name.includes('udio') || name.includes('music')) {
    return ['Upbeat electronic dance track', 'Calm lo-fi study beats', 'Epic cinematic orchestral theme'];
  }
  return ['What can you help me with?', 'Tell me something interesting', 'Summarize the latest AI trends'];
}

export default Playground;
