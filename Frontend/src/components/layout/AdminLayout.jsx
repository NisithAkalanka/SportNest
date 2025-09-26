import React, { useContext } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'; 

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSignOutAlt, faBoxOpen, faUsers, faTachometerAlt, faStore, 
  faCalendarCheck, faFileInvoiceDollar, faUserTie, faCommentDots, faClipboardList
} from '@fortawesome/free-solid-svg-icons';

import { Button } from '@/components/ui/button';
import { AdminAuthContext } from '@/context/AdminAuthContext';

const itemClass = ({ isActive }) =>
  `flex items-center p-3 rounded-lg border-l-4 transition-colors ${
    isActive
      ? 'bg-emerald-600 border-emerald-500 text-white'
      : 'border-transparent text-white/90 hover:bg-white/10'
  }`;

const AdminLayout = () => {
  const navigate = useNavigate();
  const { logoutAdmin } = useContext(AdminAuthContext);

  const handleLogout = () => {
    if (logoutAdmin) logoutAdmin();
    navigate('/admin-login');
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 text-white p-5 flex flex-col flex-shrink-0 bg-[#0D1B2A] border-r border-white/10">
        <h1 className="text-2xl font-bold mb-10 text-center">SportNest Admin</h1>
        <nav className="flex-grow">
          <ul>
            {/* Quick link to public shop */}
            <li className="mb-2">
              <NavLink to="/shop" className={itemClass}>
                <FontAwesomeIcon icon={faStore} className="mr-3 w-5" /> View Shop
              </NavLink>
            </li>

            <hr className="my-2 border-white/10" />

            <li className="mb-2">
              <NavLink to="/admin-dashboard" end className={itemClass}>
                <FontAwesomeIcon icon={faTachometerAlt} className="mr-3 w-5" /> Dashboard
              </NavLink>
            </li>

            <li className="mb-2">
              <NavLink to="/admin-dashboard/inventory" className={itemClass}>
                <FontAwesomeIcon icon={faBoxOpen} className="mr-3 w-5" /> Inventory
              </NavLink>
            </li>

            <li className="mb-2">
              <NavLink to="/admin-dashboard/preorders" className={itemClass}>
                <FontAwesomeIcon icon={faClipboardList} className="mr-3 w-5" /> Pre-orders
              </NavLink>
            </li>

            <li className="mb-2">
              <NavLink to="/admin-dashboard/suppliers" className={itemClass}>
                <FontAwesomeIcon icon={faUsers} className="mr-3 w-5" /> Suppliers
              </NavLink>
            </li>

            {/* Events Management */}
            <li className="mb-2">
              <NavLink to="/admin-dashboard/events/moderate" className={itemClass}>
                <span className="mr-3 w-5 text-center">📅</span> Events Management
              </NavLink>
            </li>

            <hr className="my-2 border-white/10" />

            <li className="mb-2">
              <NavLink to="/admin-dashboard/coaches" className={itemClass}>
                <FontAwesomeIcon icon={faUserTie} className="mr-3 w-5" /> Manage Coaches
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink to="/admin-dashboard/attendance" className={itemClass}>
                <FontAwesomeIcon icon={faCalendarCheck} className="mr-3 w-5" /> Attendance
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink to="/admin-dashboard/salaries" className={itemClass}>
                <FontAwesomeIcon icon={faFileInvoiceDollar} className="mr-3 w-5" /> Salaries
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink to="/admin-dashboard/reviews" className={itemClass}>
                <FontAwesomeIcon icon={faCommentDots} className="mr-3 w-5" /> Manage Reviews
              </NavLink>
            </li>
          </ul>
        </nav>

        <Button onClick={handleLogout} className="mt-auto w-full bg-emerald-600 hover:bg-emerald-700 text-white">
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
          Logout
        </Button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-auto bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
