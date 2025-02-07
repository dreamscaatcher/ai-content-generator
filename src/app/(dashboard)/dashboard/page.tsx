'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  contentGenerated: number;
  apiCallsRemaining: number;
  savedContents: number;
  averageLength: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    contentGenerated: 0,
    apiCallsRemaining: 0,
    savedContents: 0,
    averageLength: 0
  });

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        if (response.ok) {
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Content Generated</h3>
          <p className="text-2xl font-bold">{stats.contentGenerated}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">API Calls Remaining</h3>
          <p className="text-2xl font-bold">{stats.apiCallsRemaining}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Saved Contents</h3>
          <p className="text-2xl font-bold">{stats.savedContents}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Average Length</h3>
          <p className="text-2xl font-bold">{stats.averageLength}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/dashboard/content/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Create New Content
          </Link>
          <Link 
            href="/dashboard/content"
            className="bg-white text-gray-700 px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            View All Content
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {/* Placeholder for recent activity */}
          <p className="text-gray-500">No recent activity</p>
        </div>
      </div>
    </div>
  );
}