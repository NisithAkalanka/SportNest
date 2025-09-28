import React, { createContext, useState, useEffect, useContext } from 'react';


export const AdminAuthContext = createContext();

// AdminAuthProvider 
export const AdminAuthProvider = ({ children }) => {
    
    // 'admin' kiyana state eken thamai login wela inna admin ge visthara
    const [admin, setAdmin] = useState(null);

    // App eka load wenakota localStorage eken 'adminInfo' 
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

    // Admin Login function 
    const loginAdmin = (adminData) => {
        // 'adminInfo' key eka yatathe localStorage eke save karanawa
        localStorage.setItem('adminInfo', JSON.stringify(adminData));
        setAdmin(adminData);
    };

    // Admin Logout function එක
    const logoutAdmin = () => {
        localStorage.removeItem('adminInfo');
        setAdmin(null);
    };

    return (
        // Provider eka haraha, admin, loginAdmin, logoutAdmin dewal child components
        <AdminAuthContext.Provider value={{ admin, loginAdmin, logoutAdmin }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

// 'useAdminAuth' kiyana custom hook 
export const useAdminAuth = () => {
    return useContext(AdminAuthContext);
};