import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Sparkles, MessageSquare, AlertCircle, Play, Star, ArrowRight, ShieldCheck, Heart, CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
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
      // Add tool details to cart and redirect to wallet checkout
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
        fetchDetails(); // Reload reviews list
      }
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '10rem', color: 'var(--text-muted)' }}>Loading AI node profile details...</div>
        <Footer />
      </>
    );
  }

  if (!tool) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ padding: '6rem 1.5rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>Tool Profile Offline</h2>
          <p style={{ color: 'var(--text-muted)' }}>We could not find the selected AI subscription node.</p>
          <Link to="/tools" className="gradient-btn" style={{ marginTop: '1.5rem' }}>Back to library</Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* Banner */}
      <div style={{
        height: '250px',
        width: '100%',
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.4), #0f172a), url(${tool.banner || 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1200'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}></div>

      <div className="container" style={{ marginTop: '-80px', paddingBottom: '5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
          
          {/* Main Info */}
          <div>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <img src={tool.logo || 'https://picsum.photos/96'} alt={tool.name} style={{ width: '96px', height: '96px', borderRadius: 'var(--radius-lg)', objectFit: 'cover', border: '3px solid var(--bg-main)', boxShadow: 'var(--shadow-lg)' }} />
              <div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>{tool.name}</h1>
                <span style={{
                  fontSize: '0.85rem',
                  padding: '0.3rem 0.75rem',
                  background: 'rgba(79, 70, 229, 0.1)',
                  color: 'var(--color-primary)',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  border: '1px solid rgba(79, 70, 229, 0.3)'
                }}>
                  {tool.category?.name || 'Shared Subscription'}
                </span>
              </div>
            </div>

            {/* Description Card */}
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Description</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', fontSize: '1rem' }}>{tool.description}</p>
            </div>

            {/* Features & Rules */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Sparkles size={16} /> Features Included</h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {tool.features?.map((f, i) => (
                    <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
                      <span>{f}</span>
                    </li>
                  )) || <li>No custom features listed.</li>}
                </ul>
              </div>

              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertCircle size={16} /> Access Rules</h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {tool.rules?.map((r, i) => (
                    <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ width: '4px', height: '4px', background: 'var(--color-danger)', borderRadius: '50%' }}></span>
                      <span>{r}</span>
                    </li>
                  )) || <li>Follow generic system policies.</li>}
                </ul>
              </div>
            </div>

            {/* Video Tutorial */}
            {tool.tutorialUrl && (
              <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Play size={18} /> Tutorial & Usage Guide</h3>
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
            )}

            {/* Reviews Section */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Star size={18} /> Reviews ({reviews.length})</h3>

              {/* Review submit if active subscription */}
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
                  <button type="submit" className="gradient-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Submit Review</button>
                </form>
              ) : null}

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No reviews posted yet for this AI tool.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {reviews.map((rev) => (
                    <div key={rev._id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-card-hover)', overflow: 'hidden' }}>
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
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5' }}>{rev.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pricing Checkout Panel */}
          <div className="glass-card" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Subscription Plan</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Price per refil</span>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                {tool.price} PKR
              </h2>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Allocated Credits:</span>
                <strong style={{ color: 'var(--text-main)' }}>{tool.creditsPerPurchase} credits</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Daily Max Queries:</span>
                <strong style={{ color: 'var(--text-main)' }}>{tool.maxDailyLimit}</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Validity Duration:</span>
                <strong style={{ color: 'var(--text-main)' }}>30 Days</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Current Status:</span>
                <strong style={{ color: tool.status === 'Available' ? 'var(--color-success)' : 'var(--color-warning)' }}>{tool.status}</strong>
              </li>
            </ul>

            {subscription?.isSubscribed ? (
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid var(--color-success)', color: 'var(--color-success)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '1.5rem' }}>
                <ShieldCheck size={20} style={{ margin: '0 auto 0.5rem auto' }} />
                <h4 style={{ margin: 0 }}>Active Plan Unlocked</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Remaining playground credits: {subscription.remainingUserCredits}
                </p>
                <Link to="/dashboard/playground" className="gradient-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  Go to Playground
                </Link>
              </div>
            ) : (
              <button onClick={handlePurchase} className="gradient-btn" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem 1.5rem' }}>
                Purchase Access <ArrowRight size={16} />
              </button>
            )}
            
            <button style={{
              marginTop: '1rem',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              border: '1px solid var(--border-color)',
              background: 'none',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}>
              <Heart size={16} /> Add to Wishlist
            </button>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default ToolDetails;
