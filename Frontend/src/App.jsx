import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Providers (Contexts)
import { MemberAuthProvider } from '@/context/MemberAuthContext';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import { CartProvider } from '@/context/CartContext';

// Layouts
import PublicLayout from '@/components/layout/PublicLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// Route Protection
import AdminRoute from '@/components/AdminRoute';
import MemberRoute from '@/components/MemberRoute';

// --- Pages (සියලුම පිටු මෙතැන import කර ඇත) ---

// Public Pages
import HomePage from '@/pages/HomePage';
import Shop from '@/pages/Shop';
import CartPage from '@/pages/CartPage';
import SportsHomePage from '@/pages/SportsHomePage';
import RegisterPage from '@/pages/RegisterPage';
import MemberLoginPage from '@/pages/MemberLoginPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import ClubHomePage from '@/pages/ClubHomePage'; // ★ ClubHomePage එක import කළා
import SponsorshipPage from '@/pages/SponsorshipPage';

// Member (Protected) Pages
import MemberDashboard from '@/pages/MemberDashboard';
import PlayerProfilePage from '@/pages/PlayerProfilePage';
import SponsorshipManagePage from '@/pages/SponsorshipManagePage'; // ★ SponsorshipManagePage එක import කළා

// Admin (Protected) Pages
import AdminDashboard from '@/pages/AdminDashboard';
import ManageInventory from '@/pages/ManageInventory';
import ManageSuppliers from '@/pages/ManageSuppliers';


function App() {
  return (
    <AdminAuthProvider>
      <MemberAuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              
              {/* --- Public සහ Member Routes --- */}
              <Route path="/" element={<PublicLayout />}>
                
                {/* --- Public Routes (ඕනෑම කෙනෙකුට පෙනෙන පිටු) --- */}
                <Route index element={<HomePage />} />
                <Route path="shop" element={<Shop />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="sports" element={<SportsHomePage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="login" element={<MemberLoginPage />} />
                <Route path="admin-login" element={<AdminLoginPage />} />
                <Route path="club" element={<ClubHomePage />} />
                <Route path="sponsorship" element={<SponsorshipPage />} />

                {/* --- Member Private Routes (MemberRoute එකෙන් ආරක්ෂා කර ඇත) --- */}
                <Route element={<MemberRoute />}>
                  <Route path="member-dashboard" element={<MemberDashboard />} />
                  <Route path="my-profile" element={<PlayerProfilePage />} />
                  {/* ★ Sponsorship Manage Page එකට අදාළ නිවැරදි Route එක ★ */}
                  <Route path="sponsorship/manage/:id" element={<SponsorshipManagePage />} />
                </Route>
              </Route>
              
              {/* --- Admin Private Routes (මේවා වෙනමම තියෙනවා) --- */}
              <Route path="/admin-dashboard" element={<AdminRoute />}>
                  <Route element={<AdminLayout />}>
                     <Route index element={<AdminDashboard />} />
                     <Route path="inventory" element={<ManageInventory />} />
                     <Route path="suppliers" element={<ManageSuppliers />} />
                  </Route>
              </Route>

            </Routes>
          </Router>
        </CartProvider>
      </MemberAuthProvider>
    </AdminAuthProvider>
  );
}

export default App;