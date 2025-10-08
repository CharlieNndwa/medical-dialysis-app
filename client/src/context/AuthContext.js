// FILE: src/context/AuthContext.js (FINAL CORRECTED VERSION)

import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext); // Export useAuth hook

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // This login function receives the JWT token after a successful API login/register
  const login = (token) => {
    try {
      const decodedUser = jwtDecode(token);
      // 🚨 CRITICAL FIX: Attach the raw token to the user object
      const userWithToken = { ...decodedUser, token }; 
      
      setUser(userWithToken);
      setIsAuthenticated(true);
      
      // 🚨 CRITICAL FIX: Store the token in localStorage for persistence
      localStorage.setItem('token', token); 
    } catch (error) {
      console.error('Invalid token or login payload:', error);
      logout();
    }
  };

  const logout = () => {
    // 🚨 FIX: Ensure we clear the persistent token
    localStorage.removeItem('token'); 
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token'); // Get stored token
      if (token) {
        try {
          const decodedUser = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedUser.exp < currentTime) {
            logout(); // Token expired, log out the user
          } else {
            // 🚨 CRITICAL FIX: When restoring, include the token in the user object
            const userWithToken = { ...decodedUser, token }; 
            setUser(userWithToken);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Invalid token:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []); // Run only once on component mount

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};