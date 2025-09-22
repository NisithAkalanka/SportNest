import React, { useContext } from 'react';
// ★★★ අනවශ්‍ය import පේළි ඉවත් කර, එක පේළියකට ගෙන එන ලදී ★★★
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'; 

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faBoxOpen, faUsers, faTachometerAlt, faStore } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { AdminAuthContext } from '@/context/AdminAuthContext'; // alias path එක වඩාත් හොඳයි

const AdminLayout = () => {
  const navigate = useNavigate();
  const { logoutAdmin } = useContext(AdminAuthContext);

  const handleLogout = () => {
    logoutAdmin(); 
    navigate('/admin-login');
  };

  const activeLinkStyle = { backgroundColor: '#FF6700' };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 text-white p-5 flex flex-col" style={{ backgroundColor: '#0D1B2A' }}>
        <h1 className="text-2xl font-bold mb-10 text-center">SportNest Admin</h1>
        <nav className="flex-grow">
          <ul>
            <li className="mb-4">
              {/* a href වෙනුවට, React Router එකේ <Link> භාවිතා කිරීම */}
              <Link to="/shop" className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors">
                <FontAwesomeIcon icon={faStore} className="mr-3 w-5" />
                View Shop
              </Link>
            </li>

            <hr className="my-2 border-gray-600" />

            <li className="mb-4">
              <NavLink
                to="/admin-dashboard"
                end
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                className="flex items-center p-3 rounded-lg hover:bg-gray-700"
              >
                <FontAwesomeIcon icon={faTachometerAlt} className="mr-3 w-5" /> Dashboard
              </NavLink>
            </li>

            <li className="mb-4">
              <NavLink
                to="/admin-dashboard/inventory"
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                className="flex items-center p-3 rounded-lg hover:bg-gray-700"
              >
                <FontAwesomeIcon icon={faBoxOpen} className="mr-3 w-5" /> Inventory
              </NavLink>
            </li>

            <li className="mb-4">
              <NavLink
                to="/admin-dashboard/suppliers"
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                className="flex items-center p-3 rounded-lg hover:bg-gray-700"
              >
                <FontAwesomeIcon icon={faUsers} className="mr-3 w-5" /> Suppliers
              </NavLink>
            </li>

            {/* ★ NEW: Events Management (Approvals) – append only */}
            <li className="mb-4">
              <NavLink
                to="/admin-dashboard/events/moderate"
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
                className="flex items-center p-3 rounded-lg hover:bg-gray-700"
              >
                <span className="mr-3 w-5 text-center">📅</span> Events Management
              </NavLink>
            </li>
          </ul>
        </nav>

        <Button onClick={handleLogout} className="mt-auto w-full" style={{ backgroundColor: '#FF6700' }}>
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
          Logout
        </Button>
      </aside>

      <main className="flex-1 p-10 overflow-auto bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
