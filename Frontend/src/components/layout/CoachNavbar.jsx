// Frontend/src/components/layout/CoachNavbar.jsx

import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/MemberAuthContext";

const CoachNavbar = () => {
  // Function to apply styles based on active/inactive state of NavLink
  const linkStyle = ({ isActive }) =>
    isActive
      ? "text-white bg-gray-900 px-3 py-2 rounded-md text-sm font-medium"
      : "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium";

  // Get logout function from AuthContext
  const { logout } = useContext(AuthContext);

  // Navigation function from react-router
  const navigate = useNavigate();

  // Handles user logout action
  const handleLogout = () => {
    logout(); // Call logout from context
    navigate("/"); // Redirect to home page after logout
    alert("You have been logged out successfully.");
  };

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section: Brand / Logo */}
          <div className="flex-shrink-0">
            <span className="text-white font-bold text-xl">
              SportNest Coach Portal
            </span>
          </div>

          {/* Right section: Navigation links and Logout button */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {/* Navigation links */}
              <NavLink to="/coach/dashboard" end className={linkStyle}>
                Dashboard
              </NavLink>
              <NavLink to="/coach/feedbacks" className={linkStyle}>
                Feedbacks
              </NavLink>

              
              <NavLink to="/coach/training-sessions" className={linkStyle}>
                Training Sessions
              </NavLink>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
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
