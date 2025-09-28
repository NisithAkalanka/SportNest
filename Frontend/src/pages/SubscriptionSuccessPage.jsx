// Frontend/src/pages/SubscriptionSuccessPage.jsx

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaCreditCard, FaUser } from 'react-icons/fa';

const SubscriptionSuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // ConfirmMembershipPage එකෙන් එවන දත්ත ලබාගැනීම
    const { planName, membershipId } = location.state || {};

    // දත්ත නොමැතිව යමෙක් මෙම පිටුවට කෙලින්ම පිවිසියහොත්
    if (!planName || !membershipId) {
        return (
            <div className="text-center p-10">
                <h1 className="text-2xl font-bold">Oops! Something went wrong.</h1>
                <p className="mt-2">We couldn't find your subscription details.</p>
                <Link to="/membership-plans" className="mt-4 inline-block bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
                    Back to Plans
                </Link>
            </div>
        );
    }

    const handlePayNow = () => {
        // Membership payment page එකට redirect කිරීම
        navigate('/membership-payment', {
            state: {
                planName,
                membershipId,
                planPrice: getPlanPrice(planName)
            }
        });
    };

    const getPlanPrice = (planName) => {
        const prices = {
            'Student Membership': 500,
            'Ordinary Membership': 1500,
            'Life Membership': 10000
        };
        return prices[planName] || 0;
    };

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 text-center">
                <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-800">Subscription Confirmed!</h1>
                <p className="text-gray-600 mt-2">
                    You have successfully subscribed to the <strong>{planName}</strong> plan.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mt-6">
                    <p className="text-sm text-gray-500">Your New Membership ID is:</p>
                    <p className="text-xl font-mono font-bold tracking-wider">{membershipId}</p>
                </div>

                <div className="mt-8 space-y-4">
                    <div className="flex gap-4">
                        <button 
                            onClick={() => navigate('/member-dashboard')} 
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FaUser />
                            User
                        </button>
                        <button 
                            onClick={handlePayNow} 
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FaCreditCard />
                            Pay Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionSuccessPage;