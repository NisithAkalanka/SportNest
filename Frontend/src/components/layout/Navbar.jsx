import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FaCalendarAlt, FaDumbbell } from "react-icons/fa"; 

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [openDropdown, setOpenDropdown] = useState(false);

  const logoutHandler = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-white text-2xl font-bold">
          SportNest
        </Link>

        {/* --- Navigation Links --- */}
        <div className="hidden md:flex items-center space-x-8 text-gray-300">
          <Link to="/" className="hover:text-white transition-colors duration-300">
            Home
          </Link>
          <Link to="/club" className="hover:text-white transition-colors duration-300">
            The Club
          </Link>
          <Link to="/sports" className="hover:text-white transition-colors duration-300">
            Sports
          </Link>

          {/* Dropdown: Event & Training */}
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown(true)}
            onMouseLeave={() => setOpenDropdown(false)}
          >
            <button className="hover:text-white transition-colors duration-300 flex items-center text-orange-500 font-semibold">
              Event & Training ▾
            </button>

           {openDropdown && (
  <div
    className="absolute left-0 mt-2 w-48 rounded-md shadow-lg z-50"
    style={{ backgroundColor: "black", color: "orange" }}
  >
    <Link
      to="/events"
      className="flex items-center px-4 py-2 hover:bg-gray-700 hover:text-white transition-colors duration-200"
      style={{ color: "orange" }}
    >
      <FaCalendarAlt className="mr-2" />
      Events
    </Link>
    <Link
      to="/trainings"
      className="flex items-center px-4 py-2 hover:bg-gray-700 hover:text-white transition-colors duration-200"
      style={{ color: "orange" }}
    >
      <FaDumbbell className="mr-2" />
      Trainings
    </Link>
  </div>
)}

          </div>

          <Link to="/store" className="hover:text-white transition-colors duration-300">
            Store
          </Link>
          <Link to="/feedback" className="hover:text-white transition-colors duration-300">
            Feedback
          </Link>
        </div>

        {/* --- Conditional Login/Profile/Logout Buttons --- */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                My Profile
              </Link>
              <button
                onClick={logoutHandler}
                className="text-gray-800 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-gray-800 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-sm font-medium"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
