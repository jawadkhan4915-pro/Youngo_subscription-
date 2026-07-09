import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Load current user profile on startup
  const fetchMe = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      if (res.data?.success) {
        setUser(res.data.user);
        setWallet(res.data.wallet);
      }
    } catch (err) {
      setUser(null);
      setWallet(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  // Sync theme attribute in DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        setUser(res.data.user);
        await fetchMe(); // Fetch full wallet details
        return { success: true };
      }
      return { success: false, message: 'Invalid response' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.error || 'Login failed. Please check credentials.'
      };
    }
  };

  // Register handler
  const register = async (name, email, password, referralCode) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, referralCode });
      return { success: true, message: res.data?.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.error || 'Registration failed.'
      };
    }
  };

  // OTP Email Verification
  const verifyEmailOTP = async (email, otp) => {
    try {
      const res = await api.post('/auth/verify-email', { email, otp });
      if (res.data?.success) {
        setUser(res.data.user);
        await fetchMe();
        return { success: true };
      }
      return { success: false, message: 'OTP verification failed.' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.error || 'Verification failed.'
      };
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setWallet(null);
    }
  };

  // Update profile details
  const updateUserProfile = async (formData) => {
    try {
      const res = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data?.success) {
        setUser(res.data.user);
        return { success: true, message: 'Profile updated!' };
      }
      return { success: false };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.error || 'Failed to update profile.'
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        loading,
        theme,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'Admin',
        toggleTheme,
        login,
        register,
        verifyEmailOTP,
        logout,
        updateUserProfile,
        fetchMe
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
