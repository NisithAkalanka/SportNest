import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// NEW: Imported faTruckLoading for the pre-orders icon
import { faSignOutAlt, faBoxOpen, faUsers, faTachometerAlt, faStore, faTruckLoading } from '@fortawesome/free-solid-svg-icons'; 

const MainLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* Sidebar (No changes here) */}
      <aside className="w-64 bg-gray-900 text-white p-5 flex flex-col shadow-xl">
        <h1 className="text-2xl font-bold mb-10 text-center">SportNest Admin</h1>
        
        {/* Navigation Links (This is where we add the new link) */}
        <nav className="flex-grow">
          <ul>
            {/* --- Shop Link (Unchanged) --- */}
            <li className="mb-4">
              <a href="/shop" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors">
                <FontAwesomeIcon icon={faStore} className="mr-3 w-5" />
                View Shop
              </a>
            </li>
            <hr className="my-4 border-gray-600" />

            {/* --- Admin Links (Unchanged) --- */}
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

            {/* ================ NEW PRE-ORDERS LINK IS HERE =================== */}
            <li className="mb-4">
              <Link to="/preorders" className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors">
                <FontAwesomeIcon icon={faTruckLoading} className="mr-3 w-5" /> 
                Pre-orders
              </Link>
            </li>
            {/* ================================================================== */}

          </ul>
        </nav>

        {/* Logout Button (Unchanged) */}
        <Button variant="destructive" onClick={handleLogout} className="mt-auto">
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
          Logout
        </Button>
      </aside>

      {/* Main Content Area (Unchanged) */}
      <main className="flex-1 p-10 overflow-auto">
        {children}
      </main>
      
    </div>
  );
};

export default MainLayout;
