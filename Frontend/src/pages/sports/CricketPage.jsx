import React from 'react';
import { Link } from 'react-router-dom';

const CricketPage = () => {
    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="relative h-[50vh] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1593341646782-e02371a37a89?q=80&w=1770&auto=format&fit=crop')" }}>
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <h1 className="text-5xl font-extrabold text-white">Cricket at SportNest</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Embrace the Spirit of the Game</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Welcome to the SportNest Cricket Academy, a hub for cricket enthusiasts of all ages. Whether you dream of hitting a six over the boundary or delivering the perfect googly, our high-performance center offers everything you need to excel. Join us to train, compete, and share your passion for the gentleman's game.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Training Programs</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li><strong>Junior Cricketers:</strong> Ages 8-15, focusing on basic batting, bowling, and fielding skills.</li>
                                <li><strong>Weekend Warriors:</strong> Intensive net sessions and practice matches for adults.</li>
                                <li><strong>Elite Squad:</strong> Specialized coaching for advanced players targeting professional leagues.</li>
                                <li><strong>Spin & Pace Clinics:</strong> Dedicated sessions to master your bowling technique.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Our Facilities</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>3 Full-sized turf wickets</li>
                                <li>5 AstroTurf practice nets</li>
                                <li>Professional bowling machines (BOLA)</li>
                                <li>Video analysis and performance tracking tools</li>
                                <li>Well-equipped player pavilion</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="text-center bg-gray-50 p-8 rounded-lg">
                        <h2 className="text-2xl font-bold text-gray-800">Ready to Take the Field?</h2>
                        <p className="text-gray-600 my-4">Join our prestigious cricket program. Register now to book your spot for the upcoming season.</p>
                        <Link to="/sports" className="inline-block bg-green-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-600 transition-colors">
                            Register for Cricket
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

export default CricketPage;