import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('sms_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('sms_token') || null);
  const [loading, setLoading] = useState(true);

  /**
   * User Logout
   */
  const logout = () => {
    localStorage.removeItem('sms_token');
    localStorage.removeItem('sms_user');
    setToken(null);
    setUser(null);
  };

  // Verify token on mount to ensure session validity
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('sms_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await apiRequest('/auth/me');
        if (data.success && data.user) {
          const formattedUser = {
            id: data.user._id || data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: (data.user.role || 'faculty').toLowerCase(),
            studentId: data.user.studentId || null,
          };
          setUser(formattedUser);
          localStorage.setItem('sms_user', JSON.stringify(formattedUser));
        } else {
          logout();
        }
      } catch (err) {
        // If token is invalid or expired, clear auth
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  /**
   * User Signup
   * @param {string} name 
   * @param {string} email 
   * @param {string} password 
   * @param {string} role ('faculty' | 'student')
   * @param {string} rollNumber (optional for student)
   */
  const signup = async (name, email, password, role = 'faculty', rollNumber = '') => {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        ...(rollNumber ? { rollNumber } : {})
      }),
    });

    if (data.success && data.token && data.user) {
      const formattedUser = {
        id: data.user._id || data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: (data.user.role || role).toLowerCase(),
        studentId: data.user.studentId || null,
      };
      setToken(data.token);
      setUser(formattedUser);
      localStorage.setItem('sms_token', data.token);
      localStorage.setItem('sms_user', JSON.stringify(formattedUser));
    }
    return data;
  };

  /**
   * User Login
   * @param {string} email 
   * @param {string} password 
   * @param {string} role ('faculty' | 'student')
   */
  const login = async (email, password, role = 'faculty') => {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });

    if (data.success && data.token && data.user) {
      const formattedUser = {
        id: data.user._id || data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: (data.user.role || role).toLowerCase(),
        studentId: data.user.studentId || null,
      };
      setToken(data.token);
      setUser(formattedUser);
      localStorage.setItem('sms_token', data.token);
      localStorage.setItem('sms_user', JSON.stringify(formattedUser));
    }
    return data;
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
