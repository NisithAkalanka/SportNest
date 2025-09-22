// Frontend/src/pages/CoachDashboard.jsx

import React, { useContext } from 'react';
import { AuthContext } from '../context/MemberAuthContext'; // එකම AuthContext එක භාවිතා කරයි

const CoachDashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-4xl font-bold mb-4">Welcome, Coach {user?.firstName}!</h1>
            <p className="text-lg text-gray-600">This is your dashboard. Here you can manage your teams, training schedules, and player progress.</p>
            
            {/* ඔබට අවශ්‍ය නම්, Coach-specific components මෙහි එකතු කළ හැක */}
            <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold">Quick Actions</h2>
                <p className="mt-2">Coach-specific features will be displayed here soon.</p>
            </div>
        </div>
    );
};

export default CoachDashboard;