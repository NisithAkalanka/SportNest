<<<<<<< Updated upstream
=======

// Frontend/src/App.jsx — CLEAN MERGED
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
// Member (Protected) Pages
import MemberDashboard from '@/pages/MemberDashboard';
import PlayerProfilePage from '@/pages/PlayerProfilePage';
import SponsorshipManagePage from '@/pages/SponsorshipManagePage'; // ★ SponsorshipManagePage එක import කළා
=======
// Sport Detail Pages
import TennisPage from '@/pages/sports/TennisPage';
import CricketPage from '@/pages/sports/CricketPage';
import BadmintonPage from '@/pages/sports/BadmintonPage';
import NetballPage from '@/pages/sports/NetballPage';
import SwimmingPage from '@/pages/sports/SwimmingPage';
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

// --- Member (Protected) Pages ---
import MemberDashboard from '@/pages/MemberDashboard';
import PlayerProfilePage from '@/pages/PlayerProfilePage';
import SponsorshipManagePage from '@/pages/SponsorshipManagePage';
import SubscriptionSuccessPage from '@/pages/SubscriptionSuccessPage';
import CoachDashboard from '@/pages/CoachDashboard';
import FeedbacksPage from  '@/pages/FeedbacksPage';

  const onSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setNotice(null);
    try {
      await submitContactForm(form);
      setNotice({ type: 'ok', text: 'Message sent! We\'ll get back to you soon.' });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      const msg = err?.response?.data?.msg || err?.message || 'Failed to send message';
      setNotice({ type: 'err', text: msg });
    } finally {
      setSending(false);
    }
  };

>>>>>>> Stashed changes

// Admin (Protected) Pages
import AdminDashboard from '@/pages/AdminDashboard';
import ManageInventory from '@/pages/ManageInventory';
import ManageSuppliers from '@/pages/ManageSuppliers';

<<<<<<< Updated upstream
=======

// Events (lazy)
const SubmitEvent     = lazy(() => import('@/pages/SubmitEvent'));
const ApprovedEvents  = lazy(() => import('@/pages/ApprovedEvents'));
const EventDetails    = lazy(() => import('@/pages/EventDetails'));
const ModerateEvents  = lazy(() => import('@/pages/ModerateEvents'));
const MyEvents        = lazy(() => import('@/pages/MyEvents'));
const EditMyEvent     = lazy(() => import('@/pages/EditMyEvent'));
const EditEvent       = lazy(() => import('@/pages/EditEvent'));
const EventsReport    = lazy(() => import('@/pages/EventsReport'));

const AppLoader = () => (
  <div className="min-h-[40vh] grid place-content-center text-emerald-600">Loading…</div>
);
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
                {/* --- Member Private Routes (MemberRoute එකෙන් ආරක්ෂා කර ඇත) --- */}
                <Route element={<MemberRoute />}>
                  <Route path="member-dashboard" element={<MemberDashboard />} />
                  <Route path="my-profile" element={<PlayerProfilePage />} />
                  {/* ★ Sponsorship Manage Page එකට අදාළ නිවැරදි Route එක ★ */}
                  <Route path="sponsorship/manage/:id" element={<SponsorshipManagePage />} />
=======
                  {/* Sports detail */}
                  <Route path="sports/tennis" element={<TennisPage />} />
                  <Route path="sports/cricket" element={<CricketPage />} />
                  <Route path="sports/badminton" element={<BadmintonPage />} />
                  <Route path="sports/netball" element={<NetballPage />} />
                  <Route path="sports/swimming" element={<SwimmingPage />} />
                  <Route path="preorders" element={<Preorders />} />

                  {/* Events (public) */}
                  <Route path="events" element={<ApprovedEvents />} />
                  <Route path="events/submit" element={<SubmitEvent />} />
                  <Route path="events/:id" element={<EventDetails />} />

                  {/* Member-protected (under Public) */}
                  <Route element={<MemberRoute />}> 
                    <Route path="member-dashboard" element={<MemberDashboard />} />
                    <Route path="subscription-success" element={<SubscriptionSuccessPage />} />
                    <Route path="my-profile" element={<PlayerProfilePage />} />
                    <Route path="sponsorship/manage/:id" element={<SponsorshipManagePage />} />
                    <Route path="my-events" element={<MyEvents />} />
                    <Route path="events/:id/edit-my" element={<EditMyEvent />} />
                    <Route path="training" element={<TrainingsPage />} />
                  </Route>
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
export default App;
=======
export default App;//original
>>>>>>> Stashed changes
