// Frontend/src/pages/HomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FaFutbol, FaTrophy, FaUsers } from 'react-icons/fa';

// --- Features Section සඳහා වන දත්ත (වෙනසක් නැත) ---
const features = [
    {
        icon: <FaFutbol className="text-4xl text-white" />,
        title: "Explore Our Sports",
        description: "From tennis to swimming, find the perfect sport that fits your passion. We offer programs for all skill levels.",
        link: "/sports",
        linkText: "View Sports"
    },
    {
        icon: <FaUsers className="text-4xl text-white" />,
        title: "Join The Club",
        description: "Become a part of our vibrant community. Discover our membership plans and enjoy exclusive benefits.",
        link: "/club",
        linkText: "Learn More"
    },
    {
        icon: <FaTrophy className="text-4xl text-white" />,
        title: "Events & Tournaments",
        description: "Stay updated with our latest events, tournaments, and training sessions. There's always something happening!",
        link: "/events",
        linkText: "See Events"
    }
];


const HomePage = () => {
    return (
        <div className="text-gray-800">
            
            {/* ★★★ 1. පසුබිම් පින්තූරය අලුත් එකකින් යාවත්කාලීන කර ඇත ★★★ */}
            <div 
                className="relative h-screen flex items-center justify-center text-center bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541252260730-0412e8e2108e?q=80&w=1854&auto=format&fit=crop')" }}
            >
                {/* පින්තූරයට උඩින් සියුම් අඳුරු layer එකක් (overlay) */}
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>

                {/* Hero Section එකේ Content එක (වෙනසක් නැත) */}
                <div className="relative z-10 px-4">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-4 animate-fade-in-down">
                        Welcome to SportNest
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto animate-fade-in-up">
                        Your all-in-one club management solution. Join a community of athletes and enthusiasts to achieve greatness together.
                    </p>
                    <div className="space-x-4">
                        <Link 
                            to="/register"
                            className="bg-green-500 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-green-600 transition-transform transform hover:scale-105"
                        >
                            Get Started
                        </Link>
                        <Link 
                            to="/club"
                            className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-white hover:text-black transition-all"
                        >
                            The Club
                        </Link>
                    </div>
                </div>
            </div>

            {/* --- 2. Features Section (පෙර පරිදිම, වෙනසක් නැත) --- */}
            <div className="bg-white py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold">Why Choose SportNest?</h2>
                        <p className="text-gray-600 mt-2">We provide the best platform for your sporting journey.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature) => (
                            <div key={feature.title} className="bg-gray-800 text-white p-8 rounded-xl shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300">
                                <div className="bg-gray-700 w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                                <p className="text-gray-300 mb-6">{feature.description}</p>
                                <Link 
                                    to={feature.link} 
                                    className="text-green-400 font-semibold hover:text-green-300 transition-colors"
                                >
                                    {feature.linkText} &rarr;
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;