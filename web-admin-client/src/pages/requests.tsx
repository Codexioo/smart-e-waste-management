import React, { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import Modal from 'react-modal';
import Select from 'react-select';
import '../styles/requests.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { MdSearch, MdFilterList, MdRefresh, MdFileDownload, MdVisibility, MdCheck, MdClose, MdEdit } from 'react-icons/md';

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
    { value: 'Electronic Waste', label: 'Electronic Waste' },
    { value: 'Batteries', label: 'Batteries' },
    { value: 'Plastic', label: 'Plastic' },
    { value: 'Metal', label: 'Metal' },
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

  interface PickupReportItem {
    request_code: string;
    address: string;
    district: string;
    city: string;
    waste_types: string;
    create_date: string;
    status: string;
  }

  useEffect(() => {
    axios.get('/requests')
      .then(res => setRequests(res.data))
      .catch(err => console.error('❌ Error fetching data:', err));
  }, []);

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await axios.put(`/requests/${id}/status`, { status });
      setRequests(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
      toast.success(`Request ${status === 'accepted' ? 'approved' : 'rejected'}! 🎉`, {
        position: 'top-right', autoClose: 2000
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

      await axios.put(`/requests/${selectedRequest.id}/edit`, {
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

  const handleDownloadPickupReport = async () => {
    try {
      const response = await axios.get("/report/pickup-report");
      const pickupHistory = response.data.pickupReport;
  
      const tableRows = pickupHistory.length > 0
        ? pickupHistory.map((item: PickupReportItem) => `
            <tr>
              <td>${item.request_code}</td>
              <td>${item.address}, ${item.district}, ${item.city}</td>
              <td>${item.waste_types}</td>
              <td>${item.create_date?.split("T")[0]}</td>
              <td>${item.status}</td>
            </tr>
          `).join("")
        : "<tr><td colspan='5'>No pickup records</td></tr>";
  
      const reportHtml = `
        <div id="report-content" style="padding: 40px; font-family: 'Inter', sans-serif; color: #0f172a;">
          <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 30px;">
            <div style="width: 40px; height: 40px; background-color: #22c55e; border-radius: 8px;"></div>
            <h1 style="font-size: 24px; font-weight: 800; margin: 0;">EcoSmart Pickup Report</h1>
          </div>
          <p style="color: #64748b; margin-bottom: 20px;">Generated on: ${new Date().toLocaleDateString()}</p>
          <table border="0" cellspacing="0" cellpadding="12" style="width:100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8fafc; text-align: left;">
                <th style="border-bottom: 2px solid #e2e8f0; font-weight: 700;">Code</th>
                <th style="border-bottom: 2px solid #e2e8f0; font-weight: 700;">Location</th>
                <th style="border-bottom: 2px solid #e2e8f0; font-weight: 700;">Waste Types</th>
                <th style="border-bottom: 2px solid #e2e8f0; font-weight: 700;">Date</th>
                <th style="border-bottom: 2px solid #e2e8f0; font-weight: 700;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      `;
  
      const container = document.createElement('div');
      container.innerHTML = reportHtml;
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      document.body.appendChild(container);
  
      const element = container.querySelector('#report-content') as HTMLElement;
      const canvas = await html2canvas(element, { scale: 2 });
  
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pageWidth - 20;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
      pdf.save('pickup-report.pdf');
  
      document.body.removeChild(container);
    } catch (error) {
      toast.error("❌ Failed to generate pickup report.");
      console.error("Download error:", error);
    }
  };

  return (
    <div className="admin-requests">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 className="page-title" style={{ marginBottom: 0 }}>Pickup Requests</h2>
        <div className="stats-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--secondary)', padding: '8px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '14px' }}>
          Total Requests: {requests.length}
        </div>
      </div>

      <div className="filters">
        <div style={{ position: 'relative', minWidth: '200px' }}>
          {React.createElement(MdSearch as any, { style: { position: 'absolute', left: 12, top: 14, color: '#94a3b8' }, size: 20 })}
          <input 
            placeholder="Search code..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            style={{ paddingLeft: 40 }}
          />
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        <select value={district} onChange={e => setDistrict(e.target.value)}>
          <option value="">All Districts</option>
          {sriLankanDistricts.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <select value={city} onChange={e => setCity(e.target.value)} disabled={!district}>
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
        }}>
          {React.createElement(MdRefresh as any, { size: 20 })}
        </button>

        <button className="download-btn" onClick={handleDownloadPickupReport}>
          {React.createElement(MdFileDownload as any, { size: 20 })}
          <span>Export PDF</span>
        </button>
      </div>

      <table className="request-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Date</th>
            <th>Customer</th>
            <th>District</th>
            <th>City</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(req => (
            <tr key={req.id}>
              <td style={{ fontWeight: 700 }}>{req.request_code}</td>
              <td>{req.create_date.split('T')[0]}</td>
              <td style={{ fontWeight: 600 }}>{req.user_name}</td>
              <td>{req.district}</td>
              <td>{req.city}</td>
              <td><span className={`badge ${req.status}`}>{req.status}</span></td>
              <td>
                <button className="view-btn" onClick={() => {
                  setSelectedRequest(req);
                  setEditMode(false);
                  const selectedWasteTypes = req.waste_types?.split(',').map(value => wasteOptions.find(opt => opt.value === value)).filter(Boolean);
                  setEditable({ ...req, waste_types: selectedWasteTypes?.map(w => w?.value).join(',') || '' });
                }}>
                  {React.createElement(MdVisibility as any, { size: 16 })}
                </button>
              </td>
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
            <h2>Request Details #{selectedRequest.request_code}</h2>
            <div className="modal-details">
              <p><strong>Status</strong> <span className={`badge ${selectedRequest.status}`}>{selectedRequest.status}</span></p>
              <p><strong>Created On</strong> {selectedRequest.create_date.split('T')[0]}</p>
              <p><strong>Customer Name</strong> {selectedRequest.user_name}</p>
              <p><strong>Email Address</strong> {selectedRequest.email}</p>
              <p><strong>Phone Number</strong> {selectedRequest.telephone}</p>

              {editMode ? (
                <>
                  <div>
                    <label><strong>Address</strong></label>
                    <input
                      type="text"
                      className="input-text"
                      value={editable.address || ''}
                      onChange={(e) => handleEditChange('address', e.target.value)}
                    />
                  </div>
                  <div>
                    <label><strong>District</strong></label>
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
                  </div>
                  <div>
                    <label><strong>City</strong></label>
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
                  </div>
                  <div>
                    <label><strong>Waste Types</strong></label>
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
                  </div>
                </>
              ) : (
                <>
                  <p><strong>Full Address</strong> {selectedRequest.address}</p>
                  <p><strong>District / City</strong> {selectedRequest.district} / {selectedRequest.city}</p>
                  <p><strong>Waste Categories</strong> {selectedRequest.waste_types}</p>
                </>
              )}
            </div>

            <div className="modal-actions">
              {editMode ? (
                <button className="btn-approve" onClick={handleSaveEdit}>
                  {React.createElement(MdCheck as any, { size: 18 })}
                  <span>Save Changes</span>
                </button>
              ) : (
                <>
                  {selectedRequest.status === 'pending' && (
                    <>
                      <button className="btn-approve" onClick={() => handleStatusUpdate(selectedRequest.id, 'accepted')}>
                        {React.createElement(MdCheck as any, { size: 18 })}
                        <span>Approve</span>
                      </button>
                      <button className="btn-reject" onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}>
                        {React.createElement(MdClose as any, { size: 18 })}
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                  <button className="btn-edit" onClick={handleEditClick}>
                    {React.createElement(MdEdit as any, { size: 18 })}
                    <span>Edit</span>
                  </button>
                </>
              )}
              <button className="btn-cancel" onClick={() => setSelectedRequest(null)}>Close</button>
            </div>
          </>
        )}
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default Requests;
