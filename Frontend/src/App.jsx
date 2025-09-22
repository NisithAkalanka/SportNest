// Frontend/src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Providers (Contexts)
import { MemberAuthProvider } from '@/context/MemberAuthContext';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import { CartProvider } from '@/context/CartContext';

// Layouts
import PublicLayout from '@/components/layout/PublicLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import CoachLayout from '@/components/layout/CoachLayout';

// Route Protection
import AdminRoute from '@/components/AdminRoute';
import MemberRoute from '@/components/MemberRoute';

// --- Pages ---

// Public Pages
import HomePage from '@/pages/HomePage';
import Shop from '@/pages/Shop';
import CartPage from '@/pages/CartPage';
import SportsHomePage from '@/pages/SportsHomePage';
import RegisterPage from '@/pages/RegisterPage';
import MemberLoginPage from '@/pages/MemberLoginPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import ClubHomePage from '@/pages/ClubHomePage';
import SponsorshipPage from '@/pages/SponsorshipPage';
import MembershipPlansPage from './pages/MembershipPlansPage';
import ConfirmMembershipPage from './pages/ConfirmMembershipPage';
import AboutPage from './pages/AboutPage';
import AchievementsPage from './pages/AchievementsPage';

// Sport Detail Pages
import TennisPage from './pages/sports/TennisPage';
import CricketPage from './pages/sports/CricketPage';
import BadmintonPage from './pages/sports/BadmintonPage';
import NetballPage from './pages/sports/NetballPage';
import SwimmingPage from './pages/sports/SwimmingPage';

// Member & Coach (Protected) Pages
import MemberDashboard from '@/pages/MemberDashboard';
import PlayerProfilePage from '@/pages/PlayerProfilePage';
import SponsorshipManagePage from '@/pages/SponsorshipManagePage';
import SubscriptionSuccessPage from './pages/SubscriptionSuccessPage';
import CoachDashboard from './pages/CoachDashboard';

// Coach-specific pages
const FeedbacksPage = () => <div className="container mx-auto p-8"><h1 className="text-3xl font-bold">Manage Feedbacks</h1></div>;
const TrainingSessionsPage = () => <div className="container mx-auto p-8"><h1 className="text-3xl font-bold">Manage Training Sessions</h1></div>;

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
              
              {/* --- 1. Public සහ සාමාන්‍ය Member Routes කාණ්ඩය --- */}
              <Route path="/" element={<PublicLayout />}>
                
                <Route index element={<HomePage />} />
                <Route path="shop" element={<Shop />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="sports" element={<SportsHomePage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="login" element={<MemberLoginPage />} />
                <Route path="admin-login" element={<AdminLoginPage />} />
                <Route path="club" element={<ClubHomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="achievements" element={<AchievementsPage />} />
                <Route path="sponsorship" element={<SponsorshipPage />} />
                <Route path="membership-plans" element={<MembershipPlansPage />} />
                <Route path="confirm-membership/:planName" element={<ConfirmMembershipPage />} />
                
                {/* ක්‍රීඩා විස්තර පිටු සඳහා වන Routes */}
                <Route path="sports/tennis" element={<TennisPage />} />
                <Route path="sports/cricket" element={<CricketPage />} />
                <Route path="sports/badminton" element={<BadmintonPage />} />
                <Route path="sports/netball" element={<NetballPage />} />
                <Route path="sports/swimming" element={<SwimmingPage />} />
                 
                {/* Member සහ Player සඳහා වන Private Routes */}
                <Route element={<MemberRoute />}>
                  <Route path="member-dashboard" element={<MemberDashboard />} />
                  <Route path="subscription-success" element={<SubscriptionSuccessPage />} />
                  <Route path="my-profile" element={<PlayerProfilePage />} />
                  <Route path="sponsorship/manage/:id" element={<SponsorshipManagePage />} />
                </Route>
              </Route>
              
              {/* --- 2. Coach සඳහා වන වෙන්වූ Route කාණ්ඩය --- */}
              <Route path="/coach" element={<MemberRoute />}>
                <Route element={<CoachLayout />}>
                    <Route path="dashboard" element={<CoachDashboard />} /> 
                    <Route path="feedbacks" element={<FeedbacksPage />} />
                    <Route path="training" element={<TrainingSessionsPage />} />
                </Route>
              </Route>

              {/* --- 3. Admin සඳහා වන Route කාණ්ඩය --- */}
             <Route path="/admin-dashboard" element={<AdminRoute />}>
  <Route element={<AdminLayout />}>
     <Route index element={<AdminDashboard />} /> 
     <Route path="inventory" element={<ManageInventory />} />
     <Route path="suppliers" element={<ManageSuppliers />} />
  </Route>
</Route>


            {/* ★★★ දෝෂය තිබූ ස්ථානය. '</Route>s' වෙනුවට '</Routes>' ලෙස නිවැරදි කර ඇත ★★★ */}
            </Routes>

          </Router>
        </CartProvider>
      </MemberAuthProvider>
    </AdminAuthProvider>
  );
}

export default App;