"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      // Fix: Changed the relative URL to a full URL to fix the fetch error
      const res = await fetch(`${window.location.origin}/api/stats`);
      const data = await res.json();
      setStats(data);
    }
    fetchStats();
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl font-medium text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header Section */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">Admin Dashboard</h1>
      </header>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Total Users Card */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between transition-transform duration-300 transform hover:scale-105">
          <div>
            <p className="text-xl font-semibold text-gray-500">Total Users</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{stats.totalUsers}</p>
          </div>
          <span className="text-4xl text-blue-400">👨‍💼</span>
        </div>

        {/* Total Colleges Card */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between transition-transform duration-300 transform hover:scale-105">
          <div>
            <p className="text-xl font-semibold text-gray-500">Total Colleges</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{stats.totalColleges}</p>
          </div>
          <span className="text-4xl text-green-400">🏫</span>
        </div>

        {/* Forgery Cases Card */}
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between transition-transform duration-300 transform hover:scale-105">
          <div>
            <p className="text-xl font-semibold text-gray-500">Forgery Cases</p>
            <p className="text-4xl font-bold text-red-600 mt-2">{stats.forgeryCases}</p>
          </div>
          <span className="text-4xl text-red-400">🚨</span>
        </div>
      </div>

      {/* Forgery Trends Chart Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Forgery Trends</h2>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.forgeryTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" className="text-sm text-gray-500" />
              <YAxis className="text-sm text-gray-500" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
