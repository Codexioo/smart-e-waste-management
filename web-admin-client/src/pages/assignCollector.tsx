import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/assignCollector.css';

const AssignCollector = () => {
  const [requests, setRequests] = useState([]);
  const [collectors, setCollectors] = useState([]);

  useEffect(() => {
    fetchRequests();
    fetchCollectors();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:9091/api/assign-collector/accepted-requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to load pickup requests', err);
    }
  };

  const fetchCollectors = async () => {
    try {
      const res = await axios.get('http://localhost:9091/api/assign-collector/collectors');
      setCollectors(res.data);
    } catch (err) {
      console.error('Failed to load collectors', err);
    }
  };

  const handleAssign = async (requestId: number, collectorId: number) => {
    try {
      await axios.post('http://localhost:9091/api/assign-collector/assign', {
        requestId,
        collectorId
      });
      alert('Collector assigned successfully');
      fetchRequests();
    } catch (err) {
      alert('Failed to assign collector');
    }
  };

  return (
    <div className="admin-requests">
      <h2 className="page-title">Assign Collectors</h2>
      <table className="request-table">
        <thead>
          <tr>
            <th>Request ID</th>
            <th>User Name</th>
            <th>District</th>
            <th>City</th>
            <th>Address</th>
            <th>Assign Collector</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req: any) => (
            <tr key={req.id}>
              <td>{req.request_code}</td>
              <td>{req.customer_name}</td>
              <td>{req.district}</td>
              <td>{req.city}</td>
              <td>{req.address}</td>
              <td>
                <select onChange={(e) => handleAssign(req.id, Number(e.target.value))}>
                  <option value="">Select Collector</option>
                  {collectors.map((collector: any) => (
                    <option key={collector.id} value={collector.id}>{collector.username}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssignCollector;