import React, { useContext } from 'react';
// Link වෙනුවට NavLink පාවිච්චි කරන්න, active page එක style කරන්න ලේසියි
import { NavLink, Link, useNavigate } from 'react-router-dom'; 
import { MemberAuthContext } from '../../context/MemberAuthContext'; 
import { Button } from "@/components/ui/button"; // Button component එක import කිරීම

// Navbar.jsx file එක ඇතුලට App.jsx, index.css import කරන්නේ නෑ. ඒ නිසා මම ඒවා අයින් කලා.

const Navbar = () => {
    const navigate = useNavigate();
    
    // මේක දැන් හරි: MemberAuthContext එක පාවිච්චි කරනවා
    const { user, logout } = useContext(MemberAuthContext);

    const logoutHandler = () => {
        logout(); 
        navigate('/login');
    };

    // Active link එකට දෙන්න ඕන style එක (කොළ පාට)
    const activeLinkStyle = {
        color: '#28a745', // Green color
        fontWeight: 'bold',
    };

    return (
        // මම Background පාට ටිකක් තද කලා (bg-gray-900), ලස්සනට පේන්න
        <nav className="bg-gray-900 p-4 shadow-lg sticky top-0 z-50"> 
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-white text-2xl font-bold">
                    Sport<span className="text-green-500">Nest</span>
                </Link>

                {/* --- Navigation Links (කොළ පාට hover effect එකත් එක්ක) --- */}
                <div className="hidden md:flex items-center space-x-6 text-gray-300">
                    <NavLink to="/" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="hover:text-green-500 transition-colors duration-300">Home</NavLink>
                    <NavLink to="/club" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="hover:text-green-500 transition-colors duration-300">The Club</NavLink>
                    <NavLink to="/sports" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="hover:text-green-500 transition-colors duration-300">Sports</NavLink>
                    <NavLink to="/events" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="hover:text-green-500 transition-colors duration-300">Event & Training</NavLink>
                    <NavLink to="/store" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="hover:text-green-500 transition-colors duration-300">Store</NavLink>
                    <NavLink to="/feedback" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="hover:text-green-500 transition-colors duration-300">Feedback</NavLink>
                </div>

                {/* --- Conditional Login/Profile/Logout Buttons --- */}
                <div className="flex items-center space-x-4">
                    {user ? (
                        // --- User ලොග් වෙලා ඉන්නකොට පේන Buttons (මේ ටිකත් හරිගැස්සුවා) ---
                        <>
                            <Button asChild className="bg-green-600 text-white hover:bg-green-700">
                                <Link to="/dashboard">My Profile</Link>
                            </Button>
                            <Button onClick={logoutHandler} variant="secondary" className="bg-gray-600 text-white hover:bg-gray-700">
                                Logout
                            </Button>
                        </>
                    ) : (
                        // --- User ලොග් වෙලා නැතිකොට පේන Buttons (ඔයා මේ ටික හදලා තිබ්බේ හරි) ---
                        <>
                            <Button asChild className="bg-orange-500 text-white hover:bg-orange-600">
                                <Link to="/login">Login</Link>
                            </Button>
                            
                            <Button asChild className="bg-green-500 text-white hover:bg-green-600">
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