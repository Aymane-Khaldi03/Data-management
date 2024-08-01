import React, { useState, useContext, createContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

const useProvideAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const loggedInUser = { email: decodedToken.user.email, role: decodedToken.user.role, fullName: decodedToken.user.fullName };
        setUser(loggedInUser);
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${apiUrl}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const decodedToken = JSON.parse(atob(data.token.split('.')[1]));
        localStorage.setItem('token', data.token);
        const loggedInUser = { email, role: decodedToken.user.role, fullName: decodedToken.user.fullName };
        setUser(loggedInUser);
        history.push('/dashboard'); // Redirect to dashboard after login
        return loggedInUser;
      } else {
        const error = await response.json();
        throw new Error(error.msg || 'Login failed');
      }
    } catch (error) {
      throw new Error('Server error: ' + error.message);
    }
  };

  const signup = async (fullName, email, password, role) => {
    try {
      const response = await fetch(`${apiUrl}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password, role }),
      });
  
      if (response.ok) {
        // Handle successful signup without setting token or user state
        const data = await response.json();
        setLoading(false);
        return data;
      } else {
        const error = await response.json();
        throw new Error(error.msg || 'Signup failed');
      }
    } catch (error) {
      setLoading(false);
      throw new Error('Server error: ' + error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    history.push('/login');
  };

  return {
    user,
    setUser,
    login,
    signup,
    logout,
    loading,
  };
};
