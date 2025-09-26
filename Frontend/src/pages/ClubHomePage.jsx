import React from 'react';
import { Link } from 'react-router-dom';
// 'Renew Membership' සඳහා FaSyncAlt අයිකනය අලුතෙන් import කර ඇත.
import { FaInfoCircle, FaUserPlus, FaTrophy, FaHandshake, FaSyncAlt } from 'react-icons/fa';

// clubSections array එකට "Renew Membership" එකතු කර ඇත.
const clubSections = [
    {
        title: "Our Story",
        description: "Discover the heart of SportNest. From our founding moments to our future ambitions, explore the story and values that define us.",
        link: "/about",
        icon: <FaInfoCircle />,
        backgroundImage: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
    },
    {
        title: "Membership Plans",
        description: "Find the perfect fit. We offer a range of plans from student to lifetime member, each with unique benefits. Start your journey here.",
        link: "/membership-plans",
        icon: <FaUserPlus />,
        backgroundImage: "https://images.unsplash.com/photo-1556742212-5b321f3c261b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
    },
    // ★★★ මෙතැන අලුතෙන් "Renew Membership" Card එක එකතු කර ඇත ★★★
    {
        title: "Renew Membership",
        description: "Renew your existing membership plan here and continue enjoying exclusive benefits without interruption.",
        link: "/renew-membership", // RenewPage එකට යන link එක
        icon: <FaSyncAlt />, // අලුත් අයිකනය
        backgroundImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
    },
    {
        title: "Achievements",
        description: "Manage your profile, view club achievements, and access member-exclusive content. Your personal hub awaits.",
        link: "/achievements",
        icon: <FaTrophy />,
        backgroundImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
    },
     {
        title: "Sponsorship",
        description: "Elevate your brand and support our mission. We offer unique partnership opportunities that provide great visibility and community impact.",
        link: "/sponsorship",
        icon: <FaHandshake />,
        backgroundImage: "https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
    }
];

const ClubHomePage = () => {
    return (
        <div className="bg-gray-50">
            <div className="container mx-auto py-16 px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Welcome to The Club</h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                        Everything you need to know about SportNest is right here. Choose an option below to explore and get started on your journey with us.
                    </p>
                </div>

                {/* Card ව්‍යුහය grid-cols-5 ලෙස වෙනස් කර, සියලුම cards එක පේළියක පෙන්වීමට සලස්වා ඇත */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {clubSections.map((section) => (
                        <Link 
                            to={section.link} 
                            key={section.title}
                            style={{ backgroundImage: `url(${section.backgroundImage})` }}
                            className="group relative flex flex-col h-72 rounded-xl shadow-lg overflow-hidden bg-cover bg-center text-white p-6 transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-60 transition-all duration-300"></div>
                            
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="text-4xl mb-4">
                                    {section.icon}
                                </div>
                                <h2 className="text-2xl font-bold">{section.title}</h2>
                                
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