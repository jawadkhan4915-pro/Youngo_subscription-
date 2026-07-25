import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Sparkles, SlidersHorizontal, ArrowRight, ChevronRight } from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import TiltCard from '../../components/TiltCard.jsx';
import api from '../../services/api.js';
import './public.css';

const AllTools = () => {
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const catRes = await api.get('/tools/categories');
        if (catRes.data?.success) {
          setCategories(catRes.data.data);
        }

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

  const filteredTools = tools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) || 
                          tool.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || tool.category?._id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="landing-wrapper">
      <Navbar />

      <div className="hero-mesh-bg" />
      <div className="hero-grid-overlay" />

      <div className="container" style={{ padding: '4rem 1.5rem 6rem 1.5rem', minHeight: '80vh', position: 'relative', zIndex: 5 }}>
        
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <span className="hero-badge">
            <Sparkles size={14} className="text-indigo-400" /> Unified Catalog
          </span>
          <h1 className="section-title">
            AI Subscription <span className="highlight-gradient">Library</span>
          </h1>
          <p className="section-desc">
            Unlock access to leading conversational, code, image, and voice models with wallet credits.
          </p>
        </motion.div>

        {/* Filter Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="glass-card" 
          style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}
        >
          <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', flex: 1, paddingBottom: '0.25rem' }}>
            <button
              onClick={() => setSelectedCategory('')}
              className="glass-btn"
              style={{
                background: selectedCategory === '' ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'rgba(99, 102, 241, 0.06)',
                color: selectedCategory === '' ? '#fff' : 'var(--text-muted)',
                borderColor: selectedCategory === '' ? 'transparent' : 'var(--border-color)',
                padding: '0.55rem 1.25rem',
                fontSize: '0.88rem'
              }}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className="glass-btn"
                style={{
                  background: selectedCategory === cat._id ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'rgba(99, 102, 241, 0.06)',
                  color: selectedCategory === cat._id ? '#fff' : 'var(--text-muted)',
                  borderColor: selectedCategory === cat._id ? 'transparent' : 'var(--border-color)',
                  padding: '0.55rem 1.25rem',
                  fontSize: '0.88rem'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <input
              type="text"
              placeholder="Search AI Tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </motion.div>

        {/* Tools Catalog 3D Grid */}
        {loading ? (
          <div className="catalog-loading">
            <div className="loading-spinner"></div>
            <span>Loading AI Library...</span>
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <h3>No AI Tools Matched</h3>
            <p style={{ marginTop: '0.5rem' }}>Try clearing your category filter or search query.</p>
          </div>
        ) : (
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="tools-grid"
          >
            {filteredTools.map((tool) => (
              <TiltCard key={tool._id} maxTilt={10} depth={20} className="tool-card-wrapper">
                <div className="glass-card tool-card">
                  <div className="tool-card-top">
                    <img src={tool.logo || 'https://picsum.photos/48'} alt={tool.name} className="tool-logo" />
                    <div className="tool-meta">
                      <h3 className="tool-name">{tool.name}</h3>
                      <span className="tool-cat-badge">{tool.category?.name || 'AI Assistant'}</span>
                    </div>
                  </div>
                  <p className="tool-desc">{tool.description}</p>
                  <div className="tool-card-bottom">
                    <div className="tool-price-tag">
                      <span className="price-num">{tool.price} PKR</span>
                      <span className="price-unit">/ {tool.creditsPerPurchase} cr</span>
                    </div>
                    <Link to={`/tools/${tool._id}`} className="tool-link-btn">
                      <span>Details</span>
                      <ChevronRight size={15} />
                    </Link>
                  </div>
                </div>
              </TiltCard>
            ))}
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AllTools;
