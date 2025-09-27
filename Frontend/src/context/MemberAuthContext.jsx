// frontend/src/context/MemberAuthContext.jsx (FINAL MERGED)

import React, { createContext, useState, useEffect, useContext } from 'react';

// Always export the same name for consistency
export const AuthContext = createContext();

export const MemberAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) {
      setUser(userInfo);
    }
  }, []);

  // ✅ Updated login function (clear old, save new, update state)
  const login = (userData) => {
    // 1. Remove old session data
    localStorage.removeItem('userInfo');

    // 2. Save fresh, full user data
    localStorage.setItem('userInfo', JSON.stringify(userData));

    // 3. Update context state
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easier usage
export const useAuth = () => {
  return useContext(AuthContext);
};
