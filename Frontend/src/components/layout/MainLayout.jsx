import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faBoxOpen, faUsers, faTachometerAlt, faStore } from '@fortawesome/free-solid-svg-icons'; // faStore icon එක අලුතින් import කළා

const MainLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');

  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* Sidebar (වම් පැත්තේ Navigation Bar එක) */}
      <aside className="w-64 bg-gray-900 text-white p-5 flex flex-col shadow-xl">
        <h1 className="text-2xl font-bold mb-10 text-center">SportNest Admin</h1>
        
        {/* Navigation Links */}
        <nav className="flex-grow">
          <ul>
            {/* --- Shop Link එක --- */}
            <li className="mb-4">
              <a href="/shop" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors">
                <FontAwesomeIcon icon={faStore} className="mr-3 w-5" />
                View Shop
              </a>
            </li>
            <hr className="my-4 border-gray-600" />

            {/* --- Admin Links --- */}
            <li className="mb-4">
              <Link to="/dashboard" className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors">
                <FontAwesomeIcon icon={faTachometerAlt} className="mr-3 w-5" /> 
                Dashboard
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/inventory" className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors">
                <FontAwesomeIcon icon={faBoxOpen} className="mr-3 w-5" /> 
                Inventory
              </Link>
            </li>
            <li className="mb-4">
              <Link to="/suppliers" className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors">
                <FontAwesomeIcon icon={faUsers} className="mr-3 w-5" /> 
                Suppliers
              </Link>
            </li>
          </ul>
        </nav>

        {/* Logout Button */}
        <Button variant="destructive" onClick={handleLogout} className="mt-auto">
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
          Logout
        </Button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-auto">
        {children}
      </main>
      
    </div>
  );
};

export default MainLayout;