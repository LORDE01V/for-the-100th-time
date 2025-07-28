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
      // Ensure user object always has full_name if available
      setUser({
        id: response.user.id,
        email: response.user.email,
        full_name: response.user.full_name || response.user.name, // Prefer full_name
        // Add other relevant fields from response.user if needed, e.g., phone_number: response.user.phone_number,
      });
    }
    return response;
  };

  // Function to handle registration, updates state and localStorage
  const register = async (userData) => {
    const response = await auth.register(userData);
    if (response.success && response.user) {
      // Ensure user object always has full_name if available
      setUser({
        id: response.user.id,
        email: response.user.email,
        full_name: response.user.full_name || response.user.name, // Prefer full_name
        // Add other relevant fields from response.user if needed
      });
    }
    return response;
  };

  // Function to handle logout, clears state and localStorage
  const logout = () => {
    auth.logout();
    setUser(null);
  };

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (currentUser) {
      // Re-set user to ensure consistency, prioritizing full_name
      setUser({
        id: currentUser.id,
        email: currentUser.email,
        full_name: currentUser.full_name || currentUser.name, // Ensure full_name is consistently set
        // Add other relevant fields if needed
      });
    } else {
      setUser(null);
    }
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