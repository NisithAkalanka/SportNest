// Frontend/src/components/layout/CoachLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import CoachNavbar from './CoachNavbar'; // අප සෑදූ නව Navbar එක import කරගැනීම

const CoachLayout = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <CoachNavbar />
            <main>
                <div className="py-8">
                    {/* Coach ට අදාළ සියලුම Routes මෙහිදී දර්ශනය වේ */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default CoachLayout;