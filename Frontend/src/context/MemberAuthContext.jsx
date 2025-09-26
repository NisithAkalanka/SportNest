import React, { createContext, useState, useEffect, useContext } from 'react';

// Context එකේ නම 'AuthContext' ලෙසම පවතී
export const AuthContext = createContext();

export const MemberAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
            setUser(userInfo);
        }
    }, []);

    const login = (userData) => {
        localStorage.removeItem('userInfo');
        localStorage.setItem('userInfo', JSON.stringify(userData));
        // Also store token separately for cart context compatibility
        if (userData.token) {
            localStorage.setItem('token', userData.token);
        }
        setUser(userData);
    };

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

export const useAuth = () => {
    return useContext(AuthContext);
};