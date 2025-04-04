import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/requests.css'; 

const Requests = () => {
  interface Request {
    id: number;
    request_code: string;
    create_date: string;
    user_name: string;
    district: string;
    city: string;
    address: string;
    status: string;
  }

  const [requests, setRequests] = useState<Request[]>([]);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    axios.get('http://localhost:9091/api/requests')
      .then(res => {
        setRequests(res.data);
      })
      .catch(err => console.error('❌ Error fetching data:', err));
  }, []);

  const filtered = requests.filter(req => {
    return (
      (!search || req.request_code.toLowerCase().includes(search.toLowerCase())) &&
      (!district || req.district === district) &&
      (!city || req.city === city) &&
      (!date || req.create_date.startsWith(date))
    );
  });

  return (
    <div className="admin-requests">
      <h2 className="page-title">Pickup Requests</h2>

      <div className="filters">
        <input placeholder="Search by Name" value={search} onChange={(e) => setSearch(e.target.value)} />
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
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
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
              <td><button className="view-btn">View</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Requests;