import React from 'react';
import { Link } from 'react-router-dom';
import { FaInfoCircle, FaUserPlus, FaSyncAlt, FaHandsHelping } from 'react-icons/fa';

const clubSections = [
    {
        title: "About Us",
        description: "Learn about our club's rich history, our mission, and the values that drive our community.",
        link: "/about",
        icon: <FaInfoCircle />,
        color: "bg-blue-500",
        hoverColor: "hover:bg-blue-600"
    },
    {
        title: "Membership Plans",
        description: "Ready to join? Explore our membership plans and become a part of the SportNest family today.",
        link: "/membership",
        icon: <FaUserPlus />,
        color: "bg-green-500",
        hoverColor: "hover:bg-green-600"
    },
    {
        title: "Achiements",
        description: "Continue your journey with us. Renew your existing membership quickly and easily.",
        link: "/renew-membership",
        icon: <FaSyncAlt />,
        color: "bg-yellow-500",
        hoverColor: "hover:bg-yellow-600"
    },
    {
        title: "Sponsorship",
        description: "Partner with us and make a difference. Discover our sponsorship packages and benefits.",
        link: "/sponsorship",
        icon: <FaHandsHelping />,
        color: "bg-purple-500",
        hoverColor: "hover:bg-purple-600"
    }
];

const ClubHomePage = () => {
    return (
        <div className="container mx-auto my-10 px-4">
            <div className="text-center mb-16">
                <h1 className="text-5xl font-extrabold text-gray-800 mb-4">Welcome to The Club</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Everything you need to know about SportNest is right here. Choose an option below to get started.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {clubSections.map((section, index) => (
                    <Link to={section.link} key={index} 
                          className={`club-card ${section.color} ${section.hoverColor}`}>
                        <div className="text-6xl mb-4">
                            {section.icon}
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
                        <p className="text-sm">{section.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};
export default ClubHomePage;