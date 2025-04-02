import React from 'react';
import '../App.css';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-content">
      <h1>Welcome to the Admin Dashboard</h1>
      <p>This is where you can manage everything.</p>
      <div className="dashboard-cards">
        <div className="card">Total Users: 120</div>
        <div className="card">Pickup Requests: 80</div>
        <div className="card">Reward Points Given: 9500</div>
      </div>
    </div>
  );
};

export default Dashboard;