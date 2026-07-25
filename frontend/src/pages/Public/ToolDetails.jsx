import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { Sparkles, MessageSquare, AlertCircle, Play, Star, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import TiltCard from '../../components/TiltCard.jsx';
import api from '../../services/api.js';
import './public.css';

const ToolDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [tool, setTool] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tools/${id}`);
      if (res.data?.success) {
        setTool(res.data.data);
        setReviews(res.data.reviews || []);
        setSubscription(res.data.subscription || null);
      }
    } catch (err) {
      console.error('Failed to load tool details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handlePurchase = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(`/dashboard/wallet?action=checkout&toolId=${tool._id}`);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);

    try {
      const res = await api.post('/tools/reviews', { toolId: tool._id, rating, comment });
      if (res.data?.success) {
        setReviewSuccess(true);
        setComment('');
        fetchDetails();
      }
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="landing-wrapper">
        <Navbar />
        <div className="catalog-loading" style={{ minHeight: '60vh', justifyContent: 'center' }}>
          <div className="loading-spinner"></div>
          <span>Loading AI node profile details...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="landing-wrapper">
        <Navbar />
        <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center', minHeight: '60vh' }}>
          <h2 style={{ marginBottom: '1rem' }}>Tool Profile Offline</h2>
          <p style={{ color: 'var(--text-muted)' }}>We could not find the selected AI subscription node.</p>
          <Link to="/tools" className="gradient-btn" style={{ marginTop: '1.5rem' }}>Back to library</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="landing-wrapper">
      <Navbar />

      <div className="hero-mesh-bg" />
      <div className="hero-grid-overlay" />

      {/* Banner */}
      <div style={{
        height: '250px',
        width: '100%',
        backgroundImage: `linear-gradient(rgba(7, 10, 18, 0.4), #070a12), url(${tool.banner || 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1200'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        zIndex: 2
      }}></div>

      <div className="container" style={{ marginTop: '-80px', paddingBottom: '6rem', position: 'relative', zIndex: 5 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
          
          {/* Main Info */}
          <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <img src={tool.logo || 'https://picsum.photos/96'} alt={tool.name} style={{ width: '96px', height: '96px', borderRadius: 'var(--radius-lg)', objectFit: 'cover', border: '3px solid var(--bg-main)', boxShadow: 'var(--shadow-lg)' }} />
              <div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.35rem', color: 'var(--text-main)' }}>{tool.name}</h1>
                <span className="tool-cat-badge" style={{ fontSize: '0.85rem', padding: '0.3rem 0.85rem' }}>
                  {tool.category?.name || 'Shared Subscription'}
                </span>
              </div>
            </div>

            {/* Description Card */}
            <TiltCard maxTilt={4} depth={10} glare={false}>
              <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem', fontSize: '1.25rem' }}>Description</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '1rem' }}>{tool.description}</p>
              </div>
            </TiltCard>

            {/* Features & Rules Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <TiltCard maxTilt={6} depth={12}>
                <div className="glass-card" style={{ padding: '1.75rem', height: '100%' }}>
                  <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                    <Sparkles size={18} className="text-indigo-400" /> Features Included
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.92rem', color: 'var(--text-muted)' }}>
                    {tool.features?.map((f, i) => (
                      <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <CheckCircle2 size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                        <span>{f}</span>
                      </li>
                    )) || <li>No custom features listed.</li>}
                  </ul>
                </div>
              </TiltCard>

              <TiltCard maxTilt={6} depth={12}>
                <div className="glass-card" style={{ padding: '1.75rem', height: '100%' }}>
                  <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                    <AlertCircle size={18} style={{ color: 'var(--color-warning)' }} /> Access Rules
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.92rem', color: 'var(--text-muted)' }}>
                    {tool.rules?.map((r, i) => (
                      <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ width: '6px', height: '6px', background: 'var(--color-danger)', borderRadius: '50%', flexShrink: 0 }}></span>
                        <span>{r}</span>
                      </li>
                    )) || <li>Follow generic system policies.</li>}
                  </ul>
                </div>
              </TiltCard>
            </div>

            {/* Video Tutorial */}
            {tool.tutorialUrl && (
              <TiltCard maxTilt={4} depth={10} glare={false}>
                <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                  <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                    <Play size={18} className="text-indigo-400" /> Tutorial & Usage Guide
                  </h3>
                  <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <iframe
                      title="Tool tutorial"
                      src={tool.tutorialUrl.replace('watch?v=', 'embed/')}
                      frameBorder="0"
                      allowFullScreen
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    />
                  </div>
                </div>
              </TiltCard>
            )}

            {/* Reviews Section */}
            <TiltCard maxTilt={4} depth={10} glare={false}>
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                  <Star size={18} style={{ color: 'var(--color-warning)' }} /> Reviews ({reviews.length})
                </h3>

                {subscription?.isSubscribed ? (
                  <form onSubmit={handleReviewSubmit} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                    <h4 style={{ marginBottom: '0.75rem' }}>Write a Review</h4>
                    
                    {reviewError && <p style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{reviewError}</p>}
                    {reviewSuccess && <p style={{ color: 'var(--color-success)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Review submitted!</p>}

                    <div className="form-group">
                      <label className="form-label">Rating</label>
                      <select className="form-input" value={rating} onChange={(e) => setRating(e.target.value)}>
                        <option value={5}>5 Stars - Excellent</option>
                        <option value={4}>4 Stars - Great</option>
                        <option value={3}>3 Stars - Average</option>
                        <option value={2}>2 Stars - Poor</option>
                        <option value={1}>1 Star - Horrible</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Comment</label>
                      <textarea
                        className="form-input"
                        rows={3}
                        placeholder="Share your experience using this shared tool..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="gradient-btn" style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}>Submit Review</button>
                  </form>
                ) : null}

                {reviews.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>No reviews posted yet for this AI tool.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {reviews.map((rev) => (
                      <div key={rev._id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-card-hover)', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={rev.user?.avatar || 'https://picsum.photos/40'} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <strong style={{ fontSize: '0.95rem' }}>{rev.user?.name}</strong>
                            <span style={{ display: 'flex', color: 'var(--color-warning)' }}>
                              {Array.from({ length: rev.rating }).map((_, i) => (
                                <Star key={i} size={14} fill="currentColor" />
                              ))}
                            </span>
                          </div>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>{rev.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TiltCard>
          </motion.div>

          {/* Pricing Checkout Panel */}
          <motion.div initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <TiltCard maxTilt={5} depth={12}>
              <div className="glass-card" style={{ padding: '2.25rem', position: 'sticky', top: '100px' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.3rem' }}>Subscription Plan</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Purchase Price:</span>
                    <strong style={{ fontSize: '1.75rem', color: 'var(--text-main)' }}>{tool.price} PKR</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Credits Granted:</span>
                    <strong style={{ color: 'var(--color-primary)' }}>{tool.creditsPerPurchase} Credits</strong>
                  </div>
                </div>

                <button
                  onClick={handlePurchase}
                  className="gradient-btn"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem' }}
                >
                  {subscription?.isSubscribed ? 'Topup Credits' : 'Unlock Tool Access'} <ArrowRight size={17} />
                </button>
              </div>
            </TiltCard>
          </motion.div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ToolDetails;
