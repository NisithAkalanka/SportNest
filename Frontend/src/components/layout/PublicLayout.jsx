import React, { useContext } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

// ★★★ Contexts ★★★
import { AuthContext } from '../../context/MemberAuthContext';
import { AdminAuthContext } from '../../context/AdminAuthContext';

import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PublicLayout = () => {
  const { user, logout: logoutUser } = useContext(AuthContext);
  const { admin, logoutAdmin } = useContext(AdminAuthContext);

  const loggedInUser = admin || user;
  const handleLogout = admin ? logoutAdmin : logoutUser;

  // active state for Event & Training dropdown label
  const location = useLocation();
  const isEventsArea =
    location.pathname.startsWith('/events') ||
    location.pathname.startsWith('/training');

  return (
    <div style={{ backgroundColor: '#F8F9FA' }}>
      <header className="sticky top-0 z-50">
        <nav className="p-4 shadow-lg" style={{ backgroundColor: '#0D1B2A' }}>
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-white text-2xl font-bold hover:text-orange-400">
              SportNest
            </Link>

            {/* LEFT NAV (md+ only) */}
            <div className="hidden md:flex items-center space-x-6 text-gray-300">
              <NavLink to="/" className={({isActive})=> isActive ? 'text-orange-500 font-bold' : 'hover:text-white'}>Home</NavLink>
              <NavLink to="/club" className={({isActive})=> isActive ? 'text-orange-500 font-bold' : 'hover:text-white'}>The Club</NavLink>

              {/* ▼ Event & Training dropdown (only Events + Training) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={isEventsArea ? 'text-orange-500 font-bold' : 'hover:text-white'}>
                    Event &amp; Training
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/events">Events</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/training">Training</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <NavLink to="/sports" className={({isActive})=> isActive ? 'text-orange-500 font-bold' : 'hover:text-white'}>Sports</NavLink>
              <NavLink to="/shop" className={({isActive})=> isActive ? 'text-orange-500 font-bold' : 'hover:text-white'}>Shop</NavLink>
              <NavLink to="/contact" className={({isActive})=> isActive ? 'text-orange-500 font-bold' : 'hover:text-white'}>Contact Us</NavLink>
            </div>

            {/* RIGHT actions */}
            <div className="flex items-center space-x-4">
              {loggedInUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <FontAwesomeIcon icon={faUserCircle} className="h-8 w-8 text-white hover:text-orange-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <p className="text-sm font-medium">{loggedInUser.name}</p>
                      <p className="text-xs text-muted-foreground">{loggedInUser.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to={loggedInUser.role === 'admin' ? '/admin-dashboard' : '/member-dashboard'}>
                        {loggedInUser.role === 'admin' ? 'Admin Dashboard' : 'My Profile'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login"><Button style={{ backgroundColor: '#FF6700', color: 'white' }}>Login</Button></Link>
                  <Link to="/register"><Button variant="secondary">Register</Button></Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="min-h-screen">
        <Outlet />
      </main>

      <footer className="text-white text-center p-6" style={{ backgroundColor: '#0D1B2A' }}>
        © {new Date().getFullYear()} SportNest. All Rights Reserved.
      </footer>
    </div>
  );
};

export default PublicLayout;
