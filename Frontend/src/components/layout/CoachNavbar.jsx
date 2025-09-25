// Frontend/src/components/layout/CoachNavbar.jsx

import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/MemberAuthContext";

const CoachNavbar = () => {
  // Active/inactive link style
  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-emerald-600 text-white"
        : "text-white/90 hover:bg-white/10"
    }`;

  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    alert("You have been logged out successfully.");
  };

  return (
    <nav className="bg-[#0D1B2A] border-b border-white/10 shadow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex-shrink-0">
            <span className="text-white font-bold text-xl">SportNest Coach Portal</span>
          </div>

          {/* Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2">
              <NavLink to="/coach/dashboard" end className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/coach/feedbacks" className={linkClass}>
                Feedbacks
              </NavLink>
              <NavLink to="/coach/training-sessions" className={linkClass}>
                Training Sessions
              </NavLink>

              <button
                onClick={handleLogout}
                className="ml-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default CoachNavbar;
