import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard,
  Sparkles,
  Wallet,
  ShoppingBag,
  Users,
  HelpCircle,
  Settings,
  Cpu,
  CreditCard,
  Tag,
  MessageSquare,
  Megaphone,
  FileText,
  ShieldAlert,
  FolderTree
} from 'lucide-react';
import './components.css';

const Sidebar = ({ isAdminPanel = false }) => {
  const { logout, user } = useAuth();

  const userLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/dashboard/playground', label: 'AI Playground', icon: <Sparkles size={18} /> },
    { to: '/dashboard/wallet', label: 'My Wallet', icon: <Wallet size={18} /> },
    { to: '/dashboard/purchases', label: 'My Purchases', icon: <ShoppingBag size={18} /> },
    { to: '/dashboard/referral', label: 'Refer & Earn', icon: <Users size={18} /> },
    { to: '/dashboard/support', label: 'Support Center', icon: <HelpCircle size={18} /> },
    { to: '/dashboard/profile', label: 'Settings', icon: <Settings size={18} /> }
  ];

  const adminLinks = [
    { to: '/admin', label: 'Analytics', icon: <LayoutDashboard size={18} /> },
    { to: '/admin/users', label: 'Users Manager', icon: <Users size={18} /> },
    { to: '/admin/tools', label: 'AI Tools', icon: <Cpu size={18} /> },
    { to: '/admin/categories', label: 'Categories', icon: <FolderTree size={18} /> },
    { to: '/admin/orders', label: 'Orders & Payments', icon: <CreditCard size={18} /> },
    { to: '/admin/coupons', label: 'Coupons', icon: <Tag size={18} /> },
    { to: '/admin/support', label: 'Support Tickets', icon: <MessageSquare size={18} /> },
    { to: '/admin/announcements', label: 'Announcements', icon: <Megaphone size={18} /> },
    { to: '/admin/blogs', label: 'Blogs & FAQs', icon: <FileText size={18} /> },
    { to: '/admin/logs', label: 'Audit Logs', icon: <ShieldAlert size={18} /> },
    { to: '/admin/settings', label: 'System Settings', icon: <Settings size={18} /> }
  ];

  const links = isAdminPanel ? adminLinks : userLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-menu">
        <div style={{ padding: '0 1rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
            {isAdminPanel ? 'Admin Workspace' : 'User Workspace'}
          </span>
          <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-main)' }}>
            {user?.name}
          </span>
        </div>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-footer">
        <button
          onClick={logout}
          className="sidebar-link"
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}
        >
          <HelpCircle size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
