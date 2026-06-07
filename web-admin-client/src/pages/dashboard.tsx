import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { MdPeople, MdLocalShipping, MdStars, MdTrendingUp } from 'react-icons/md';
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
        const res = await axios.get<SummaryData>('/dashboard-summary');
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch dashboard summary', error);
      }
    };
    fetchSummary();
  }, []);

  const stats = [
    { 
      label: 'Total Users', 
      value: data?.totalUsers ?? '...', 
      icon: React.createElement(MdPeople as any), 
      color: 'green',
      trend: '+12% from last month'
    },
    { 
      label: 'Pickup Requests', 
      value: data?.totalPickupRequests ?? '...', 
      icon: React.createElement(MdLocalShipping as any), 
      color: 'blue',
      trend: '+5% from last month'
    },
    { 
      label: 'Rewards Issued', 
      value: data?.totalRewardPoints ?? '...', 
      icon: React.createElement(MdStars as any), 
      color: 'amber',
      trend: '+18% from last month'
    },
    { 
      label: 'Active Sessions', 
      value: '42', 
      icon: React.createElement(MdTrendingUp as any), 
      color: 'indigo',
      trend: 'Live now'
    },
  ];

  return (
    <div className="dashboard-wrapper">
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">
              {stat.icon}
            </div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <h3 className="stat-value">{stat.value}</h3>
              <span className="stat-trend">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card main-chart">
          <div className="chart-header">
            <h3>Growth Overview</h3>
            <p>Monthly user and pickup statistics</p>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={mergeStats(data)} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                  }} 
                />
                <Bar dataKey="users" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="pickups" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card side-chart">
          <div className="chart-header">
            <h3>Activity Trend</h3>
            <p>Recent platform engagement</p>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={mergeStats(data)}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#22c55e" fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="activity-list">
              <div className="activity-item">
                <div className="dot green"></div>
                <span>New user registered</span>
                <span className="time">2m ago</span>
              </div>
              <div className="activity-item">
                <div className="dot blue"></div>
                <span>Pickup request accepted</span>
                <span className="time">15m ago</span>
              </div>
              <div className="activity-item">
                <div className="dot amber"></div>
                <span>Rewards redeemed</span>
                <span className="time">1h ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function mergeStats(data: SummaryData | null) {
  if (!data || !data.userStats || !data.pickupStats) return [];
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

  return Object.values(merged).sort((a, b) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.indexOf(a.month) - months.indexOf(b.month);
  });
}

export default Dashboard;
