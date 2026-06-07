import React, { useEffect, useState } from 'react';
import '../styles/Header.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdPerson, MdNotifications, MdSearch } from 'react-icons/md';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("Admin");

  useEffect(() => {
    const storedUser = localStorage.getItem("adminUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUsername(user.username || "Admin");
      } catch (e) {
        setUsername("Admin");
      }
    }
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard Overview';
    if (path === '/users') return 'User Management';
    if (path === '/requests') return 'Pickup Requests';
    if (path === '/assign-collectors') return 'Assign Collectors';
    if (path === '/products') return 'Product Inventory';
    if (path === '/profile') return 'Admin Profile';
    return 'Admin Panel';
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="admin-header">
      <div className="header-left">
        <h1 className="page-title">{getPageTitle()}</h1>
      </div>

      <div className="header-right">
        <div className="search-bar">
          {React.createElement(MdSearch as any, { size: 20, color: "#94a3b8" })}
          <input type="text" placeholder="Search..." />
        </div>
        
        <button className="icon-btn">
          {React.createElement(MdNotifications as any, { size: 22 })}
          <span className="badge"></span>
        </button>

        <div className="user-profile" onClick={handleProfileClick}>
          <div className="user-info">
            <span className="user-name">{username}</span>
            <span className="user-role">Administrator</span>
          </div>
          <div className="user-avatar">
            {React.createElement(MdPerson as any, { size: 24, color: "white" })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
