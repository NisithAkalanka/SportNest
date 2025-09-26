// Frontend/src/pages/CoachDashboard.jsx — MERGED CLEAN VERSION
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/MemberAuthContext";
import axios from "axios";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { getCoachFeedbackSummary } from "../api/feedbacks";

// Emerald-first palette
const COLORS = ["#10B981", "#2563EB", "#F59E0B"]; // emerald, blue, amber

const CoachDashboard = () => {
  const { user } = useContext(AuthContext);
  const token = user?.token || user?.userInfo?.token;

  // ---- Training summary state ----
  const [summary, setSummary] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    avgAttendance: 0,
    trend: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---- Feedback summary state ----
  const [fb, setFb] = useState(null); // { totalFeedbacks, averageRating, chartData }
  const [fbLoading, setFbLoading] = useState(true);
  const [fbError, setFbError] = useState("");

  // Fetch training summary
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError("");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
        const { data } = await axios.get("/api/trainings/coach/summary", config);
        setSummary({
          total: Number(data?.total) || 0,
          upcoming: Number(data?.upcoming) || 0,
          completed: Number(data?.completed) || 0,
          avgAttendance: Number(data?.avgAttendance) || 0,
          trend: Array.isArray(data?.trend) ? data.trend : [],
        });
      } catch (err) {
        console.error("Failed to fetch summary", err);
        setError(
          err?.response?.data?.error || err?.message || "Failed to load coach summary"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [token]);

  // Fetch feedback summary (ratings distribution)
  useEffect(() => {
    const loadFb = async () => {
      if (!token) { setFbLoading(false); return; }
      try {
        setFbLoading(true);
        setFbError("");
        const res = await getCoachFeedbackSummary(token);
        // some backends use { data: { data: {...} } }
        const payload = res?.data?.data || res?.data || null;
        setFb(payload);
      } catch (e) {
        console.error("Failed to load feedback summary", e);
        setFbError("Could not load feedback summary.");
      } finally {
        setFbLoading(false);
      }
    };
    loadFb();
  }, [token]);

  const barData = [
    { name: "Total", value: summary.total },
    { name: "Upcoming", value: summary.upcoming },
    { name: "Completed", value: summary.completed },
  ];

  const pieData = [
    { name: "Upcoming", value: summary.upcoming },
    { name: "Completed", value: summary.completed },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header band */}
      <div className="bg-[#0D1B2A] text-white border-b border-white/10">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Welcome, Coach {user?.firstName || user?.userInfo?.firstName || "Coach"}!
          </h1>
          <p className="text-white/80 mt-1">
            Manage teams, training schedules, and player progress at a glance.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white shadow-sm rounded-2xl p-5 ring-1 ring-slate-200">
            <h3 className="text-sm font-medium text-slate-600">Total Sessions</h3>
            <p className="text-3xl font-bold text-slate-900 mt-1">{summary.total}</p>
          </div>
          <div className="bg-white shadow-sm rounded-2xl p-5 ring-1 ring-slate-200">
            <h3 className="text-sm font-medium text-slate-600">Upcoming</h3>
            <p className="text-3xl font-bold text-emerald-600 mt-1">{summary.upcoming}</p>
          </div>
          <div className="bg-white shadow-sm rounded-2xl p-5 ring-1 ring-slate-200">
            <h3 className="text-sm font-medium text-slate-600">Completed</h3>
            <p className="text-3xl font-bold text-blue-600 mt-1">{summary.completed}</p>
          </div>
          <div className="bg-white shadow-sm rounded-2xl p-5 ring-1 ring-slate-200">
            <h3 className="text-sm font-medium text-slate-600">Avg Attendance</h3>
            <p className="text-3xl font-bold text-amber-600 mt-1">{summary.avgAttendance}%</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold mb-4">Sessions Overview</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold mb-4">Sessions Distribution</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200 col-span-1 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Attendance Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={summary.trend || []}>
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                <Tooltip formatter={(val) => `${val}%`} />
                <Legend />
                <Line type="monotone" dataKey="attendance" stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback Summary */}
        <Card className="w-full shadow-lg border-t-4 border-t-slate-800">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-700">Feedback At a Glance</CardTitle>
            <CardDescription>Recent player ratings & distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {fbLoading && <p className="text-center text-gray-500 p-8">Loading feedback summary...</p>}
            {fbError && <p className="text-center text-red-500 p-8">{fbError}</p>}
            {!fbLoading && !fbError && fb && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                {/* Simple Stats Cards */}
                <div className="lg:col-span-1 space-y-4">
                  <Card className="bg-slate-100">
                    <CardHeader>
                      <CardTitle className="text-base font-medium">Total Feedbacks Given</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-5xl font-bold text-slate-800">{fb.totalFeedbacks ?? 0}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-100">
                    <CardHeader>
                      <CardTitle className="text-base font-medium">Average Player Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-5xl font-bold text-slate-800">
                        {fb.averageRating ?? "-"} <span className="text-yellow-500">★</span>
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Bar Chart: Rating Distribution */}
                <div className="lg:col-span-2 bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-center text-gray-600">Rating Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={fb.chartData || []} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="rating" />
                      <YAxis allowDecimals={false} label={{ value: 'No. of Feedbacks', angle: -90, position: 'insideLeft' }} />
                      <Tooltip cursor={{ fill: 'rgba(239, 246, 255, 0.7)' }} />
                      <Bar dataKey="count" name="Count" fill="#2d3748" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {loading && (
          <div className="text-sm text-slate-600 mt-6">Loading dashboard…</div>
        )}
      </div>
    </div>
  );
};

export default CoachDashboard;
