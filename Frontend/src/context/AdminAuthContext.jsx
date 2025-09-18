import React, { createContext, useState, useEffect, useContext } from 'react';

// Admin ට වෙන්වූ, 'AdminAuthContext' නමින් අලුත් context එකක් නිර්මාණය කරනවා
export const AdminAuthContext = createContext();

// AdminAuthProvider නමින් component එක හදනවා
export const AdminAuthProvider = ({ children }) => {
    
    // 'admin' කියන state එකෙන් තමයි login වෙලා ඉන්න admin ගේ විස්තර තියාගන්නේ
    const [admin, setAdmin] = useState(null);

    // App එක load වෙනකොට localStorage එකෙන් 'adminInfo' තියෙනවද බලනවා
    useEffect(() => {
        try {
            const adminInfo = localStorage.getItem('adminInfo');
            if (adminInfo) {
                setAdmin(JSON.parse(adminInfo));
            }
        } catch (error) {
            console.error("Failed to parse admin info from localStorage", error);
            localStorage.removeItem('adminInfo');
        }
    }, []);

    // Admin Login function එක
    const loginAdmin = (adminData) => {
        // 'adminInfo' key එක යටතේ localStorage එකේ save කරනවා
        localStorage.setItem('adminInfo', JSON.stringify(adminData));
        setAdmin(adminData);
    };

    // Admin Logout function එක
    const logoutAdmin = () => {
        localStorage.removeItem('adminInfo');
        setAdmin(null);
    };

    return (
        // Provider එක හරහා, admin, loginAdmin, logoutAdmin දේවල් child components වලට දෙනවා
        <AdminAuthContext.Provider value={{ admin, loginAdmin, logoutAdmin }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

// 'useAdminAuth' කියන custom hook එක
export const useAdminAuth = () => {
    return useContext(AdminAuthContext);
};