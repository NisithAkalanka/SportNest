import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUser, faTachometerAlt, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

const MemberLayout = () => {
  const navigate = useNavigate();
  
  
  // dan api localStorage eka remove karamu
  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      
      {/* Sidebar (Member Panel) */}
      <aside className="w-64 text-white p-5 flex flex-col shadow-xl" style={{ backgroundColor: '#0D1B2A' }}>
        <h1 className="text-2xl font-bold mb-10 text-center">SportNest</h1>
        
        <nav className="flex-grow">
          <ul>
            <li className="mb-4">
              <Link to="/member-dashboard" className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors">
                <FontAwesomeIcon icon={faTachometerAlt} className="mr-3 w-5" /> 
                Dashboard
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/my-profile" className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors">
                <FontAwesomeIcon icon={faUser} className="mr-3 w-5" /> 
                My Sports Profile
              </Link>
            </li>
          </ul>
        </nav>

        <Button onClick={handleLogout} className="mt-auto" style={{ backgroundColor: '#FF6700' }}>
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
          Logout
        </Button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-auto">
        <Outlet /> {/* metanata MemberDashboard, PlayerProfile wage pages load wenawa */}
      </main>
      
    </div>
  );
};

export default MemberLayout;