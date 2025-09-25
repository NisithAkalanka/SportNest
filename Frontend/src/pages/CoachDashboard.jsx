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

const COLORS = ["#2563eb", "#16a34a", "#f97316"]; // Pie chart colors

const CoachDashboard = () => {
  const { user } = useContext(AuthContext);

  const [summary, setSummary] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    avgAttendance: 0,
    trend: [],
  });

  // Fetch summary from backend
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get("/api/trainings/coach/summary", config);
        setSummary(data);
      } catch (err) {
        console.error("Failed to fetch summary", err);
      }
    };
    if (user?.token) fetchSummary();
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
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-2">
        Welcome, Coach {user?.firstName || "Coach"}!
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        This is your dashboard. Here you can manage your teams, training
        schedules, and player progress.
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h3 className="text-sm font-medium text-gray-500">Total Sessions</h3>
          <p className="text-2xl font-bold">{summary.total}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h3 className="text-sm font-medium text-gray-500">Upcoming</h3>
          <p className="text-2xl font-bold text-blue-600">
            {summary.upcoming}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h3 className="text-sm font-medium text-gray-500">Completed</h3>
          <p className="text-2xl font-bold text-green-600">
            {summary.completed}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 text-center">
          <h3 className="text-sm font-medium text-gray-500">Avg Attendance</h3>
          <p className="text-2xl font-bold text-orange-600">
            {summary.avgAttendance}%
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Sessions Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Sessions Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="bg-white p-6 rounded-lg shadow col-span-1 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Attendance Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={summary.trend || []}>
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
              <Tooltip formatter={(val) => `${val}%`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="attendance"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;
