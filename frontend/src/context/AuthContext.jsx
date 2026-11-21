import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, notificationAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('remotejob_token') || null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Fetch current user on mount or token change
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
          // fetch unread count
          try {
            const notifRes = await notificationAPI.getNotifications();
            setUnreadNotifications(notifRes.data.unread_count || 0);
          } catch (e) {
            console.warn("Could not fetch notifications", e);
          }
        } catch (err) {
          console.error("Auth fetch failed:", err);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login(email, password);
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('remotejob_token', newToken);
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Invalid email or password'
      };
    }
  };

  const register = async (formData) => {
    try {
      const res = await authAPI.register(formData);
      const { token: newToken, user: userData } = res.data;
      localStorage.setItem('remotejob_token', newToken);
      setToken(newToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      const errData = err.response?.data;
      const msg = typeof errData === 'object' ? Object.values(errData).flat().join(' ') : 'Registration failed.';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('remotejob_token');
    setToken(null);
    setUser(null);
  };

  // Quick 1-click Demo accounts for easy reviewer evaluation
  const demoLogin = async (role) => {
    let email = 'candidate@demo.com';
    if (role === 'recruiter') email = 'recruiter@demo.com';
    if (role === 'admin') email = 'admin@demo.com';

    return await login(email, 'password123');
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await authAPI.getMe();
        setUser(res.data);
      } catch (err) {
        console.error("Refresh user failed", err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      unreadNotifications,
      setUnreadNotifications,
      login,
      register,
      logout,
      demoLogin,
      refreshUser,
      isAuthenticated: !!user,
      isCandidate: user?.role === 'candidate',
      isRecruiter: user?.role === 'recruiter',
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
