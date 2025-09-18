import React, { useContext } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

// ★★★ Context දෙකම import කරගන්නවා ★★★
import { AuthContext } from '../../context/MemberAuthContext'; // Member ගේ context
import { AdminAuthContext } from '../../context/AdminAuthContext'; // Admin ගේ context

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
  // ★★★ user සහ admin දෙන්නගෙම විස්තර සහ logout functions ලබාගන්නවා ★★★
  const { user, logout: logoutUser } = useContext(AuthContext); 
  const { admin, logoutAdmin } = useContext(AdminAuthContext);

  // දැනට login වී සිටින්නේ කවුදැයි තීරණය කිරීම
  // Admin login වෙලා නම් 'loggedInUser' එකට admin ගේ විස්තර වැටෙනවා,
  // නැත්නම් (member login වෙලා නම්) member ගේ විස්තර වැටෙනවා.
  const loggedInUser = admin || user; 
  
  // අදාළ logout function එක තෝරාගැනීම
  const handleLogout = admin ? logoutAdmin : logoutUser;

  return (
    <div style={{ backgroundColor: '#F8F9FA' }}>
      
      <header className="sticky top-0 z-50">
        <nav className="p-4 shadow-lg" style={{ backgroundColor: '#0D1B2A' }}>
          <div className="container mx-auto flex justify-between items-center">
            
            <Link to="/" className="text-white text-2xl font-bold hover:text-orange-400">
                SportNest
            </Link>

            <div className="hidden md:flex items-center space-x-6 text-gray-300">
                <NavLink to="/" className={({isActive})=> isActive ? 'text-orange-500 font-bold' : 'hover:text-white'}>Home</NavLink>
                <NavLink to="/club" className={({isActive})=> isActive ? 'text-orange-500 font-bold' : 'hover:text-white'}>The Club</NavLink>
                <NavLink to="/events" className={({isActive})=> isActive ? 'text-orange-500 font-bold' : 'hover:text-white'}>Event & Training</NavLink>
                <NavLink to="/sports" className={({isActive})=> isActive ? 'text-orange-500 font-bold' : 'hover:text-white'}>Sports</NavLink>
                <NavLink to="/shop" className={({isActive})=> isActive ? 'text-orange-500 font-bold' : 'hover:text-white'}>Shop</NavLink>
                <NavLink to="/contact" className={({isActive})=> isActive ? 'text-orange-500 font-bold' : 'hover:text-white'}>Contact Us</NavLink>
            </div>

            <div className="flex items-center space-x-4">
              {/* ★★★ 'loggedInUser' ඉන්නවද කියලා බලලා UI එක වෙනස් කිරීම ★★★ */}
              {loggedInUser ? (
                // කවුරුහරි (Admin හෝ Member) login වී ඇත්නම් Profile Dropdown
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
                      
                      {/* Role එක අනුව Dashboard එකට / Profile එකට යොමු කිරීම */}
                      <Link to={loggedInUser.role === 'admin' ? '/admin-dashboard' : '/member-dashboard'}>
                          <DropdownMenuItem className="cursor-pointer">
                              {loggedInUser.role === 'admin' ? 'Admin Dashboard' : 'My Profile'}
                          </DropdownMenuItem>
                      </Link>
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                          Logout
                      </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                // කවුරුත් login වී නොමැති නම් Buttons
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