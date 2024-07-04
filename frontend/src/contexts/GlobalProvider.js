import React, { createContext, useState } from 'react';

export const GlobalContext = createContext();

const GlobalProvider = ({ children }) => {
  const [user, setUser] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const [auth, setAuth] = useState({
    isAuthenticated: false,
    loading: true,
    token: null,
  });

  const login = (userData) => {
    setAuth({
      ...auth,
      isAuthenticated: true,
      loading: false,
      token: 'dummy-token',
    });
    setUser(userData);
  };

  const logout = () => {
    setAuth({
      ...auth,
      isAuthenticated: false,
      loading: false,
      token: null,
    });
    setUser({
      fullName: '',
      email: '',
      password: '',
    });
  };

  return (
    <GlobalContext.Provider value={{ user, auth, login, logout }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;