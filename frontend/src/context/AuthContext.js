import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { auth } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(auth.getCurrentUser()); // Initialize from localStorage

  // Function to handle login, updates state and localStorage
  const login = async (email, password) => {
    const response = await auth.login(email, password);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return response;
  };

  // Function to handle registration, updates state and localStorage
  const register = async (userData) => {
    const response = await auth.register(userData);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return response;
  };

  // Function to handle logout, clears state and localStorage
  const logout = () => {
    auth.logout();
    setUser(null);
  };

  useEffect(() => {
    // Re-check user from localStorage on mount (e.g., on page refresh)
    setUser(auth.getCurrentUser());
  }, []);

  const value = { user, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Add propTypes validation for children
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 