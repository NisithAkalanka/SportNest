// Frontend/src/pages/CoachDashboard.jsx
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
} from "recharts";

// Emerald-first palette
const COLORS = ["#10B981", "#2563EB", "#F59E0B"]; // emerald, blue, amber

const CoachDashboard = () => {
  const { user } = useContext(AuthContext);

  const [summary, setSummary] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    avgAttendance: 0,
    trend: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch summary from backend
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError("");
        const config = user?.token
          ? { headers: { Authorization: `Bearer ${user.token}` } }
          : undefined;
        const { data } = await axios.get("/api/trainings/coach/summary", config);

        // guard against bad shapes
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
          err?.response?.data?.error ||
            err?.message ||
            "Failed to load coach summary"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [user]);

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
            Welcome, Coach {user?.firstName || "Coach"}!
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
            <p className="text-3xl font-bold text-emerald-600 mt-1">
              {summary.upcoming}
            </p>
          </div>
          <div className="bg-white shadow-sm rounded-2xl p-5 ring-1 ring-slate-200">
            <h3 className="text-sm font-medium text-slate-600">Completed</h3>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {summary.completed}
            </p>
          </div>
          <div className="bg-white shadow-sm rounded-2xl p-5 ring-1 ring-slate-200">
            <h3 className="text-sm font-medium text-slate-600">Avg Attendance</h3>
            <p className="text-3xl font-bold text-amber-600 mt-1">
              {summary.avgAttendance}%
            </p>
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
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
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

        {loading && (
          <div className="text-sm text-slate-600">Loading dashboard…</div>
        )}
      </div>
    </div>
  );
};

export default CoachDashboard;
