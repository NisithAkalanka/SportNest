import React, { useContext } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

// ★★★ Contexts ★★★
import { AuthContext } from '../../context/MemberAuthContext';
import { AdminAuthContext } from '../../context/AdminAuthContext';

import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faLocationDot, faPhone, faClock } from '@fortawesome/free-solid-svg-icons';
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
        <nav className="p-4 shadow-md bg-[#0D1B2A] border-b border-white/10">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-white text-2xl font-bold">
              SportNest
            </Link>

            {/* LEFT NAV (md+ only) */}
            <div className="hidden md:flex items-center gap-1 text-white/90">
              <NavLink
                to="/"
                className={({isActive}) =>
                  isActive
                    ? 'px-3 py-2 text-sm font-medium text-emerald-400 border-b-2 border-emerald-500'
                    : 'px-3 py-2 text-sm font-medium text-white/90 hover:text-emerald-300 border-b-2 border-transparent'
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/club"
                className={({isActive}) =>
                  isActive
                    ? 'px-3 py-2 text-sm font-medium text-emerald-400 border-b-2 border-emerald-500'
                    : 'px-3 py-2 text-sm font-medium text-white/90 hover:text-emerald-300 border-b-2 border-transparent'
                }
              >
                The Club
              </NavLink>

              {/* ▼ Event & Training dropdown (only Events + Training) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={
                      isEventsArea
                        ? 'px-3 py-2 text-sm font-medium text-emerald-400 border-b-2 border-emerald-500'
                        : 'px-3 py-2 text-sm font-medium text-white/90 hover:text-emerald-300 border-b-2 border-transparent'
                    }
                  >
                    Event &amp; Training
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 z-50 bg-emerald-700 text-white border border-emerald-600">
                  <DropdownMenuItem asChild className="cursor-pointer focus:bg-emerald-600 focus:text-white">
                    <Link to="/events">Events</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer focus:bg-emerald-600 focus:text-white">
                    <Link to="/training">Training</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <NavLink
                to="/sports"
                className={({isActive}) =>
                  isActive
                    ? 'px-3 py-2 text-sm font-medium text-emerald-400 border-b-2 border-emerald-500'
                    : 'px-3 py-2 text-sm font-medium text-white/90 hover:text-emerald-300 border-b-2 border-transparent'
                }
              >
                Sports
              </NavLink>
              <NavLink
                to="/shop"
                className={({isActive}) =>
                  isActive
                    ? 'px-3 py-2 text-sm font-medium text-emerald-400 border-b-2 border-emerald-500'
                    : 'px-3 py-2 text-sm font-medium text-white/90 hover:text-emerald-300 border-b-2 border-transparent'
                }
              >
                Shop
              </NavLink>
              <NavLink
                to="/contact"
                className={({isActive}) =>
                  isActive
                    ? 'px-3 py-2 text-sm font-medium text-emerald-400 border-b-2 border-emerald-500'
                    : 'px-3 py-2 text-sm font-medium text-white/90 hover:text-emerald-300 border-b-2 border-transparent'
                }
              >
                Contact Us
              </NavLink>
            </div>

            {/* RIGHT actions */}
            <div className="flex items-center gap-3">
              {loggedInUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10">
                      <FontAwesomeIcon icon={faUserCircle} className="h-8 w-8 text-emerald-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 z-50 bg-emerald-700 text-white border border-emerald-600" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <p className="text-sm font-medium">{loggedInUser.name}</p>
                      <p className="text-xs text-white/80">{loggedInUser.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-emerald-600 focus:text-white">
                      <Link to={loggedInUser.role === 'admin' ? '/admin-dashboard' : '/member-dashboard'}>
                        {loggedInUser.role === 'admin' ? 'Admin Dashboard' : 'My Profile'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer focus:bg-emerald-600 focus:text-white">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap">
                    Login
                  </Link>
                  <Link to="/register" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-semibold whitespace-nowrap">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="min-h-screen">
        <Outlet />
      </main>

      <footer className="text-white" style={{ backgroundColor: '#0D1B2A' }}>
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand / About */}
            <div>
              <Link to="/" className="text-2xl font-bold">SportNest</Link>
              <p className="text-white/70 mt-2 text-sm">
                Sri Lanka’s home for sport, coaching &amp; gear.
              </p>
              <div className="flex gap-3 mt-4">
                <a href="#" aria-label="Facebook" className="h-9 w-9 grid place-content-center rounded-full bg-white/10 hover:bg-white/20 transition">
                  <span className="text-white font-semibold">f</span>
                </a>
                <a href="#" aria-label="Instagram" className="h-9 w-9 grid place-content-center rounded-full bg-white/10 hover:bg-white/20 transition">
                  <span className="text-white font-semibold">ig</span>
                </a>
                <a href="#" aria-label="Twitter" className="h-9 w-9 grid place-content-center rounded-full bg-white/10 hover:bg-white/20 transition">
                  <span className="text-white font-semibold">x</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-white/80 text-sm">
                <li><Link className="hover:text-white" to="/">Home</Link></li>
                <li><Link className="hover:text-white" to="/club">The Club</Link></li>
                <li><Link className="hover:text-white" to="/events">Events</Link></li>
                <li><Link className="hover:text-white" to="/training">Training</Link></li>
                <li><Link className="hover:text-white" to="/sports">Sports</Link></li>
                <li><Link className="hover:text-white" to="/shop">Shop</Link></li>
                <li><Link className="hover:text-white" to="/contact">Contact Us</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-white/80 text-sm">
                <li className="flex gap-2">
                  <FontAwesomeIcon icon={faLocationDot} className="text-emerald-400 mt-1" />
                  <span>No. 7, Padukka, Colombo</span>
                </li>
                <li className="flex gap-2">
                  <FontAwesomeIcon icon={faPhone} className="text-emerald-400 mt-1" />
                  <a className="hover:text-white" href="tel:+011714339">+011-714339</a>
                </li>
                <li className="flex gap-2">
                  <FontAwesomeIcon icon={faPhone} className="text-emerald-400 mt-1" />
                  <a className="hover:text-white" href="tel:+94703036840">+94 70 303 6840</a>
                </li>
              </ul>
            </div>

            {/* Hours / Helpful */}
            <div>
              <h4 className="font-semibold mb-3">Info</h4>
              <p className="text-white/80 text-sm flex items-start gap-2">
                <FontAwesomeIcon icon={faClock} className="text-emerald-400 mt-1" />
                <span>Open daily</span>
              </p>
              <p className="text-white/60 text-xs mt-2">
                For directions, contact us or check Events &amp; Training for schedules.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-4 text-center text-sm text-white/70">
            © {new Date().getFullYear()} SportNest. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
