import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Sparkles, Send, Cpu, AlertTriangle, User, Play, Image as ImageIcon, Volume2, ShieldAlert } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import api from '../../services/api.js';
import '../dashboard.css';

const Playground = () => {
  const { fetchMe } = useAuth();
  
  const [activeSubs, setActiveSubs] = useState([]);
  const [selectedSub, setSelectedSub] = useState(null);
  const [loadingSubs, setLoadingSubs] = useState(true);

  // Chat playground states
  const [messages, setMessages] = useState({}); // { [subId]: [{ role, content }] }
  const [inputPrompt, setInputPrompt] = useState('');
  const [executingPrompt, setExecutingPrompt] = useState(false);
  const [error, setError] = useState('');

  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchActiveSubs = async () => {
      try {
        setLoadingSubs(true);
        const res = await api.get('/settings/user/stats');
        if (res.data?.success) {
          const subs = res.data.data.activeSubscriptions || [];
          setActiveSubs(subs);
          if (subs.length > 0) {
            setSelectedSub(subs[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load active playground subscriptions:', err);
      } finally {
        setLoadingSubs(false);
      }
    };

    fetchActiveSubs();
  }, []);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedSub]);

  const handleSendPrompt = async (e) => {
    e.preventDefault();
    if (!inputPrompt.trim() || executingPrompt || !selectedSub) return;

    const currentSubId = selectedSub._id;
    const promptToSend = inputPrompt;
    setInputPrompt('');
    setExecutingPrompt(true);
    setError('');

    // Append User message to local chat state
    const userMsg = { role: 'user', content: promptToSend };
    setMessages(prev => ({
      ...prev,
      [currentSubId]: [...(prev[currentSubId] || []), userMsg]
    }));

    try {
      const res = await api.post('/usage/execute', {
        toolId: selectedSub.tool?._id,
        prompt: promptToSend
      });

      if (res.data?.success) {
        // Append AI response
        const aiMsg = { role: 'system', content: res.data.result };
        setMessages(prev => ({
          ...prev,
          [currentSubId]: [...(prev[currentSubId] || []), aiMsg]
        }));

        // Update remaining credits in selected sub state
        setSelectedSub(prev => ({
          ...prev,
          creditsRemaining: res.data.creditsRemaining
        }));

        // Update activeSubs array to reflect new credit balance
        setActiveSubs(prev =>
          prev.map(sub => (sub._id === currentSubId ? { ...sub, creditsRemaining: res.data.creditsRemaining } : sub))
        );

        // Sync main Auth Wallet
        await fetchMe();
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Playground execution failed.';
      setError(errMsg);
      // Append failure message
      const systemErrorMsg = { role: 'system', content: `[Error]: ${errMsg}` };
      setMessages(prev => ({
        ...prev,
        [currentSubId]: [...(prev[currentSubId] || []), systemErrorMsg]
      }));
    } finally {
      setExecutingPrompt(false);
    }
  };

  const getSubChatHistory = () => {
    if (!selectedSub) return [];
    return messages[selectedSub._id] || [
      {
        role: 'system',
        content: `### Welcome to **${selectedSub.tool?.name}** Shared Playground Node!\n\n- Daily limits: **${selectedSub.tool?.maxDailyLimit || 50} requests**\n- Subscription Cost: **1 credit** for chatbots, **5 credits** for image/voice syntheses.\n\n*Please type your instruction prompt details below to initiate AI generations.*`
      }
    ];
  };

  const isImageTool = (name = '') => {
    const l = name.toLowerCase();
    return l.includes('midjourney') || l.includes('leonardo') || l.includes('designer');
  };

  const isVoiceTool = (name = '') => {
    const l = name.toLowerCase();
    return l.includes('elevenlabs') || l.includes('suno') || l.includes('udio');
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-page-container">
        <Sidebar isAdminPanel={false} />

        <main className="workspace-content" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="workspace-header">
            <div>
              <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>AI Playground</h1>
              <p style={{ color: 'var(--text-muted)' }}>Query premium shared subscription endpoints from a unified interface.</p>
            </div>
          </div>

          {loadingSubs ? (
            <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Syncing active subscriptions...</div>
          ) : activeSubs.length === 0 ? (
            <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', border: '1px dashed var(--border-color)', maxWidth: '600px', margin: '2rem auto' }}>
              <AlertTriangle size={48} style={{ color: 'var(--color-warning)', marginBottom: '1.5rem' }} />
              <h3>Playground Offline</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '2rem' }}>
                You do not have any active MERN subscription licenses. Top up your wallet and buy tools to start using the playground.
              </p>
              <Link to="/tools" className="gradient-btn">Unlock AI Tools</Link>
            </div>
          ) : (
            <div className="playground-container">
              
              {/* Left sidebar selector */}
              <div className="playground-sidebar">
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, paddingLeft: '0.5rem', marginBottom: '0.5rem' }}>
                  Available nodes
                </span>
                {activeSubs.map((sub) => (
                  <div
                    key={sub._id}
                    onClick={() => {
                      setSelectedSub(sub);
                      setError('');
                    }}
                    className={`playground-tool-item ${selectedSub?._id === sub._id ? 'active' : ''}`}
                  >
                    <img src={sub.tool?.logo || 'https://picsum.photos/32'} alt="" style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {sub.tool?.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {sub.creditsRemaining} credits left
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right chat panel */}
              <div className="playground-workspace">
                
                {/* Active node details */}
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <img src={selectedSub?.tool?.logo || 'https://picsum.photos/32'} alt="" style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)' }} />
                    <div>
                      <h4 style={{ margin: 0 }}>{selectedSub?.tool?.name} Playground</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-success)' }}>Node Online</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Quota: <strong>{selectedSub?.creditsRemaining} credits</strong>
                  </span>
                </div>

                {/* Chat History scroll pane */}
                <div className="playground-chat-history">
                  {getSubChatHistory().map((msg, index) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div key={index} className={`chat-message ${isUser ? 'user' : 'system'}`}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: isUser ? 'var(--color-primary)' : 'var(--bg-card-hover)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {isUser ? <User size={16} /> : <Cpu size={16} />}
                        </div>
                        <div className="chat-bubble" style={{ background: isUser ? 'var(--color-primary)' : 'var(--bg-card-hover)', border: isUser ? 'none' : '1px solid var(--border-color)' }}>
                          
                          {/* Text prompt rendering */}
                          <div style={{ whiteSpace: 'pre-wrap' }}>
                            {msg.content}
                          </div>

                          {/* Extra layout features (Midjourney images or Elevenlabs Audio) */}
                          {!isUser && !msg.content.includes('[Error]') && (
                            <div style={{ marginTop: '1rem' }}>
                              {isImageTool(selectedSub?.tool?.name) && msg.content.includes('http') && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    <ImageIcon size={14} /> Render Output:
                                  </span>
                                  {/* Extract Image link URL regex */}
                                  <img
                                    src={msg.content.match(/\((https?:\/\/[^\s]+)\)/)?.[1] || 'https://picsum.photos/600/400'}
                                    alt="Visual render output"
                                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                                  />
                                </div>
                              )}

                              {isVoiceTool(selectedSub?.tool?.name) && msg.content.includes('.mp3') && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    <Volume2 size={14} /> Voice Output Player:
                                  </span>
                                  <audio controls style={{ width: '100%' }}>
                                    <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                  </audio>
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })}
                  
                  {executingPrompt && (
                    <div className="chat-message system">
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-card-hover)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                        <Cpu size={16} />
                      </div>
                      <div className="chat-bubble skeleton" style={{ width: '180px', height: '40px' }}></div>
                    </div>
                  )}

                  {error && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid var(--color-danger)',
                      color: 'var(--color-danger)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      maxWidth: '85%'
                    }}>
                      <ShieldAlert size={16} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Prompt Send form input */}
                <form onSubmit={handleSendPrompt} className="playground-input-row">
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`Type instructions for ${selectedSub?.tool?.name}...`}
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    disabled={executingPrompt}
                    style={{ flex: 1 }}
                  />
                  <button type="submit" disabled={executingPrompt || !inputPrompt.trim()} className="gradient-btn" style={{ padding: '0.75rem 1.25rem' }}>
                    <Send size={16} />
                  </button>
                </form>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', padding: '0 0.5rem' }}>
                  <span>Credits cost: <strong>{isImageTool(selectedSub?.tool?.name) || isVoiceTool(selectedSub?.tool?.name) ? '5' : '1'} cr</strong></span>
                  <span>Safety filters active</span>
                </div>

              </div>

            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
};

export default Playground;
