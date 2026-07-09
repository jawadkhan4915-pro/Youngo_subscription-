import React, { useEffect, useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import api from '../../services/api.js';
import './public.css';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fallback default FAQs if database is empty
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
    <>
      <Navbar />
      <div className="container" style={{ padding: '4rem 1.5rem', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>Frequently Asked Questions</h1>
          <p style={{ color: 'var(--text-muted)' }}>Quick answers to questions about credit allocation, payments, and playground features.</p>
        </div>

        <div className="faq-grid">
          {faqs.map((faq, idx) => (
            <div key={idx} className="faq-item glass-card">
              <button className="faq-question" onClick={() => toggleExpand(idx)}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <HelpCircle size={18} style={{ color: 'var(--color-primary)' }} />
                  {faq.question}
                </span>
                {expandedIndex === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {expandedIndex === idx && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FAQ;
