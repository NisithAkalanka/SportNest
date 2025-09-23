// File: frontend/src/pages/CoachDashboard.jsx (UPDATED WITH SUMMARY & CHART)

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/MemberAuthContext';

// 1. Import API function and Charting Components
import { getCoachFeedbackSummary } from '../api/feedbacks';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const CoachDashboard = () => {
    const { user } = useContext(AuthContext);
    const token = user?.token || user?.userInfo?.token;

    // 2. Add State for summary data, loading, and errors
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 3. Use useEffect to fetch summary data when the component loads
    useEffect(() => {
        const fetchSummary = async () => {
            if (!token) return; // Don't fetch if user is not logged in
            setLoading(true);
            try {
                const response = await getCoachFeedbackSummary(token);
                setSummary(response.data.data); // Backend wraps the response in a 'data' object
            } catch (err) {
                console.error("Failed to load summary:", err);
                setError("Could not load feedback summary. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [token]); // Re-run this effect if the user's token changes

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            
            {/* --- Welcome Part (This remains unchanged) --- */}
            <div>
                <h1 className="text-4xl font-bold mb-2">Welcome, Coach {user?.firstName || user?.userInfo?.firstName}!</h1>
                <p className="text-lg text-gray-600">This is your dashboard. Here you can manage your teams, schedules, and player progress.</p>
            </div>
            
            {/* --- Quick Actions Part (This remains unchanged) --- */}
            <Card className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold">Quick Actions</h2>
                <p className="mt-2 text-gray-500">Coach-specific features will be displayed here soon.</p>
            </Card>

            {/* ★★★ 4. NEW: Feedback Summary Section ★★★ */}
            <Card className="w-full shadow-lg border-t-4 border-t-slate-800">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-gray-700">Feedback At a Glance</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading && <p className="text-center text-gray-500 p-8">Loading feedback summary...</p>}
                    {error && <p className="text-center text-red-500 p-8">{error}</p>}
                    {summary && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                            
                            {/* Simple Stats Cards */}
                            <div className="lg:col-span-1 space-y-4">
                                <Card className="bg-slate-100">
                                    <CardHeader><CardTitle className="text-base font-medium">Total Feedbacks Given</CardTitle></CardHeader>
                                    <CardContent><p className="text-5xl font-bold text-slate-800">{summary.totalFeedbacks}</p></CardContent>
                                </Card>
                                <Card className="bg-slate-100">
                                    <CardHeader><CardTitle className="text-base font-medium">Average Player Rating</CardTitle></CardHeader>
                                    <CardContent><p className="text-5xl font-bold text-slate-800">{summary.averageRating} <span className="text-yellow-500">★</span></p></CardContent>
                                </Card>
                            </div>
                            
                            {/* Bar Chart */}
                            <div className="lg:col-span-2 bg-slate-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold mb-4 text-center text-gray-600">Rating Distribution</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={summary.chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="rating" />
                                        <YAxis allowDecimals={false} label={{ value: 'No. of Feedbacks', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip cursor={{fill: 'rgba(239, 246, 255, 0.7)'}} />
                                        <Bar dataKey="count" name="Count" fill="#2d3748" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default CoachDashboard;