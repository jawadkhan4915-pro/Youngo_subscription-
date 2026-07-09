import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Sun, Moon, LogOut, LayoutDashboard, Bell, User, Menu, X, Sparkles } from 'lucide-react';
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
      const interval = setInterval(fetchNotifications, 60000); // Check every 60s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="main-navbar">
      <Link to="/" className="nav-brand">
        <Sparkles size={24} style={{ stroke: 'url(#brand-grad)' }} />
        <span>Youngo</span>
        {/* SVG Gradient definition for brand icon */}
        <svg width="0" height="0">
          <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </svg>
      </Link>

      {/* Public links */}
      <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Home</NavLink>
        <NavLink to="/tools" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>AI Tools</NavLink>
        <NavLink to="/pricing" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Pricing</NavLink>
        <NavLink to="/blogs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Blog</NavLink>
        <NavLink to="/faq" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>FAQs</NavLink>
        <NavLink to="/contact" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>Contact</NavLink>
      </div>

      <div className="nav-actions">
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
                  align-items: 'center',
                  justify-content: 'center'
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

        <button className="theme-toggle" style={{ display: 'none' /* Handled by mobile responsive query */ }} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
