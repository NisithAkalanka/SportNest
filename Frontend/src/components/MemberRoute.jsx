import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const MemberRoute = () => {
  // ★★★ මේ file එක, කලින් වගේම 'userInfo' key එක පරීක්ෂා කරනවා ★★★
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // userInfo තියෙනවා නම් විතරයි, ඊළඟ පිටුවට යන්න දෙන්නේ
  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};
export default MemberRoute;