import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/MemberAuthContext'; // ✅ useAuth hook

const MemberRoute = () => {
  const { user } = useAuth();

  // If user is logged in, render the nested route (Outlet)
  // Otherwise, redirect to login
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default MemberRoute;
