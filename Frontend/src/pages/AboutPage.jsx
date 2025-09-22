// Frontend/src/pages/AboutPage.jsx

import React from 'react';
import { FaBullseye, FaUsers, FaChartLine } from 'react-icons/fa';

const AboutPage = () => {
    return (
        <div className="bg-white">
            {/* 1. Hero Section with Background Image */}
            <div className="relative h-96 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1740&auto=format&fit=crop')" }}>
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <h1 className="text-5xl font-extrabold text-white">Our Story: The Heart of SportNest</h1>
                </div>
            </div>

            {/* 2. Main Content Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Introduction */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Forged in Passion, Driven by Community</h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            SportNest was born from a simple yet powerful idea: to create a premier destination where passion for sports meets a true sense of community. Founded in 2020 by a group of local sports enthusiasts, our club started as a small gathering on a rented field. Today, we have grown into a vibrant hub for athletes of all ages and skill levels, equipped with state-of-the-art facilities and a dedicated team. Our journey is a testament to the power of shared dreams and collective effort.
                        </p>
                    </div>

                    {/* Mission, Vision, and Values Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16 text-center">
                        <div className="p-6">
                            <FaBullseye className="text-5xl text-blue-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
                            <p className="text-gray-500">To provide outstanding facilities, expert coaching, and an inclusive environment that fosters athletic growth, sportsmanship, and lifelong friendships.</p>
                        </div>
                        <div className="p-6">
                            <FaUsers className="text-5xl text-green-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Our Community</h3>
                            <p className="text-gray-500">We are more than just a club; we are a family. We celebrate every victory, support each other through challenges, and work together to build a positive community legacy.</p>
                        </div>
                        <div className="p-6">
                            <FaChartLine className="text-5xl text-indigo-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
                            <p className="text-gray-500">To be the leading sports club in the region, recognized for developing top-tier talent and promoting health and wellness for all members of our community.</p>
                        </div>
                    </div>
                    
                    {/* Call to Action */}
                     <div className="text-center bg-gray-100 p-10 rounded-lg">
                        <h2 className="text-3xl font-bold text-gray-800">Become a Part of Our Story</h2>
                        <p className="text-gray-600 my-4">Whether you're a seasoned athlete or just starting out, there's a place for you at SportNest. Join us today and create your own chapter in our evolving story.</p>
                        <a href="/register" className="inline-block bg-green-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-600 transition-colors">
                            Join Now
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AboutPage;