import React from 'react';
import { Link } from 'react-router-dom';

const BadmintonPage = () => {
    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="relative h-[50vh] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1521587522402-a83a06f4e6e6?q=80&w=1770&auto=format&fit=crop')" }}>
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <h1 className="text-5xl font-extrabold text-white">Badminton at SportNest</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Agility, Speed, and Precision</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Experience the thrill of badminton at SportNest! Our indoor courts and specialized training programs are designed for players who love this fast-paced and dynamic sport. From powerful smashes to delicate drop shots, we help you master every aspect of the game.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Our Programs</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li><strong>Kids Shuttle Time:</strong> Fun and engaging sessions for children under 12.</li>
                                <li><strong>Adult Social Play:</strong> Friendly matches and social evenings for all levels.</li>
                                <li><strong>Competitive Training:</strong> Intensive drills and match-play for serious competitors.</li>
                                <li><strong>Cardio Badminton:</strong> A high-energy fitness class based on badminton footwork.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Our Facilities</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>5 BWF-approved synthetic indoor courts</li>
                                <li>Professional, non-slip flooring</li>
                                <li>Excellent lighting for clear visibility</li>
                                <li>Modern changing rooms and showers</li>
                                <li>On-site pro shop for equipment needs</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="text-center bg-gray-50 p-8 rounded-lg">
                        <h2 className="text-2xl font-bold text-gray-800">Ready for a Match?</h2>
                        <p className="text-gray-600 my-4">Our courts are waiting for you. Sign up for a program or book a court today!</p>
                        <Link to="/sports" className="inline-block bg-green-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-600 transition-colors">
                            Register for Badminton
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

export default BadmintonPage;