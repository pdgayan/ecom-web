import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser]   = useState(null); // { id, username, role }
  const [token, setToken] = useState(null);

  function login(userData, tokenValue) {
    setUser(userData);
    setToken(tokenValue);
  }

  function logout() {
    setUser(null);
    setToken(null);
  }

  return (
    <AppContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
