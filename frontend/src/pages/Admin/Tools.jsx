import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Plus, Edit2, Trash2, Cpu, AlertTriangle, ArrowRight, ShieldCheck, Upload, ChevronLeft, FolderTree } from 'lucide-react';
import Sidebar from '../../components/Sidebar.jsx';
import Navbar from '../../components/Navbar.jsx';
import api from '../../services/api.js';
import '../dashboard.css';

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
  const [features, setFeatures] = useState(''); // Textarea with line-separated features
  const [rules, setRules] = useState(''); // Textarea with line-separated rules
  const [maxDailyLimit, setMaxDailyLimit] = useState(50);
  const [maxMonthlyLimit, setMaxMonthlyLimit] = useState(1000);
  const [remainingCredits, setRemainingCredits] = useState(10000);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  
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
    
    // Convert line breaks to JSON arrays
    const featuresArr = features.split('\n').map(f => f.trim()).filter(f => f.length > 0);
    const rulesArr = rules.split('\n').map(r => r.trim()).filter(r => r.length > 0);
    formData.append('features', JSON.stringify(featuresArr));
    formData.append('rules', JSON.stringify(rulesArr));
    
    formData.append('maxDailyLimit', maxDailyLimit);
    formData.append('maxMonthlyLimit', maxMonthlyLimit);
    formData.append('remainingCredits', remainingCredits);

    if (logoFile) formData.append('logo', logoFile);
    if (bannerFile) formData.append('banner', bannerFile);

    try {
      let res;
      if (editingTool) {
        // Update
        res = await api.put(`/tools/${editingTool._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Create
        res = await api.post('/tools', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data?.success) {
        setSuccess(editingTool ? 'AI Tool updated successfully!' : 'AI Tool created successfully!');
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
                  <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>AI Tools manager</h1>
                  <p style={{ color: 'var(--text-muted)' }}>Configure credentials pricing, features rules list, and shared pool limits.</p>
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
            <div className="glass-card" style={{ padding: '2.5rem', maxWidth: '800px', margin: '0 auto' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>{editingTool ? `Update AI Tool: ${editingTool.name}` : 'Create AI Tool'}</h3>
              
              {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-danger)', color: 'var(--color-danger)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>{error}</div>}

              <form onSubmit={handleToolSubmit}>
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
                    <textarea className="form-input" rows={4} placeholder="GPT-4o capabilities&#10;Voice output" value={features} onChange={(e) => setFeatures(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Access rules (One rule per line)</label>
                    <textarea className="form-input" rows={4} placeholder="Do not spam api&#10;No scraping" value={rules} onChange={(e) => setRules(e.target.value)} />
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

                <button type="submit" disabled={formLoading} className="gradient-btn" style={{ width: '100%', justifyContent: 'center' }}>
                  {formLoading ? 'Saving changes...' : editingTool ? 'Save Tool Changes' : 'Publish AI Tool'}
                </button>
              </form>
            </div>
          )}

        </main>
      </div>
    </>
  );
};

export default AdminTools;
