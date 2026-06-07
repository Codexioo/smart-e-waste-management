import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import '../styles/assignCollector.css';
import { MdAssignmentInd, MdPerson } from 'react-icons/md';

const AssignCollector = () => {
  const [requests, setRequests] = useState([]);
  const [collectors, setCollectors] = useState([]);

  useEffect(() => {
    fetchRequests();
    fetchCollectors();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/assign-collector/accepted-requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to load pickup requests', err);
    }
  };

  const fetchCollectors = async () => {
    try {
      const res = await axios.get('/assign-collector/collectors');
      setCollectors(res.data);
    } catch (err) {
      console.error('Failed to load collectors', err);
    }
  };

  const handleAssign = async (requestId: number, collectorId: string) => {
    if (!collectorId) return;

    try {
      await axios.post('/assign-collector/assign', {
        requestId,
        collectorId: Number(collectorId),
      });
      alert('Collector assigned successfully');
      fetchRequests();
    } catch (err) {
      console.error('Failed to assign collector', err);
      alert('Failed to assign collector');
    }
  };

  return (
    <div className="admin-requests">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>Assign Collectors</h2>
        <div className="stats-badge" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '8px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '14px' }}>
          Pending Assignments: {requests.length}
        </div>
      </div>

      <table className="request-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Customer</th>
            <th>District</th>
            <th>City</th>
            <th>Full Address</th>
            <th>Assign Collector</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req: any) => (
            <tr key={req.id}>
              <td style={{ fontWeight: 700 }}>{req.request_code}</td>
              <td style={{ fontWeight: 600 }}>{req.customer_name}</td>
              <td>{req.district}</td>
              <td>{req.city}</td>
              <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{req.address}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {React.createElement(MdPerson as any, { size: 20, color: "var(--primary)" })}
                  <select
                    defaultValue=""
                    onChange={(e) => handleAssign(req.id, e.target.value)}
                  >
                    <option value="" disabled>Select Collector</option>
                    {collectors.map((collector: any) => (
                      <option key={collector.id} value={collector.id}>{collector.username}</option>
                    ))}
                  </select>
                </div>
              </td>
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                No pending assignments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssignCollector;
