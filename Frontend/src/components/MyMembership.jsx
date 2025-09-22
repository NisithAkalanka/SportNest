import React from 'react';
import { Link } from 'react-router-dom';

// මෙම currentPlan දත්ත backend එකෙන් ලබාගත යුතුය. 
// දැනට අපි උදාහරණයක් ලෙස මෙය භාවිතා කරමු.
const MyMembership = ({ currentPlan = { name: 'Ordinary Membership', expiryDate: '2026-09-17' } }) => {
    
    if (!currentPlan) {
        return (
             <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <h3 className="text-xl font-semibold mb-2">No Active Membership</h3>
                <p className="text-gray-600 mb-4">You do not have an active membership plan.</p>
                <Link to="/membership-plans" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Explore Plans
                </Link>
            </div>
        )
    }

    const handleDelete = () => {
        if(window.confirm('Are you sure you want to cancel your membership? This action cannot be undone.')) {
            console.log('Deleting membership...');
            // මෙතැනදී Backend එකට API call එකක් යැවිය යුතුය
            // උදා: axios.delete('/api/membership/cancel');
            alert('Your membership has been cancelled.');
        }
    }
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">My Current Plan</h3>
            <div className="border-t pt-4">
                <p className="text-2xl font-bold text-green-600">{currentPlan.name}</p>
                <p className="text-gray-500">Expires on: {currentPlan.expiryDate}</p>

                <div className="flex gap-4 mt-6">
                    {/* සාමාජිකත්වය Edit කිරීම යනු වෙනත් Plan එකක් තේරීමයි */}
                    <Link to="/membership-plans" className="flex-1 text-center px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600">
                        Switch Plan
                    </Link>
                    <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600">
                        Cancel Membership
                    </button>
                </div>
            </div>
        </div>
    );
};