import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';
import '../styles/Dashboard.css';

interface SummaryData {
  totalUsers: number;
  totalPickupRequests: number;
  totalRewardPoints: number;
  userStats: { month: string; count: number }[];
  pickupStats: { month: string; count: number }[];
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<SummaryData | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get<SummaryData>('http://localhost:9091/api/dashboard-summary');
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch dashboard summary', error);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="dashboard-wrapper">
      <h2 className="dashboard-title">Dashboard Overview</h2>
      <p className="dashboard-subtitle">Last 24 Hours Platform Activity</p>

      <div className="dashboard-cards">
        <div className="dashboard-card green">
          <div className="value">{data?.totalUsers ?? '...'}</div>
          <div className="label">New Users</div>
        </div>
        <div className="dashboard-card blue">
          <div className="value">{data?.totalPickupRequests ?? '...'}</div>
          <div className="label">Pickup Requests</div>
        </div>
        <div className="dashboard-card gray">
          <div className="value">{data?.totalRewardPoints ?? '...'}</div>
          <div className="label">Reward Points Given</div>
        </div>
      </div>

      <div className="chart-container">
        <h3>Monthly Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mergeStats(data)}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <CartesianGrid strokeDasharray="3 3" />
            <Bar dataKey="users" fill="#4caf50" />
            <Bar dataKey="pickups" fill="#2196f3" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Helper: merge stats by month
function mergeStats(data: SummaryData | null) {
  if (!data) return [];
  const merged: Record<string, any> = {};

  data.userStats.forEach(item => {
    merged[item.month] = { month: item.month, users: item.count, pickups: 0 };
  });

  data.pickupStats.forEach(item => {
    if (merged[item.month]) {
      merged[item.month].pickups = item.count;
    } else {
      merged[item.month] = { month: item.month, users: 0, pickups: item.count };
    }
  });

  return Object.values(merged);
}

export default Dashboard;