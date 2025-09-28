// frontend/src/context/MemberAuthContext.jsx (FINAL MERGED)

import React, { createContext, useState, useEffect, useContext } from 'react';

// Always export the same name for consistency
export const AuthContext = createContext();

export const MemberAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('userInfo');
      if (raw) {
        const parsed = JSON.parse(raw);
        setUser(parsed);
        // Mirror token separately for contexts/utilities that read `token` directly
        if (parsed?.token) {
          localStorage.setItem('token', parsed.token);
        }
      }
    } catch (e) {
      console.warn('Invalid userInfo in localStorage:', e);
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
    }
  }, []);

  // ✅ Unified login function (clear old, save new, update state, mirror token)
  const login = (userData) => {
    // 1) Clear old
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');

    // 2) Save fresh
    localStorage.setItem('userInfo', JSON.stringify(userData));
    if (userData?.token) {
      localStorage.setItem('token', userData.token);
    }

    // 3) Update context state
    setUser(userData);
  };

  // ✅ Unified logout (clear both keys)
  const logout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easier usage
export const useAuth = () => useContext(AuthContext);
