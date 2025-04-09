import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../App.css';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Users', path: '/users' },
    { label: 'Pickup Requests', path: '/requests' },
    { label: 'Rewards', path: '/rewards' },
    { label: 'Products', path: '/products' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/adminLogin');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <h2 className="sidebar-title">Admin</h2>
        <nav>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={
                location.pathname === item.path ? 'nav-link active' : 'nav-link'
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="sidebar-logout">
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
