import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import AnnouncementBanner from './components/AnnouncementBanner.jsx';

// Public Pages
import Home from './pages/Public/Home.jsx';
import AllTools from './pages/Public/AllTools.jsx';
import ToolDetails from './pages/Public/ToolDetails.jsx';
import Pricing from './pages/Public/Pricing.jsx';
import Blogs from './pages/Public/Blogs.jsx';
import BlogDetails from './pages/Public/BlogDetails.jsx';
import FAQ from './pages/Public/FAQ.jsx';
import Contact from './pages/Public/Contact.jsx';
import Login from './pages/Public/Login.jsx';
import Register from './pages/Public/Register.jsx';
import ForgotResetPassword from './pages/Public/ForgotResetPassword.jsx';
import Privacy from './pages/Public/Privacy.jsx';
import Terms from './pages/Public/Terms.jsx';
import Refund from './pages/Public/Refund.jsx';

// User Dashboard Pages
import UserDashboard from './pages/User/Dashboard.jsx';
import Playground from './pages/User/Playground.jsx';
import UserWallet from './pages/User/Wallet.jsx';
import UserReferral from './pages/User/Referral.jsx';
import UserSupport from './pages/User/Support.jsx';
import UserProfile from './pages/User/Profile.jsx';

// Admin Dashboard Pages
import AdminDashboard from './pages/Admin/Dashboard.jsx';
import AdminUsers from './pages/Admin/Users.jsx';
import AdminTools from './pages/Admin/Tools.jsx';
import AdminOrders from './pages/Admin/Orders.jsx';
import AdminSupport from './pages/Admin/Support.jsx';
import AdminSettings from './pages/Admin/Settings.jsx';
import AdminLogs from './pages/Admin/Logs.jsx';

import './styles/global.css';

// Protected Route Guard (User access)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading credentials...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Admin Route Guard (Admin role only)
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Checking authorization...</div>;
  }
  
  return isAuthenticated && isAdmin ? children : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AnnouncementBanner />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/tools" element={<AllTools />} />
          <Route path="/tools/:id" element={<ToolDetails />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:slug" element={<BlogDetails />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotResetPassword />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refund" element={<Refund />} />

          {/* User Dashboard Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/playground" element={<ProtectedRoute><Playground /></ProtectedRoute>} />
          <Route path="/dashboard/wallet" element={<ProtectedRoute><UserWallet /></ProtectedRoute>} />
          <Route path="/dashboard/referral" element={<ProtectedRoute><UserReferral /></ProtectedRoute>} />
          <Route path="/dashboard/support" element={<ProtectedRoute><UserSupport /></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

          {/* Admin Dashboard Protected Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/tools" element={<AdminRoute><AdminTools /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><AdminTools /></AdminRoute>} /> {/* Combined panel */}
          <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="/admin/support" element={<AdminRoute><AdminSupport /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
          <Route path="/admin/logs" element={<AdminRoute><AdminLogs /></AdminRoute>} />

          {/* Fallback 404 Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
