import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Plus, Edit2, Trash2, Cpu, AlertTriangle, ArrowRight, ShieldCheck,
  Upload, ChevronLeft, FolderTree, Plug, Loader2, CheckCircle2,
  XCircle, KeyRound, Globe, Zap, Eye, EyeOff
} from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import Navbar from '../../components/Navbar.jsx';
import api from '../../services/api.js';
import '../dashboard.css';

// API Type metadata — label, placeholder key format, default model, color
const API_TYPES = {
  none:       { label: 'None (use global / simulation)',  color: 'var(--text-muted)',    modelPlaceholder: '' },
  openai:     { label: 'OpenAI (ChatGPT / DALL·E)',       color: '#10a37f',              modelPlaceholder: 'gpt-4o' },
  gemini:     { label: 'Google Gemini',                   color: '#4285f4',              modelPlaceholder: 'gemini-1.5-pro' },
  anthropic:  { label: 'Anthropic Claude',                color: '#d4a27f',              modelPlaceholder: 'claude-3-5-sonnet-20241022' },
  elevenlabs: { label: 'ElevenLabs (Voice / TTS)',        color: '#f97316',              modelPlaceholder: '' },
  custom:     { label: 'Custom REST Endpoint',            color: '#8b5cf6',              modelPlaceholder: '' },
};

// Badge for API status
const ApiStatusBadge = ({ status, apiType }) => {
  if (!status || status === 'none' || apiType === 'none') {
    return <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0.2rem 0.6rem', background: 'var(--border-color)', borderRadius: 'var(--radius-full)' }}>No API</span>;
  }
  if (status === 'verified') {
    return <span style={{ fontSize: '0.72rem', color: '#22c55e', padding: '0.2rem 0.6rem', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle2 size={10} /> Verified</span>;
  }
  if (status === 'invalid') {
    return <span style={{ fontSize: '0.72rem', color: '#ef4444', padding: '0.2rem 0.6rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><XCircle size={10} /> Invalid</span>;
  }
  return <span style={{ fontSize: '0.72rem', color: '#f59e0b', padding: '0.2rem 0.6rem', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Zap size={10} /> Unverified</span>;
};

const AdminTools = () => {
  const [view, setView] = useState('LIST'); // LIST, FORM
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states (Tool)
  const [editingTool, setEditingTool] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState(500);
  const [credits, setCredits] = useState(100);
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [rules, setRules] = useState('');
  const [maxDailyLimit, setMaxDailyLimit] = useState(50);
  const [maxMonthlyLimit, setMaxMonthlyLimit] = useState(1000);
  const [remainingCredits, setRemainingCredits] = useState(10000);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  // API Configuration states
  const [apiType, setApiType] = useState('none');
  const [apiKey, setApiKey] = useState('');
  const [apiModel, setApiModel] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success, error, apiStatus, engine }

  // Category CRUD states
  const [newCatName, setNewCatName] = useState('');
  const [catError, setCatError] = useState('');

  // Status indicators
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const toolRes = await api.get('/tools?status=all');
      if (toolRes.data?.success) {
        setTools(toolRes.data.data);
      }

      const catRes = await api.get('/tools/categories');
      if (catRes.data?.success) {
        setCategories(catRes.data.data);
        if (catRes.data.data.length > 0 && !category) {
          setCategory(catRes.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load tools directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetApiFields = () => {
    setApiType('none');
    setApiKey('');
    setApiModel('');
    setApiEndpoint('');
    setShowApiKey(false);
    setTestResult(null);
  };

  const handleOpenCreateForm = () => {
    setEditingTool(null);
    setName('');
    if (categories.length > 0) setCategory(categories[0]._id);
    setPrice(500);
    setCredits(100);
    setDescription('');
    setFeatures('');
    setRules('');
    setMaxDailyLimit(50);
    setMaxMonthlyLimit(1000);
    setRemainingCredits(10000);
    setLogoFile(null);
    setBannerFile(null);
    resetApiFields();
    setError('');
    setView('FORM');
  };

  const handleOpenEditForm = (tool) => {
    setEditingTool(tool);
    setName(tool.name);
    setCategory(tool.category?._id || '');
    setPrice(tool.price);
    setCredits(tool.creditsPerPurchase);
    setDescription(tool.description);
    setFeatures(tool.features?.join('\n') || '');
    setRules(tool.rules?.join('\n') || '');
    setMaxDailyLimit(tool.maxDailyLimit || 50);
    setMaxMonthlyLimit(tool.maxMonthlyLimit || 1000);
    setRemainingCredits(tool.remainingCredits || 10000);
    setLogoFile(null);
    setBannerFile(null);
    // API config — pre-fill type, model, endpoint (NOT the key — it's hidden for security)
    setApiType(tool.apiType || 'none');
    setApiKey(''); // Key is never returned — user must re-enter to change
    setApiModel(tool.apiModel || '');
    setApiEndpoint(tool.apiEndpoint || '');
    setShowApiKey(false);
    setTestResult(null);
    setError('');
    setView('FORM');
  };

  const handleToolSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFormLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('creditsPerPurchase', credits);
    formData.append('description', description);

    const featuresArr = features.split('\n').map(f => f.trim()).filter(f => f.length > 0);
    const rulesArr = rules.split('\n').map(r => r.trim()).filter(r => r.length > 0);
    formData.append('features', JSON.stringify(featuresArr));
    formData.append('rules', JSON.stringify(rulesArr));

    formData.append('maxDailyLimit', maxDailyLimit);
    formData.append('maxMonthlyLimit', maxMonthlyLimit);
    formData.append('remainingCredits', remainingCredits);

    // API Configuration
    formData.append('apiType', apiType);
    if (apiKey.trim()) formData.append('apiKey', apiKey.trim()); // Only send if user typed a key
    if (apiModel.trim()) formData.append('apiModel', apiModel.trim());
    if (apiEndpoint.trim()) formData.append('apiEndpoint', apiEndpoint.trim());

    if (logoFile) formData.append('logo', logoFile);
    if (bannerFile) formData.append('banner', bannerFile);

    try {
      let res;
      if (editingTool) {
        res = await api.put(`/tools/${editingTool._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/tools', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data?.success) {
        setSuccess(editingTool ? 'AI Tool updated successfully!' : 'AI Tool created & API configured!');
        fetchData();
        setTimeout(() => {
          setView('LIST');
          setSuccess('');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit tool form');
    } finally {
      setFormLoading(false);
    }
  };

  const handleTestAPI = async () => {
    if (!editingTool) {
      setTestResult({ success: false, error: 'Please save the tool first, then test its API.' });
      return;
    }
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await api.post(`/tools/${editingTool._id}/test-api`);
      setTestResult({
        success: res.data?.success,
        apiStatus: res.data?.apiStatus,
        engine: `${res.data?.apiType}/${res.data?.apiModel || 'default'}`,
        preview: res.data?.testResult?.substring(0, 120)
      });
      // Refresh tool list so badge updates
      fetchData();
    } catch (err) {
      setTestResult({
        success: false,
        error: err.response?.data?.error || 'API test failed. Check your key and try again.'
      });
    } finally {
      setTestLoading(false);
    }
  };

  const handleDeleteTool = async (toolId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this AI Tool profile? This will break active subscriptions referencing it.')) return;

    setError('');
    setSuccess('');
    try {
      const res = await api.delete(`/tools/${toolId}`);
      if (res.data?.success) {
        setSuccess('AI Tool profile deleted');
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete tool');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCatError('');
    if (!newCatName.trim()) return;

    try {
      const res = await api.post('/tools/categories', { name: newCatName });
      if (res.data?.success) {
        setNewCatName('');
        fetchData();
      }
    } catch (err) {
      setCatError(err.response?.data?.error || 'Category creation failed');
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Delete category? Ensure no tools belong to it first.')) return;

    setCatError('');
    try {
      const res = await api.delete(`/tools/categories/${catId}`);
      if (res.data?.success) {
        fetchData();
      }
    } catch (err) {
      setCatError(err.response?.data?.error || 'Delete category failed');
    }
  };

  const selectedApiMeta = API_TYPES[apiType] || API_TYPES.none;

  return (
    <>
      <Navbar />
      <div className="dashboard-page-container">
        <Sidebar isAdminPanel={true} />

        <main className="workspace-content" style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Header */}
          <div className="workspace-header">
            {view === 'LIST' ? (
              <>
                <div>
                  <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>AI Tools Manager</h1>
                  <p style={{ color: 'var(--text-muted)' }}>Configure tools, API keys, pricing, features, and shared pool limits.</p>
                </div>
                <button onClick={handleOpenCreateForm} className="gradient-btn">
                  Create AI Tool <Plus size={16} />
                </button>
              </>
            ) : (
              <button onClick={() => setView('LIST')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 500 }}>
                <ChevronLeft size={20} /> Back to Catalog
              </button>
            )}
          </div>

          {success && <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--color-success)', color: 'var(--color-success)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>{success}</div>}

          {view === 'LIST' ? (
            /* ==========================================
               LIST VIEW (Catalog table & Category admin)
               ========================================== */
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>

              {/* Tools Table */}
              <div>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Cpu size={18} /> Shared Tools Catalog</h3>
                <div className="data-table-container">
                  {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading AI catalog...</div>
                  ) : tools.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No tools created. Click Create Tool to begin.</div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Logo / Tool Name</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Shared Credits</th>
                          <th>API Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tools.map((t) => (
                          <tr key={t._id}>
                            <td style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', borderBottom: 'none' }}>
                              <img src={t.logo || 'https://picsum.photos/32'} alt="" style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                              <strong>{t.name}</strong>
                            </td>
                            <td>{t.category?.name || 'Uncategorized'}</td>
                            <td>{t.price} PKR</td>
                            <td>{t.remainingCredits} cr</td>
                            <td>
                              <ApiStatusBadge status={t.apiStatus} apiType={t.apiType} />
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button onClick={() => handleOpenEditForm(t)} className="theme-toggle" title="Edit tool profile">
                                  <Edit2 size={16} style={{ color: 'var(--color-accent)' }} />
                                </button>
                                <button onClick={() => handleDeleteTool(t._id)} className="theme-toggle" title="Delete tool">
                                  <Trash2 size={16} style={{ color: 'var(--color-danger)' }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Categories CRUD panel */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}><FolderTree size={16} /> Categories Manager</h3>

                {catError && <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{catError}</p>}

                <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="New category..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    required
                  />
                  <button type="submit" className="gradient-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    Create
                  </button>
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                  {categories.map((cat) => (
                    <div key={cat._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
                      <span>{cat.name}</span>
                      <button onClick={() => handleDeleteCategory(cat._id)} className="theme-toggle" style={{ padding: '0.25rem' }}>
                        <Trash2 size={14} style={{ color: 'var(--color-danger)' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            /* ==========================================
               CREATE/UPDATE FORM VIEW
               ========================================== */
            <div className="glass-card" style={{ padding: '2.5rem', maxWidth: '860px', margin: '0 auto', width: '100%' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>{editingTool ? `Update AI Tool: ${editingTool.name}` : 'Create AI Tool'}</h3>

              {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>{error}</div>}

              <form onSubmit={handleToolSubmit}>

                {/* ── Basic Info ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">Tool Name</label>
                    <input type="text" className="form-input" placeholder="ChatGPT Plus" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)} required>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">Topup Price (PKR)</label>
                    <input type="number" className="form-input" value={price} onChange={(e) => setPrice(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Credits Allocated on Purchase</label>
                    <input type="number" className="form-input" value={credits} onChange={(e) => setCredits(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">Features list (One item per line)</label>
                    <textarea className="form-input" rows={4} placeholder={"GPT-4o capabilities\nVoice output"} value={features} onChange={(e) => setFeatures(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Access rules (One rule per line)</label>
                    <textarea className="form-input" rows={4} placeholder={"Do not spam api\nNo scraping"} value={rules} onChange={(e) => setRules(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">Daily Limit (Requests)</label>
                    <input type="number" className="form-input" value={maxDailyLimit} onChange={(e) => setMaxDailyLimit(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Monthly Limit (Requests)</label>
                    <input type="number" className="form-input" value={maxMonthlyLimit} onChange={(e) => setMaxMonthlyLimit(e.target.value)} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Remaining API Credits Pool</label>
                    <input type="number" className="form-input" value={remainingCredits} onChange={(e) => setRemainingCredits(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
                  <div className="form-group">
                    <label className="form-label">Logo Upload (Square PNG)</label>
                    <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} style={{ padding: '0.5rem', border: '1px dashed var(--border-color)', width: '100%', borderRadius: 'var(--radius-md)' }} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cover Banner Upload (Landscape)</label>
                    <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files[0])} style={{ padding: '0.5rem', border: '1px dashed var(--border-color)', width: '100%', borderRadius: 'var(--radius-md)' }} />
                  </div>
                </div>

                {/* ══════════════════════════════════════════════════════════════
                    🔌 AI AGENT API CONFIGURATION SECTION
                ══════════════════════════════════════════════════════════════ */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.08))',
                  border: '1px solid rgba(99,102,241,0.25)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.75rem',
                  marginBottom: '1.5rem'
                }}>
                  {/* Section Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plug size={16} color="#fff" />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>AI Agent API Configuration</h4>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Connect a live API key — this tool will use it for real AI responses</p>
                      </div>
                    </div>
                    {editingTool && (
                      <ApiStatusBadge status={testResult ? testResult.apiStatus : editingTool?.apiStatus} apiType={apiType} />
                    )}
                  </div>

                  {/* API Type selector */}
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Globe size={13} /> API Provider / Type
                    </label>
                    <select
                      className="form-input"
                      value={apiType}
                      onChange={(e) => { setApiType(e.target.value); setApiKey(''); setApiModel(''); setApiEndpoint(''); setTestResult(null); }}
                    >
                      {Object.entries(API_TYPES).map(([key, meta]) => (
                        <option key={key} value={key}>{meta.label}</option>
                      ))}
                    </select>
                  </div>

                  {apiType !== 'none' && (
                    <>
                      {/* API Key field */}
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <KeyRound size={13} /> API Key
                          {editingTool && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.3rem' }}>(leave blank to keep existing key)</span>}
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showApiKey ? 'text' : 'password'}
                            className="form-input"
                            placeholder={editingTool ? '••••••• (existing key preserved)' : `Paste your ${selectedApiMeta.label} API key...`}
                            value={apiKey}
                            onChange={(e) => { setApiKey(e.target.value); setTestResult(null); }}
                            style={{ paddingRight: '2.5rem', fontFamily: apiKey && !showApiKey ? 'monospace' : 'inherit' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                          >
                            {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Model Name */}
                      {apiType !== 'elevenlabs' && apiType !== 'custom' && (
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                          <label className="form-label">Model Name <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional override)</span></label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder={selectedApiMeta.modelPlaceholder || 'e.g. gpt-4o, gemini-1.5-pro, claude-3-5-sonnet-20241022'}
                            value={apiModel}
                            onChange={(e) => setApiModel(e.target.value)}
                          />
                        </div>
                      )}

                      {/* Custom Endpoint — only shown for custom type */}
                      {apiType === 'custom' && (
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Globe size={13} /> Custom API Endpoint URL
                          </label>
                          <input
                            type="url"
                            className="form-input"
                            placeholder="https://your-api.example.com/v1/chat"
                            value={apiEndpoint}
                            onChange={(e) => setApiEndpoint(e.target.value)}
                          />
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                            Must accept POST with <code style={{ background: 'var(--border-color)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>{'{ prompt, system }'}</code> and return <code style={{ background: 'var(--border-color)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>{'{ result }'}</code>
                          </p>
                        </div>
                      )}

                      {/* Test API Connection button */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                        <button
                          type="button"
                          onClick={handleTestAPI}
                          disabled={testLoading || !editingTool}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(99,102,241,0.4)',
                            background: testLoading ? 'var(--border-color)' : 'rgba(99,102,241,0.12)',
                            color: testLoading ? 'var(--text-muted)' : 'var(--color-primary)',
                            cursor: testLoading || !editingTool ? 'not-allowed' : 'pointer',
                            fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s'
                          }}
                        >
                          {testLoading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={15} />}
                          {testLoading ? 'Testing Connection...' : 'Test API Connection'}
                        </button>
                        {!editingTool && (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Save tool first to enable API testing</span>
                        )}
                      </div>

                      {/* Test Result banner */}
                      {testResult && (
                        <div style={{
                          marginTop: '1rem', padding: '0.85rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          background: testResult.success ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                          border: `1px solid ${testResult.success ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                          display: 'flex', alignItems: 'flex-start', gap: '0.75rem'
                        }}>
                          {testResult.success
                            ? <CheckCircle2 size={18} color="#22c55e" style={{ marginTop: '1px', flexShrink: 0 }} />
                            : <XCircle size={18} color="#ef4444" style={{ marginTop: '1px', flexShrink: 0 }} />}
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: testResult.success ? '#22c55e' : '#ef4444' }}>
                              {testResult.success ? `✅ API Connected — ${testResult.engine}` : '❌ Connection Failed'}
                            </p>
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {testResult.success ? testResult.preview : testResult.error}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Info box */}
                      <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
                        <ShieldCheck size={14} color="var(--color-primary)" style={{ marginTop: '1px', flexShrink: 0 }} />
                        <span>API keys are stored securely in the database and <strong style={{ color: 'var(--text-main)' }}>never exposed</strong> in API responses. When a user executes a prompt on this tool, the system uses: <strong style={{ color: 'var(--text-main)' }}>this key → global Gemini → smart simulation</strong>.</span>
                      </div>
                    </>
                  )}
                </div>

                <button type="submit" disabled={formLoading} className="gradient-btn" style={{ width: '100%', justifyContent: 'center' }}>
                  {formLoading ? 'Saving changes...' : editingTool ? 'Save Tool Changes' : 'Publish AI Tool'}
                </button>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default AdminTools;
