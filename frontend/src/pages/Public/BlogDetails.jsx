import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import api from '../../services/api.js';
import './public.css';

const BlogDetails = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fallback content details if database is empty
  const fallbackBlog = {
    title: 'Prompt Engineering Secrets for Claude 3.5 Sonnet',
    summary: 'Learn the core prompt templates to elicit high-quality code blocks and complex reasoning from Anthropic\'s Sonnet.',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200',
    content: `
      <p>Claude 3.5 Sonnet by Anthropic is currently one of the most powerful LLMs on the market, especially for logical reasoning and programming tasks. However, to extract the maximum capability from Sonnet, your prompts must be highly structured.</p>
      
      <h3>1. Use XML Tags to Separate System Variables</h3>
      <p>Claude is specifically optimized to read variables enclosed in XML tags. This allows the model to differentiate context from queries. Here is an example layout:</p>
      <pre style="background:var(--bg-main); padding:1rem; border-radius:8px; border:1px solid var(--border-color); overflow-x:auto;">
&lt;instruction&gt;
Optimize the following database code block for high query volumes.
&lt;/instruction&gt;

&lt;code&gt;
const users = await User.find({ status: 'Active' });
&lt;/code&gt;</pre>

      <h3>2. Prompting Code Editors</h3>
      <p>When prompting AI-integrated editors like Cursor or Copilot that leverage Claude 3.5: focus on specifying clear, narrow parameters. Always ask for isolated modules rather than full file edits to avoid accidental variable collisions.</p>

      <h3>3. Conclusion</h3>
      <p>By splitting context variables and formatting instructions inside tags, Claude Sonnet responds with highly accurate solutions. Test these tips in the Youngo playground today!</p>
    `,
    author: { name: 'Admin Team', avatar: 'https://picsum.photos/40' },
    createdAt: '2026-06-15T00:00:00Z'
  };

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/blogs/slug/${slug}`);
        if (res.data?.success) {
          setBlog(res.data.data);
        } else {
          setBlog(fallbackBlog);
        }
      } catch (err) {
        setBlog(fallbackBlog);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '10rem', color: 'var(--text-muted)' }}>Loading article contents...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '80vh' }}>
        <Link to="/blogs" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--text-muted)',
          marginBottom: '2rem',
          fontSize: '0.95rem'
        }}>
          <ArrowLeft size={16} /> Back to blogs
        </Link>

        {blog && (
          <article>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>{blog.title}</h1>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2rem',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              marginBottom: '2.5rem',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '1.5rem'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={14} /> By {blog.author?.name}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={14} /> Published on {new Date(blog.createdAt).toLocaleDateString()}
              </span>
            </div>

            <img
              src={blog.coverImage || 'https://picsum.photos/800/400'}
              alt={blog.title}
              style={{
                width: '100%',
                maxHeight: '450px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '3rem',
                border: '1px solid var(--border-color)'
              }}
            />

            <div
              className="blog-content-body"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </article>
        )}
      </div>
      <Footer />
    </>
  );
};

export default BlogDetails;
