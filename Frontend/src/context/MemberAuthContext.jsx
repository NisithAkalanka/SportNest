import React, { createContext, useState, useEffect, useContext } from 'react';

// ★★★ වැදගත්ම වෙනස: export කරන නම, පරණ විදිහටම 'AuthContext' ලෙස තබනවා ★★★
export const AuthContext = createContext();

// File එකේ නම 'MemberAuthProvider' වුණාට කමක් නැහැ
export const MemberAuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
            setUser(userInfo);
        }
    }, []);

    const login = (userData) => {
        // අලුතින් login වෙන්න කලින්, පරණ member session එකක් තියෙනවා නම් clear කරනවා
        // Admin session එකට මේක බලපාන්නේ නැහැ
        localStorage.removeItem('userInfo');
        
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    return (
        // ★★★ මෙතනත් 'AuthContext' පාවිච්චි කරනවා ★★★
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 'useAuth' custom hook එක එලෙසම තියෙනවා
export const useAuth = () => {
    return useContext(AuthContext);
};