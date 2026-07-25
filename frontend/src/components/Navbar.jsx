import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { Sun, Moon, LogOut, LayoutDashboard, Bell, User, Menu, X, Sparkles } from 'lucide-react';
import LanguageTranslator from './LanguageTranslator.jsx';
import api from '../services/api.js';
import './components.css';

const Navbar = () => {
  const { user, isAuthenticated, logout, theme, toggleTheme, isAdmin } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Load unread notifications count
  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/settings/notifications');
          if (res.data?.success) {
            const unread = res.data.data.filter(n => !n.isRead).length;
            setUnreadNotifications(unread);
          }
        } catch (err) {
          console.error('Failed to load notifications count', err);
        }
      };

      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Check every 30s

      const handleNotificationsRead = () => setUnreadNotifications(0);
      window.addEventListener('notifications-marked-read', handleNotificationsRead);

      return () => {
        clearInterval(interval);
        window.removeEventListener('notifications-marked-read', handleNotificationsRead);
      };
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/tools', label: 'AI Tools' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/blogs', label: 'Blog' },
    { path: '/faq', label: 'FAQs' },
    { path: '/contact', label: 'Contact' },
  ];

  // Motion variants for brand text reveal
  const brandLetters = "Youngo".split("");

  const brandContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 }
    }
  };

  const brandLetterVariants = {
    hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.4, ease: 'easeOut' } }
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.15 + i * 0.05, duration: 0.4 }
    })
  };

  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="main-navbar"
    >
      {/* Brand with typography letter reveal */}
      <Link to="/" className="nav-brand">
        <motion.div
          initial={{ rotate: -15, scale: 0.8, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'inline-flex' }}
        >
          <Sparkles size={24} style={{ stroke: 'url(#brand-grad)' }} />
        </motion.div>

        <motion.div 
          variants={brandContainerVariants}
          initial="hidden"
          animate="visible"
          className="brand-text-reveal"
        >
          {brandLetters.map((char, index) => (
            <motion.span key={index} variants={brandLetterVariants}>
              {char}
            </motion.span>
          ))}
        </motion.div>

        {/* SVG Gradient definition for brand icon */}
        <svg width="0" height="0">
          <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-accent)" />
          </linearGradient>
        </svg>
      </Link>

      {/* Public links with reveal animation */}
      <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
        {navLinks.map((item, i) => (
          <motion.div custom={i} variants={navItemVariants} initial="hidden" animate="visible" key={item.path}>
            <NavLink to={item.path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              {item.label}
            </NavLink>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="nav-actions"
      >
        <LanguageTranslator />
        <button onClick={toggleTheme} className="theme-toggle" title="Toggle Theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {isAuthenticated ? (
          <>
            <Link to={isAdmin ? "/admin" : "/dashboard"} className="theme-toggle" title="Go to Dashboard">
              <LayoutDashboard size={20} />
            </Link>
            <Link to={isAdmin ? "/admin/settings" : "/dashboard/notifications"} className="theme-toggle" style={{ position: 'relative' }}>
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: 'var(--color-danger)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadNotifications}
                </span>
              )}
            </Link>
            <div className="avatar-btn" onClick={() => navigate(isAdmin ? '/admin' : '/dashboard/profile')}>
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" />
              ) : (
                <User size={20} style={{ color: 'var(--text-muted)' }} />
              )}
            </div>
            <button onClick={handleLogout} className="theme-toggle" title="Logout">
              <LogOut size={20} style={{ color: 'var(--color-danger)' }} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 500 }}>Login</Link>
            <Link to="/register" className="gradient-btn" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>Sign Up</Link>
          </>
        )}

        <button className="theme-toggle" style={{ display: 'none' }} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;
