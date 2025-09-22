// Frontend/src/pages/sports/NetballPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const NetballPage = () => {
    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="relative h-[50vh] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1594285882243-524734a7099a?q=80&w=1770&auto=format=fit=crop')" }}>
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <h1 className="text-5xl font-extrabold text-white">Netball at SportNest</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Teamwork, Strategy, and Energy</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Join the fast-growing netball community at SportNest! Our program is built on the principles of teamwork, strategic play, and high energy. We offer a supportive and competitive environment for players of all ages to develop their skills and passion for this exciting team sport.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Our Leagues & Training</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li><strong>NetSetGO Program:</strong> Ages 5-10, learning the basics in a fun way.</li>
                                <li><strong>Junior Leagues:</strong> Competitive leagues for U13, U15, and U17 age groups.</li>
                                <li><strong>Senior Social League:</strong> Mid-week social competitions for adults.</li>
                                <li><strong>Skills Workshops:</strong> Focus on shooting, defense, and mid-court strategy.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Our Courts</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>3 outdoor, all-weather netball courts</li>
                                <li>Professional goalposts and court markings</li>
                                <li>Ample spectator seating</li>
                                <li>Night-game floodlighting</li>
                                <li>Team clubhouse facilities</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="text-center bg-gray-50 p-8 rounded-lg">
                        <h2 className="text-2xl font-bold text-gray-800">Ready to Join a Team?</h2>
                        <p className="text-gray-600 my-4">Whether you're looking for a competitive league or social games, we have the right team for you.</p>
                        <Link to="/sports" className="inline-block bg-green-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-600 transition-colors">
                            Register for Netball
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

export default NetballPage;