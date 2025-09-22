// Frontend/src/pages/sports/SwimmingPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const SwimmingPage = () => {
    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="relative h-[50vh] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1563232239-4458428587d8?q=80&w=1931&auto=format=fit=crop')" }}>
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <h1 className="text-5xl font-extrabold text-white">Swimming at SportNest</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Dive into Excellence</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Discover the joy of swimming with SportNest Aquatics. Our state-of-the-art swimming complex provides a safe, clean, and inspiring environment for swimmers of all abilities. From learning to float to training for competitive meets, our certified instructors are dedicated to helping you achieve your goals in the water.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Swim Programs</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li><strong>Learn to Swim:</strong> Water confidence and safety for all ages, starting from 3 years old.</li>
                                <li><strong>Stroke Correction:</strong> Perfect your freestyle, backstroke, breaststroke, and butterfly.</li>
                                <li><strong>Squad Training:</strong> Competitive training for local, regional, and national level swimmers.</li>
                                <li><strong>Aqua Aerobics:</strong> A low-impact, high-energy workout for adults.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Our Pool Complex</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>25m, 8-lane heated indoor lap pool</li>
                                <li>Heated hydrotherapy and leisure pool</li>
                                <li>Advanced water purification system</li>
                                <li>Spacious, modern changing rooms</li>
                                <li>On-deck spectator viewing area</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="text-center bg-gray-50 p-8 rounded-lg">
                        <h2 className="text-2xl font-bold text-gray-800">Ready to Make a Splash?</h2>
                        <p className="text-gray-600 my-4">Our programs fill up quickly. Register now to secure your lane!</p>
                        <Link to="/sports" className="inline-block bg-green-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-600 transition-colors">
                            Register for Swimming
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

export default SwimmingPage;