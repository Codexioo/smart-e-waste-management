import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import '../styles/requests.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

Modal.setAppElement('#root');

const Requests = () => {
  interface Request {
    id: number;
    request_code: string;
    create_date: string;
    user_name: string;
    email: string;
    telephone: string;
    district: string;
    city: string;
    address: string;
    waste_types: string;
    status: string;
  }

  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    axios.get('http://localhost:9091/api/requests')
      .then(res => {
        setRequests(res.data);
      })
      .catch(err => console.error('❌ Error fetching data:', err));
  }, []);

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await axios.put(`http://localhost:9091/api/requests/${id}/status`, { status });
      setRequests(prev =>
        prev.map(r => (r.id === id ? { ...r, status } : r))
      );
  
      toast.success(`Request successfully ${status === 'accepted' ? 'approved' : 'rejected'}! 🎉`, {
        position: "top-center",
        autoClose: 3000,
        style: {
          marginTop: '50px',
          marginLeft: '200px'
        }
      });
  
      setTimeout(() => {
        setSelectedRequest(null); // Close modal after toast
      }, 2000);
  
    } catch (err) {
      console.error('❌ Status update failed', err);
      toast.error('Failed to update request status.', {
        position: "top-center",
      });
    }
  };


  const filtered = requests.filter(req => {
    return (
      (!search || req.request_code.toLowerCase().includes(search.toLowerCase())) &&
      (!district || req.district === district) &&
      (!city || req.city === city) &&
      (!date || req.create_date.startsWith(date)) &&
      (!status || req.status === status)
    );
  });

  return (
    <div className="admin-requests">
      <h2 className="page-title">Pickup Requests</h2>

      <div className="filters">
        <input placeholder="Search by Request Code" value={search} onChange={(e) => setSearch(e.target.value)} />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <select value={district} onChange={e => setDistrict(e.target.value)}>
          <option value="">All Districts</option>
          <option value="Colombo">Colombo</option>
          <option value="Gampaha">Gampaha</option>
          <option value="Kandy">Kandy</option>
        </select>
        <select value={city} onChange={e => setCity(e.target.value)}>
          <option value="">All Cities</option>
          <option value="Colombo 1">Colombo 1</option>
          <option value="Negombo">Negombo</option>
          <option value="Peradeniya">Peradeniya</option>
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
        

        <button className="reset-btn" onClick={() => {
          setSearch('');
          setDistrict('');
          setCity('');
          setDate('');
        }}>Reset Filters</button>
      </div>

      <table className="request-table">
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Date</th>
            <th>User Name</th>
            <th>District</th>
            <th>City</th>
            <th>Address</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(req => (
            <tr key={req.id}>
              <td>{req.request_code}</td>
              <td>{req.create_date.split('T')[0]}</td>
              <td>{req.user_name}</td>
              <td>{req.district}</td>
              <td>{req.city}</td>
              <td>{req.address}</td>
              <td><span className={`badge ${req.status}`}>{req.status}</span></td>
              <td><button className="view-btn" onClick={() => setSelectedRequest(req)}>View</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={!!selectedRequest}
        onRequestClose={() => setSelectedRequest(null)}
        contentLabel="Request Details"
        className="modal modal-lg"
        overlayClassName="overlay"
      >
        {selectedRequest && (
          <>
            <h2>Request Details</h2>
            <div className="modal-details">
              <p><strong>Status:</strong> {selectedRequest.status}</p>
              <p><strong>Date:</strong> {selectedRequest.create_date.split('T')[0]}</p>
              <p><strong>Request Code:</strong> {selectedRequest.request_code}</p>
              <p><strong>Name:</strong> {selectedRequest.user_name}</p>
              <p><strong>Email:</strong> {selectedRequest.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedRequest.telephone || 'N/A'}</p>
              <p><strong>Address:</strong> {selectedRequest.address}</p>
              <p><strong>District:</strong> {selectedRequest.district}</p>
              <p><strong>City:</strong> {selectedRequest.city}</p>
              <p><strong>Waste Types:</strong> {selectedRequest.waste_types || 'N/A'}</p>
            </div>

            <div className="modal-actions">
              <button className="btn-approve" onClick={() => handleStatusUpdate(selectedRequest.id, 'accepted')}>Approve</button>
              <button className="btn-reject" onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}>Reject</button>
              <button className="btn-cancel" onClick={() => setSelectedRequest(null)}>Cancel</button>
            </div>
          </>
        )}
      </Modal>
      <ToastContainer/>
    </div>
  );
};

export default Requests;
