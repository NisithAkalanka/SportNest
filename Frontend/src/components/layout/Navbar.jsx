import React, { useContext, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { MemberAuthContext } from '@/context/MemberAuthContext';
import { Button } from '@/components/ui/button';
import { FaCalendarAlt, FaDumbbell } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(MemberAuthContext);
  const [openDropdown, setOpenDropdown] = useState(false);

  const logoutHandler = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `transition-colors ${isActive ? 'text-emerald-400 font-semibold' : 'text-gray-300 hover:text-emerald-400'}`;

  return (
    <nav className="bg-[#0D1B2A] p-4 shadow-lg sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-white text-2xl font-bold">
          Sport<span className="text-emerald-400">Nest</span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/club" className={linkClass}>The Club</NavLink>
          <NavLink to="/sports" className={linkClass}>Sports</NavLink>

          {/* Dropdown: Event & Training */}
          <div
            className="relative"
            onMouseEnter={() => setOpenDropdown(true)}
            onMouseLeave={() => setOpenDropdown(false)}
          >
            <button className="text-gray-300 hover:text-emerald-400 transition-colors">
              Event &amp; Training ▾
            </button>
            {openDropdown && (
              <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg overflow-hidden bg-emerald-600 text-white z-50">
                <Link to="/events" className="flex items-center px-4 py-2 hover:bg-emerald-700">
                  <FaCalendarAlt className="mr-2" /> Events
                </Link>
                <Link to="/training" className="flex items-center px-4 py-2 hover:bg-emerald-700">
                  <FaDumbbell className="mr-2" /> Training
                </Link>
              </div>
            )}
          </div>

          <NavLink to="/shop" className={linkClass}>Shop</NavLink>
          <NavLink to="/feedback" className={linkClass}>Feedback</NavLink>
        </div>

        {/* Conditional Login/Profile/Logout Buttons */}
        <div className="flex items-center space-x-3">
          {user ? (
            <>
              <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700">
                <Link to="/member-dashboard">My Profile</Link>
              </Button>
              <Button onClick={logoutHandler} variant="outline" className="text-white border-white/20 hover:bg-white/10">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700">
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
