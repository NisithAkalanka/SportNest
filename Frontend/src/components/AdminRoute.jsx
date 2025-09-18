import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  // ★★★ වැදගත්ම වෙනස: 'adminInfo' key එක පරීක්ෂා කිරීම ★★★
  const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));

  // Admin කෙනෙක් login වෙලාද සහ එයාගේ role එක 'admin' ද කියලා බලනවා
  if (adminInfo && adminInfo.role === 'admin') {
    // ඔව් නම්, Admin Dashboard පිටු වලට යන්න දෙනවා
    return <Outlet />;
  } else {
    // නැත්නම්, Admin login පිටුවටම හරවා යවනවා
    return <Navigate to="/admin-login" replace />;
  }
};
export default AdminRoute;