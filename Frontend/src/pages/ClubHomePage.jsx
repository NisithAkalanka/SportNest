// src/pages/ClubHomePage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
// වඩාත් ගැලපෙන අයිකන (icons) import කර ඇත.
import { FaInfoCircle, FaUserPlus, FaTrophy, FaHandshake } from 'react-icons/fa';

// වඩාත් ආකර්ෂණීය විස්තර සහ පසුබිම් පින්තූර සමඟ යාවත්කාලීන කරන ලද clubSections array එක.
const clubSections = [
    {
        title: "Our Story",
        description: "Discover the heart of SportNest. From our founding moments to our future ambitions, explore the story and values that define us.",
        link: "/about", // link එක එලෙසම පවතී
        icon: <FaInfoCircle />,
        // කරුණාකර මෙම placeholder පින්තූර, ඔබගේම උසස් තත්ත්වයේ පින්තූර වලින් ප්‍රතිස්ථාපනය කරන්න
        backgroundImage: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
    },
    {
        title: "Membership Plans",
        description: "Find the perfect fit. We offer a range of plans from student to lifetime member, each with unique benefits. Start your journey here.",
        link: "/membership-plans", // link එක එලෙසම පවතී
        icon: <FaUserPlus />,
        backgroundImage: "https://images.unsplash.com/photo-1556742212-5b321f3c261b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
    },
    {
        title: "Achievements", // 'Achievements' යන්න වඩාත් පැහැදිලි 'Member Portal' ලෙස වෙනස් කර ඇත
        description: "Manage your profile, view club achievements, and renew your membership with ease. Your personal hub awaits.",
        link: "/achievements",
        icon: <FaTrophy />, // අයිකනය වෙනස් කර ඇත
        backgroundImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
    },
     {
        title: "Sponsorship",
        description: "Elevate your brand and support our mission. We offer unique partnership opportunities that provide great visibility and community impact.",
        link: "/sponsorship",
        icon: <FaHandshake />,
        // ★★★ ඔබගේ screenshot එකේ නොපෙන්වූ sponsorship පින්තූරය මෙතැන නිවැරදිව එකතු කර ඇත ★★★
        backgroundImage: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
    }
];

const ClubHomePage = () => {
    return (
        // පිටුවට සියුම් පසුබිම් වර්ණයක් සහ වැඩි ඉඩක් ලබා දී ඇත
        <div className="bg-gray-50">
            <div className="container mx-auto py-16 px-4">
                {/* මාතෘකාව සහ විස්තරය එලෙසම තබා ඇත, නමුත් style වෙනස් කර ඇත */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Welcome to The Club</h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                        Everything you need to know about SportNest is right here. Choose an option below to explore and get started on your journey with us.
                    </p>
                </div>

                {/* නව පෙනුම සහිත, ආකර්ෂණීය කාඩ්පත් ව්‍යුහය */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {clubSections.map((section) => (
                        <Link 
                            to={section.link} 
                            key={section.title} // index වෙනුවට වඩාත් සුදුසු key එකක් ලෙස title යොදා ඇත
                            // Background image එක මෙතැනදී යොදා ඇත
                            style={{ backgroundImage: `url(${section.backgroundImage})` }}
                            // Tailwind CSS class යොදාගෙන සම්පූර්ණ නව පෙනුම සකසා ඇත
                            className="group relative flex flex-col h-72 rounded-xl shadow-lg overflow-hidden bg-cover bg-center text-white p-6 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl"
                        >
                            {/* පින්තූරයට උඩින් සියුම් අඳුරු layer එකක් (overlay) */}
                            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-60 transition-all duration-300"></div>
                            
                            {/* Content එක overlay එකට ඉහළින් පෙන්වීමට */}
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="text-4xl mb-4">
                                    {section.icon}
                                </div>
                                <h2 className="text-2xl font-bold">{section.title}</h2>
                                
                                {/* මෙම හිස් div එකෙන් විස්තරය පහළට තල්ලු කර ඇත */}
                                <div className="flex-grow"></div>
                                
                                <p className="text-sm opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 -translate-y-4 transition-all duration-300">
                                    {section.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default ClubHomePage;