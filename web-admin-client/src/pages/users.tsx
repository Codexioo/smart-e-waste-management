// src/pages/users.tsx
import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import '../styles/requests.css';

const Users = () => {
  interface User {
    id: number;
    username: string;
    email: string;
    telephone: string;
    address: string;
    role: string;
    otp_verified: boolean;
    total_reward_points: number;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    axios
      .get('/users')
      .then((res) => setUsers(res.data))
      .catch((err) => console.error('❌ Failed to load users:', err));
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !role || user.role === role;
    return matchesSearch && matchesRole;
  });

  const handleEdit = (id: number) => {
    alert(`Edit user ID: ${id}`);
  };

  const handleDelete = (id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (confirmDelete) {
      axios
        .delete(`/users/${id}`)
        .then(() => {
          setUsers((prev) => prev.filter((u) => u.id !== id));
          alert('User deleted');
        })
        .catch((err) => alert('Failed to delete user'));
    }
  };

  return (
    <div className="admin-requests">
      <h2 className="page-title">All Users</h2>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="customer">Customer</option>
          <option value="collector">Collector</option>
        </select>
        <button
          className="reset-btn"
          onClick={() => {
            setSearch('');
            setRole('');
          }}
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <table className="request-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Telephone</th>
            <th>Address</th>
            <th>Role</th>
            <th>OTP Verified</th>
            <th>Reward Points</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.telephone}</td>
              <td>{user.address}</td>
              <td>{user.role}</td>
              <td>{user.otp_verified ? '✅' : '❌'}</td>
              <td>{user.total_reward_points}</td>
              <td>
                <button onClick={() => handleEdit(user.id)}>Edit</button>
                <button className="danger" onClick={() => handleDelete(user.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
