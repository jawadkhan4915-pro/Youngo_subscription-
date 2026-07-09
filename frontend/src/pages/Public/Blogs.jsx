import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import api from '../../services/api.js';
import './public.css';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackBlogs = [
    {
      _id: '1',
      title: 'Prompt Engineering Secrets for Claude 3.5 Sonnet',
      summary: 'Learn the core prompt templates to elicit high-quality code blocks and complex reasoning from Anthropic\'s Sonnet.',
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600',
      slug: 'prompt-engineering-secrets-claude-3-5',
      author: { name: 'Admin Team' },
      createdAt: '2026-06-15T00:00:00Z'
    },
    {
      _id: '2',
      title: 'Midjourney v6 vs DALL-E 3: Image Model Showdown',
      summary: 'An in-depth graphic comparison evaluating render realism, text inclusion accuracy, and detail quality between the two engines.',
      coverImage: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=600',
      slug: 'midjourney-v6-vs-dall-e-3',
      author: { name: 'Design Editor' },
      createdAt: '2026-06-20T00:00:00Z'
    }
  ];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const res = await api.get('/blogs');
        if (res.data?.success && res.data.data.length > 0) {
          setBlogs(res.data.data);
        } else {
          setBlogs(fallbackBlogs);
        }
      } catch (err) {
        setBlogs(fallbackBlogs);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>AI Subscription Blog</h1>
          <p style={{ color: 'var(--text-muted)' }}>Guides, comparisons, tutorials, and insights for maximizing AI outputs.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Loading latest updates...</div>
        ) : (
          <div className="blogs-grid">
            {blogs.map((blog) => (
              <div key={blog._id} className="glass-card blog-card">
                <img src={blog.coverImage || 'https://picsum.photos/400/200'} alt={blog.title} className="blog-image" />
                <div className="blog-body">
                  <div>
                    <h3 className="blog-title">{blog.title}</h3>
                    <p className="blog-summary">{blog.summary}</p>
                  </div>
                  <div className="blog-meta-footer">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <User size={12} /> {blog.author?.name || 'Author'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} /> {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                    <Link to={`/blogs/${blog.slug}`} style={{
                      color: 'var(--color-primary)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      Read <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Blogs;
