import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    return userInfo ? children : <Navigate to="/login" replace />;
};
export default ProtectedRoute;