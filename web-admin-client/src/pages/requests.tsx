import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import Select from 'react-select';
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
  const [editMode, setEditMode] = useState(false);
  const [editable, setEditable] = useState<Partial<Request>>({});
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');

  const wasteOptions = [
    { value: 'Plastic', label: 'Plastic' },
    { value: 'Glass', label: 'Glass' },
    { value: 'Metal', label: 'Metal' },
    { value: 'Paper', label: 'Paper' },
  ];

  const sriLankanDistricts = [
    { label: 'Colombo', value: 'Colombo' },
    { label: 'Gampaha', value: 'Gampaha' },
    { label: 'Kandy', value: 'Kandy' },
    { label: 'Galle', value: 'Galle' },
    { label: 'Jaffna', value: 'Jaffna' },
  ];

  const citiesByDistrict: Record<string, string[]> = {
    Colombo: ['Colombo 1', 'Colombo 2', 'Colombo 3'],
    Gampaha: ['Negombo', 'Ja-Ela', 'Minuwangoda'],
    Kandy: ['Peradeniya', 'Katugastota', 'Pilimathalawa'],
    Galle: ['Hikkaduwa', 'Ambalangoda', 'Karapitiya'],
    Jaffna: ['Chunnakam', 'Nallur', 'Kopay'],
  };

  useEffect(() => {
    axios.get('http://localhost:9091/api/requests')
      .then(res => setRequests(res.data))
      .catch(err => console.error('❌ Error fetching data:', err));
  }, []);

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await axios.put(`http://localhost:9091/api/requests/${id}/status`, { status });
      setRequests(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
      toast.success(`Request ${status === 'accepted' ? 'approved' : 'rejected'}! 🎉`, {
        position: 'top-right', autoClose: 2000, style: { marginTop: '50px' }
      });
      setTimeout(() => setSelectedRequest(null), 2000);
    } catch (err) {
      toast.error('Failed to update request status.');
    }
  };

  const handleEditClick = () => {
    setEditMode(true);
    setEditable(selectedRequest || {});
  };

  const handleEditChange = (key: keyof Request, value: any) => {
    setEditable(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveEdit = async () => {
    if (!selectedRequest) return;
    try {
      const formattedWasteTypes = Array.isArray(editable.waste_types)
        ? editable.waste_types.map((w: any) => w.value).join(',')
        : editable.waste_types;

      await axios.put(`http://localhost:9091/api/requests/${selectedRequest.id}/edit`, {
        address: editable.address,
        district: editable.district,
        city: editable.city,
        waste_types: formattedWasteTypes,
      });

      setRequests(prev =>
        prev.map(r => r.id === selectedRequest.id ? {
          ...r,
          ...editable,
          waste_types: formattedWasteTypes || '',
        } : r)
      );
      toast.success('Request updated successfully! 🎉');
      setEditMode(false);
      setSelectedRequest(null);
    } catch (err) {
      toast.error('Failed to update request.');
    }
  };

  const filtered = requests.filter(req => (
    (!search || req.request_code.toLowerCase().includes(search.toLowerCase())) &&
    (!district || req.district === district) &&
    (!city || req.city === city) &&
    (!date || req.create_date.startsWith(date)) &&
    (!status || req.status === status)
  ));

  return (
    <div className="admin-requests">
      <h2 className="page-title">Pickup Requests</h2>

      {/* Filters */}
      <div className="filters">
        <input placeholder="Search by Request Code" value={search} onChange={(e) => setSearch(e.target.value)} />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <select value={district} onChange={e => setDistrict(e.target.value)}>
          <option value="">All Districts</option>
          {sriLankanDistricts.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <select value={city} onChange={e => setCity(e.target.value)}>
          <option value="">All Cities</option>
          {(citiesByDistrict[district] || []).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
        <button className="reset-btn" onClick={() => {
          setSearch(''); setDistrict(''); setCity(''); setDate(''); setStatus('');
        }}>Reset Filters</button>
      </div>

      {/* Table */}
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
              <td><button className="view-btn" onClick={() => {
                setSelectedRequest(req);
                setEditMode(false);
                const selectedWasteTypes = req.waste_types?.split(',').map(value => wasteOptions.find(opt => opt.value === value)).filter(Boolean);
                setEditable({ ...req, waste_types: selectedWasteTypes?.map(w => w?.value).join(',') || '' });
              }}>View</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
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
              <p><strong>Email:</strong> {selectedRequest.email}</p>
              <p><strong>Phone:</strong> {selectedRequest.telephone}</p>

              {editMode ? (
                <>
                  <div className="form-field">
                    <label><strong>Address:</strong></label>
                    <input
                      type="text"
                      className="input-text"
                      value={editable.address || ''}
                      onChange={(e) => handleEditChange('address', e.target.value)}
                    />
                  </div>
                  <p><strong>District:</strong>
                    <select
                      className="dropdown-text"
                      value={editable.district || ''}
                      onChange={(e) => {
                        const selected = e.target.value;
                        handleEditChange('district', selected);
                        handleEditChange('city', '');
                      }}
                    >
                      <option value="">Select District</option>
                      {sriLankanDistricts.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </p>
                  <p><strong>City:</strong>
                    <select
                      className="dropdown-text"
                      value={editable.city || ''}
                      onChange={(e) => handleEditChange('city', e.target.value)}
                      disabled={!editable.district}
                    >
                      <option value="">Select City</option>
                      {(citiesByDistrict[editable.district || ''] || []).map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </p>
                  <p><strong>Waste Types:</strong></p>
                  <Select
                    isMulti
                    options={wasteOptions}
                    classNamePrefix="select"
                    className="dropdown-text"
                    value={wasteOptions.filter(opt => (editable.waste_types || '').split(',').includes(opt.value))}
                    onChange={(selectedOptions) => {
                      const selectedValues = selectedOptions.map((opt: any) => opt.value).join(',');
                      handleEditChange('waste_types', selectedValues);
                    }}
                  />
                </>
              ) : (
                <>
                  <p><strong>Address:</strong> {selectedRequest.address}</p>
                  <p><strong>District:</strong> {selectedRequest.district}</p>
                  <p><strong>City:</strong> {selectedRequest.city}</p>
                  <p><strong>Waste Types:</strong> {selectedRequest.waste_types}</p>
                </>
              )}
            </div>

            <div className="modal-actions">
              {editMode ? (
                <button className="btn-approve" onClick={handleSaveEdit}>Save</button>
              ) : (
                <>
                  <button className="btn-approve" onClick={() => handleStatusUpdate(selectedRequest.id, 'accepted')}>Approve</button>
                  <button className="btn-reject" onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}>Reject</button>
                  <button className="btn-edit" onClick={handleEditClick}>Edit</button>
                </>
              )}
              <button className="btn-cancel" onClick={() => setSelectedRequest(null)}>Cancel</button>
            </div>
          </>
        )}
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default Requests;
