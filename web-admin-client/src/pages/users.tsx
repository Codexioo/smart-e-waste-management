import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import '../styles/users.css';
import { MdVisibility, MdEdit, MdDelete, MdSearch, MdFilterList, MdRefresh } from 'react-icons/md';

const Users = () => {
  interface User {
    id: number;
    username: string;
    email: string;
    telephone: string;
    address: string;
    role: string;
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
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>User Management</h2>
        <div className="stats-badge" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--primary)', padding: '8px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '14px' }}>
          Total Users: {users.length}
        </div>
      </div>

      <div className="filters">
        <div style={{ position: 'relative', flex: 1 }}>
          {React.createElement(MdSearch as any, { style: { position: 'absolute', left: 12, top: 14, color: '#94a3b8' }, size: 20 })}
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 40, width: '100%' }}
          />
        </div>
        <div style={{ position: 'relative' }}>
          {React.createElement(MdFilterList as any, { style: { position: 'absolute', left: 12, top: 14, color: '#94a3b8' }, size: 20 })}
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ paddingLeft: 40 }}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="customer">Customer</option>
            <option value="collector">Collector</option>
          </select>
        </div>
        <button className="reset-btn" onClick={() => { setSearch(''); setRole(''); }}>
          {React.createElement(MdRefresh as any, { size: 20 })}
        </button>
      </div>

      <table className="request-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Telephone</th>
            <th>Role</th>
            <th>Points</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>#{user.id}</td>
              <td style={{ fontWeight: 700 }}>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.telephone}</td>
              <td>
                <span className={`badge ${user.role}`}>
                  {user.role}
                </span>
              </td>
              <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{user.total_reward_points}</td>
              <td>
                <div className="button-group">
                  <button className="display-btn" onClick={() => handleView(user.id)}>
                    {React.createElement(MdVisibility as any, { size: 16 })}
                  </button>
                  <button className="edit-btn" onClick={() => handleEdit(user.id)}>
                    {React.createElement(MdEdit as any, { size: 16 })}
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(user.id)}>
                    {React.createElement(MdDelete as any, { size: 16 })}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && selectedUser && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{isEditing ? 'Edit User Profile' : 'User Information'}</h3>

            <label>Full Name</label>
            <input
              value={selectedUser.username}
              onChange={(e) =>
                setSelectedUser((prev) => prev && { ...prev, username: e.target.value })
              }
              readOnly={!isEditing}
              className={!isEditing ? 'readonly-input' : ''}
            />

            <label>Email Address</label>
            <input
              value={selectedUser.email}
              onChange={(e) =>
                setSelectedUser((prev) => prev && { ...prev, email: e.target.value })
              }
              readOnly={!isEditing}
              className={!isEditing ? 'readonly-input' : ''}
            />

            <label>Telephone</label>
            <input
              value={selectedUser.telephone}
              onChange={(e) =>
                setSelectedUser((prev) => prev && { ...prev, telephone: e.target.value })
              }
              readOnly={!isEditing}
              className={!isEditing ? 'readonly-input' : ''}
            />

            <label>Address</label>
            <input
              value={selectedUser.address}
              onChange={(e) =>
                setSelectedUser((prev) => prev && { ...prev, address: e.target.value })
              }
              readOnly={!isEditing}
              className={!isEditing ? 'readonly-input' : ''}
            />

            <div className="modal-actions">
              {isEditing ? (
                <>
                  <button onClick={handleSave}>Save Changes</button>
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
