// Frontend/src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Preorders from '@/pages/Preorders'; // adjust alias/path if needed

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

// --- Public Pages ---
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

// --- Member (Protected) Pages ---
import MemberDashboard from '@/pages/MemberDashboard';
import PlayerProfilePage from '@/pages/PlayerProfilePage';
import SponsorshipManagePage from '@/pages/SponsorshipManagePage';
import SubscriptionSuccessPage from './pages/SubscriptionSuccessPage';
import CoachDashboard from './pages/CoachDashboard';

// Coach-specific pages (placeholders; replace with real pages if available)
const FeedbacksPage = () => (
  <div className="container mx-auto p-8">
    <h1 className="text-3xl font-bold">Manage Feedbacks</h1>
  </div>
);
const TrainingSessionsPage = () => (
  <div className="container mx-auto p-8">
    <h1 className="text-3xl font-bold">Manage Training Sessions</h1>
  </div>
);

// --- Admin (Protected) Pages ---
import AdminDashboard from '@/pages/AdminDashboard';
import ManageInventory from '@/pages/ManageInventory';
import ManageSuppliers from '@/pages/ManageSuppliers';

// ★★★ Events module (lazy) — additive only
const SubmitEvent     = lazy(() => import('@/pages/SubmitEvent'));
const ApprovedEvents  = lazy(() => import('@/pages/ApprovedEvents'));
const EventDetails    = lazy(() => import('@/pages/EventDetails'));
const ModerateEvents  = lazy(() => import('@/pages/ModerateEvents'));

// ★ NEW (member-side management)
const MyEvents       = lazy(() => import('@/pages/MyEvents'));
const EditMyEvent    = lazy(() => import('@/pages/EditMyEvent'));   // member edits own event

// ★ NEW (admin edit page)
const EditEvent      = lazy(() => import('@/pages/EditEvent'));

// ★ NEW (admin report page)
const EventsReport   = lazy(() => import('@/pages/EventsReport'));

function App() {
  return (
    <AdminAuthProvider>
      <MemberAuthProvider>
        <CartProvider>
          <Router>
            <Suspense fallback={null}>
              <Routes>

                {/* --- 1. Public + Member shell --- */}
                <Route path="/" element={<PublicLayout />}>
                  {/* Public */}
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

                  {/* Sport detail routes */}
                  <Route path="sports/tennis" element={<TennisPage />} />
                  <Route path="sports/cricket" element={<CricketPage />} />
                  <Route path="sports/badminton" element={<BadmintonPage />} />
                  <Route path="sports/netball" element={<NetballPage />} />
                  <Route path="sports/swimming" element={<SwimmingPage />} />

                  {/* Events (public) */}
                  <Route path="events" element={<ApprovedEvents />} />
                  <Route path="events/submit" element={<SubmitEvent />} />
                  <Route path="events/:id" element={<EventDetails />} />

                  {/* Member-protected */}
                  <Route element={<MemberRoute />}>
                    <Route path="member-dashboard" element={<MemberDashboard />} />
                    <Route path="subscription-success" element={<SubscriptionSuccessPage />} />
                    <Route path="my-profile" element={<PlayerProfilePage />} />
                    <Route path="sponsorship/manage/:id" element={<SponsorshipManagePage />} />

                    {/* Member: event management */}
                    <Route path="my-events" element={<MyEvents />} />
                    <Route path="events/:id/edit-my" element={<EditMyEvent />} />
                  </Route>
                </Route>

                {/* --- 2. Coach Routes (protected by MemberRoute) --- */}
                <Route path="/coach" element={<MemberRoute />}>
                  <Route element={<CoachLayout />}>
                    <Route path="dashboard" element={<CoachDashboard />} />
                    <Route path="feedbacks" element={<FeedbacksPage />} />
                    <Route path="training" element={<TrainingSessionsPage />} />
                  </Route>
                </Route>

                {/* --- 3. Admin Routes (protected) --- */}
                <Route path="/admin-dashboard" element={<AdminRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="inventory" element={<ManageInventory />} />
                    <Route path="preorders" element={<Preorders />} />
                    <Route path="suppliers" element={<ManageSuppliers />} />

                    {/* Admin: events moderation + edit + report */}
                    <Route path="events/moderate" element={<ModerateEvents />} />
                    <Route path="events/:id/edit" element={<EditEvent />} />
                    <Route path="events/report" element={<EventsReport />} />
                  </Route>
                </Route>

              </Routes>
            </Suspense>
          </Router>
        </CartProvider>
      </MemberAuthProvider>
    </AdminAuthProvider>
  );
}

export default App;
