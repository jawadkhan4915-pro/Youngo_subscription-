import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, SlidersHorizontal, ArrowRight } from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import api from '../../services/api.js';
import './public.css';

const AllTools = () => {
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch tools & categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Load categories
        const catRes = await api.get('/tools/categories');
        if (catRes.data?.success) {
          setCategories(catRes.data.data);
        }

        // Load tools
        const toolRes = await api.get('/tools');
        if (toolRes.data?.success) {
          setTools(toolRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load tools catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter tools
  const filteredTools = tools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) || 
                          tool.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || tool.category?._id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '3rem 1.5rem min-height: 80vh' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>AI Subscription Library</h1>
          <p style={{ color: 'var(--text-muted)' }}>Unlock access to the worlds leading AI systems, billed transparently via credit wallets.</p>
        </div>

        {/* Filter controls */}
        <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', flex: 1, paddingBottom: '0.25rem' }}>
            <button
              onClick={() => setSelectedCategory('')}
              className={`gradient-btn`}
              style={{
                background: selectedCategory === '' ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'none',
                color: selectedCategory === '' ? '#fff' : 'var(--text-muted)',
                border: selectedCategory === '' ? 'none' : '1px solid var(--border-color)',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem'
              }}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`gradient-btn`}
                style={{
                  background: selectedCategory === cat._id ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'none',
                  color: selectedCategory === cat._id ? '#fff' : 'var(--text-muted)',
                  border: selectedCategory === cat._id ? 'none' : '1px solid var(--border-color)',
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
            <input
              type="text"
              placeholder="Search AI Tools..."
              className="form-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem', paddingRight: '1rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        {/* Tools grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Syncing available licenses...</div>
        ) : filteredTools.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>No AI Tools Found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try refining your search text or selected category filter.</p>
          </div>
        ) : (
          <div className="grid-cols-3" style={{ marginBottom: '5rem' }}>
            {filteredTools.map((tool) => (
              <motion.div
                key={tool._id}
                whileHover={{ y: -4 }}
                className="glass-card tool-card"
                style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div className="tool-header">
                    <img src={tool.logo || 'https://picsum.photos/48'} alt={tool.name} className="tool-logo" />
                    <div className="tool-meta">
                      <span className="tool-name">{tool.name}</span>
                      <span className="tool-cat">{tool.category?.name || 'AI tool'}</span>
                    </div>
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      background: tool.status === 'Available' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: tool.status === 'Available' ? 'var(--color-success)' : 'var(--color-warning)',
                      border: `1px solid ${tool.status === 'Available' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                    }}>
                      {tool.status}
                    </span>
                  </div>
                  <p className="tool-desc" style={{ height: '4rem', marginBottom: '1rem' }}>{tool.description}</p>
                  
                  {tool.features?.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {tool.features.slice(0, 2).map((feat, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Sparkles size={12} style={{ color: 'var(--color-primary)' }} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="tool-price-row" style={{ paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sub cost</span>
                    <span className="tool-price" style={{ fontSize: '1.2rem' }}>{tool.price} PKR</span>
                  </div>
                  <Link to={`/tools/${tool._id}`} className="gradient-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    View Plan <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AllTools;
