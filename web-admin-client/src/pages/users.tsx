import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import '../styles/users.css';

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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleView = (id: number) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setSelectedUser(user);
      setIsEditing(false);
      setIsModalOpen(true);
    }
  };

  const handleEdit = (id: number) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setSelectedUser(user);
      setIsEditing(true);
      setIsModalOpen(true);
    }
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

  const handleSave = async () => {
    if (!selectedUser) return;
    try {
      await axios.put(`/users/${selectedUser.id}`, selectedUser);
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? selectedUser : u))
      );
      alert('User updated successfully');
      setIsModalOpen(false);
    } catch (err) {
      alert('Failed to update user');
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
        <button className="reset-btn" onClick={() => { setSearch(''); setRole(''); }}>
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
              <div className="button-group">
                <button className="display-btn" onClick={() => handleView(user.id)}>View</button>
                <button className="edit-btn" onClick={() => handleEdit(user.id)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(user.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && selectedUser && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{isEditing ? 'Edit User' : 'User Details'}</h3>

            <label>Username:</label>
            {isEditing ? (
              <input
                value={selectedUser.username}
                onChange={(e) =>
                  setSelectedUser((prev) => prev && { ...prev, username: e.target.value })
                }
              />
            ) : (
              <input
              value={selectedUser.username}
              readOnly
              className="readonly-input"
              />

            )}

            <label>Email:</label>
            {isEditing ? (
              <input
                value={selectedUser.email}
                onChange={(e) =>
                  setSelectedUser((prev) => prev && { ...prev, email: e.target.value })
                }
              />
            ) : (
              <input
              value={selectedUser.email}
              readOnly
              className="readonly-input"
              />
            )}

            <label>Telephone:</label>
            {isEditing ? (
              <input
                value={selectedUser.telephone}
                onChange={(e) =>
                  setSelectedUser((prev) => prev && { ...prev, telephone: e.target.value })
                }
              />
            ) : (
              <input
              value={selectedUser.telephone}
              readOnly
              className="readonly-input"
              />
            )}

            <label>Address:</label>
            {isEditing ? (
              <input
                value={selectedUser.address}
                onChange={(e) =>
                  setSelectedUser((prev) => prev && { ...prev, address: e.target.value })
                }
              />
            ) : (
              <input
              value={selectedUser.address}
              readOnly
              className="readonly-input"
              />
            )}

            <label>Role:</label>
            <input
              value={selectedUser.role}
              readOnly
              className="readonly-input"
              />

            <div className="modal-actions">
              {isEditing ? (
                <>
                  <button onClick={handleSave}>Save</button>
                  <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                </>
              ) : (
                <button onClick={() => setIsModalOpen(false)}>Close</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
