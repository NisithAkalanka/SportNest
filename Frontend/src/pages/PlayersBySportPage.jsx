import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AdminAuthContext } from "@/context/AdminAuthContext";
import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaIdCard,
  FaFutbol,
  FaChild,
} from "react-icons/fa";

// Reusable Sub-Statistic Component (with optional link)
const DetailRow = ({ icon, label, value, to }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center text-gray-600">
      {icon && <div className="mr-4 text-lg text-gray-400">{icon}</div>}
      <span>{label}</span>
    </div>
    <div className="flex items-center">
      <span className="font-bold text-lg mr-6">{value}</span>
      {to && (
        <Link
          to={to}
          className="text-sm font-semibold text-orange-500 hover:text-orange-600 hover:underline"
        >
          View Details
        </Link>
      )}
    </div>
  </div>
);

const UserManagementPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { admin } = useContext(AdminAuthContext);

  useEffect(() => {
    const fetchSummary = async () => {
      if (admin && admin.token) {
        try {
          const config = {
            headers: { Authorization: `Bearer ${admin.token}` },
          };
          const { data } = await axios.get("/api/admin/user-summary", config);
          setSummary(data);
        } catch (error) {
          console.error("Failed to fetch user summary:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [admin]);

  if (loading) {
    return <div className="p-8">Loading dashboard statistics...</div>;
  }

  if (!summary) {
    return (
      <div className="p-8">Failed to load data. Please refresh the page.</div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        User & Player Management
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* === MEMBERSHIP OVERVIEW CARD === */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Membership Overview
          </h2>

          {/* Main Stat */}
          <div className="flex items-center text-gray-800 p-4 bg-gray-50 rounded-lg mb-4">
            <FaUsers className="text-5xl text-indigo-400 mr-6" />
            <div>
              <div className="text-sm text-gray-500">Total Club Members</div>
              <div className="text-4xl font-bold">{summary.totalMembers}</div>
            </div>
          </div>

          {/* Sub Stats */}
          <div className="space-y-2">
            <DetailRow
              icon={<FaUsers />}
              label="All Members"
              value={summary.totalMembers}
              to="/admin-dashboard/user-management/plan/all" // ✅ View Details
            />
            <DetailRow
              icon={<FaUserCheck />}
              label="Active Memberships"
              value={summary.membersWithPlan}
              to="/admin-dashboard/user-management/plan/active" // ✅ View Details
            />
            <DetailRow
              icon={<FaUserTimes />}
              label="No Membership Plan"
              value={summary.membersWithoutPlan}
              to="/admin-dashboard/user-management/plan/inactive" // ✅ View Details
            />
            <hr className="my-2" />
            <DetailRow
              icon={<FaChild />}
              label="Student Plans"
              value={summary.planCounts.student || 0}
            />
            <DetailRow
              icon={<FaIdCard />}
              label="Ordinary Plans"
              value={summary.planCounts.ordinary || 0}
            />
            <DetailRow
              icon={<FaIdCard />}
              label="Life Time Plans"
              value={summary.planCounts.lifeTime || 0}
            />
          </div>
        </div>

        {/* === PLAYER OVERVIEW CARD === */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Player Overview
          </h2>

          {/* Main Stat */}
          <div className="flex items-center text-gray-800 p-4 bg-gray-50 rounded-lg mb-4">
            <FaFutbol className="text-5xl text-teal-400 mr-6" />
            <div>
              <div className="text-sm text-gray-500">
                Total Registered Players
              </div>
              <div className="text-4xl font-bold">{summary.totalPlayers}</div>
            </div>
          </div>

          {/* Sub Stats (keep links for players) */}
          <div className="space-y-2">
            <DetailRow
              label="Cricket Players"
              value={summary.sportCounts.cricket || 0}
              to="/admin-dashboard/user-management/sport/Cricket"
            />
            <DetailRow
              label="Netball Players"
              value={summary.sportCounts.netball || 0}
              to="/admin-dashboard/user-management/sport/Netball"
            />
            <DetailRow
              label="Tennis Players"
              value={summary.sportCounts.tennis || 0}
              to="/admin-dashboard/user-management/sport/Tennis"
            />
            <DetailRow
              label="Badminton Players"
              value={summary.sportCounts.badminton || 0}
              to="/admin-dashboard/user-management/sport/Badminton"
            />
            <DetailRow
              label="Swimming Players"
              value={summary.sportCounts.swimming || 0}
              to="/admin-dashboard/user-management/sport/Swimming"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;   