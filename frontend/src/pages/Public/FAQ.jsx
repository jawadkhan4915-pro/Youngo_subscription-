import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import TiltCard from '../../components/TiltCard.jsx';
import api from '../../services/api.js';
import './public.css';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  const fallbackFaqs = [
    {
      question: 'What is Youngo Subscription Sharing?',
      answer: 'Youngo allows users to access premium paid AI tools like ChatGPT Plus, Claude Pro, and Midjourney by allocating individual credits. You do not purchase complete accounts; rather, you buy credit top-ups and use the tools from our integrated dashboard playground.',
      category: 'General'
    },
    {
      question: 'How do I top up my wallet?',
      answer: 'Currently we support Manual Payments. When checking out, select Bank Transfer, EasyPaisa, or JazzCash. Transfer the exact amount to the details provided on-screen, upload a screenshot of the receipt along with the transaction ID, and click checkout. The admin verifies this receipt to add credits to your account.',
      category: 'Billing'
    },
    {
      question: 'Do my remaining credits expire?',
      answer: 'Yes, purchased credits are active for 30 days from the date the payment receipt is approved. Ensure you use them in the playground before they expire.',
      category: 'General'
    },
    {
      question: 'Is my data and chat history secure?',
      answer: 'Absolutely. We proxy requests securely to the official AI providers using our corporate accounts. We sanitize prompts and never share your individual conversation details with other users.',
      category: 'Privacy'
    }
  ];

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const res = await api.get('/blogs/faqs/all');
        if (res.data?.success && res.data.data.length > 0) {
          setFaqs(res.data.data);
        } else {
          setFaqs(fallbackFaqs);
        }
      } catch (err) {
        setFaqs(fallbackFaqs);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
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
            <Sparkles size={14} className="text-indigo-400" /> Help Center
          </span>
          <h1 className="section-title">
            Frequently Asked <span className="highlight-gradient">Questions</span>
          </h1>
          <p className="section-desc">
            Quick answers about credit allocation, manual receipt verification, and playground access.
          </p>
        </motion.div>

        {loading ? (
          <div className="catalog-loading">
            <div className="loading-spinner"></div>
            <span>Loading FAQs...</span>
          </div>
        ) : (
          <div className="faq-grid" style={{ maxWidth: '820px', margin: '0 auto' }}>
            {faqs.map((faq, idx) => (
              <TiltCard key={idx} maxTilt={4} depth={10} glare={false}>
                <div className="faq-item glass-card" style={{ marginBottom: '1.25rem', padding: '1.25rem 1.5rem' }}>
                  <button 
                    className="faq-question" 
                    onClick={() => toggleExpand(idx)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-main)',
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <HelpCircle size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                      {faq.question}
                    </span>
                    {expandedIndex === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>

                  <AnimatePresence>
                    {expandedIndex === idx && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="faq-answer"
                        style={{ overflow: 'hidden', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}
                      >
                        <p style={{ color: 'var(--text-muted)', lineHeight: '1.65', fontSize: '0.95rem' }}>
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </TiltCard>
            ))}
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
};

export default FAQ;
