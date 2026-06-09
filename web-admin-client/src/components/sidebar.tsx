import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  MdDashboard, 
  MdPeople, 
  MdLocalShipping, 
  MdAssignmentInd, 
  MdInventory, 
  MdLogout,
  MdEco
} from 'react-icons/md';
import '../App.css';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: React.createElement(MdDashboard as any) },
    { label: 'Users', path: '/users', icon: React.createElement(MdPeople as any) },
    { label: 'Pickup Requests', path: '/requests', icon: React.createElement(MdLocalShipping as any) },
    { label: 'Assign Collectors', path: '/assign-collectors', icon: React.createElement(MdAssignmentInd as any) },
    { label: 'Products', path: '/products', icon: React.createElement(MdInventory as any) },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/adminLogin');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            {React.createElement(MdEco as any, { size: 24, color: "white" })}
          </div>
          <h2 className="sidebar-title">EcoAdmin</h2>
        </div>
        
        <nav className="nav-group">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={
                location.pathname === item.path ? 'nav-link active' : 'nav-link'
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="sidebar-logout">
        <button className="logout-btn" onClick={handleLogout}>
          {React.createElement(MdLogout as any, { size: 20 })}
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
