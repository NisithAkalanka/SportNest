// Frontend/src/pages/sports/TennisPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const TennisPage = () => {
    return (
        <div className="bg-gray-100 min-h-screen">
            {/* 1. Hero Section */}
            <div className="relative h-[50vh] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542319410-677c1b505501?q=80&w=1769&auto=format&fit=crop')" }}>
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <h1 className="text-5xl font-extrabold text-white">Tennis at SportNest</h1>
                </div>
            </div>

            {/* 2. Main Content */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
                    {/* Introduction */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Master the Court</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Welcome to the SportNest Tennis Program! Whether you're picking up a racket for the first time or aiming to perfect your professional serve, our world-class facilities and expert coaching staff are here to guide you. Join our vibrant tennis community and take your game to the next level.
                        </p>
                    </div>

                    {/* Program Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Coaching Programs</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li><strong>Junior Development:</strong> Ages 6-16, focusing on fundamentals.</li>
                                <li><strong>Adult Beginners:</strong> Learn the basics of grip, swing, and scoring.</li>
                                <li><strong>Intermediate Drills:</strong> For players looking to improve consistency and strategy.</li>
                                <li><strong>Advanced Squads:</strong> High-performance training for competitive players.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Our Facilities</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>4 Professional Hard Courts</li>
                                <li>2 Clay Courts for authentic Grand Slam practice</li>
                                <li>Advanced Ball Machines for solo practice</li>
                                <li>Floodlights for night-time play</li>
                                <li>Player's lounge and refreshment area</li>
                            </ul>
                        </div>
                    </div>
                    
                    {/* Call to Action */}
                    <div className="text-center bg-gray-50 p-8 rounded-lg">
                        <h2 className="text-2xl font-bold text-gray-800">Ready to Play?</h2>
                        <p className="text-gray-600 my-4">Spaces are limited. Register now to secure your spot in our renowned tennis programs.</p>
                        <Link to="/sports" className="inline-block bg-green-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-600 transition-colors">
                            Register for Tennis
                        </Link>
                        <Link to="/sports" className="inline-block bg-gray-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-700 transition-colors">
        &larr; Back to All Sports
    </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TennisPage;