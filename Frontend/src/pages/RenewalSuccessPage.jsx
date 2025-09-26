import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa'; // Icon එකක් import කරගන්නවා

const RenewalSuccessPage = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
            <div className="max-w-lg w-full text-center bg-white p-10 rounded-xl shadow-lg">
                <div className="flex justify-center mb-4">
                    {/* සාර්ථක බව පෙන්වන Icon එක */}
                    <FaCheckCircle className="text-green-500 text-6xl" />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                    Renewal Request Submitted!
                </h1>
                <p className="text-gray-600 mb-8">
                    Your membership renewal details have been successfully submitted. Please proceed to payment to complete the process and activate your plan.
                </p>
                
                {/* ★★★ Payment එකට යන්න Button එක ★★★ */}
                <button
                    onClick={() => navigate('/payment')} // Payment page එකට navigate කරනවා
                    className="w-full max-w-xs mx-auto flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Proceed to Payment
                </button>
            </div>
        </div>
    );
};

export default RenewalSuccessPage;