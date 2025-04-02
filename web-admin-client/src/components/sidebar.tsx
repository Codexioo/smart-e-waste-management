import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../App.css';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Users', path: '/users' },
    { label: 'Pickup Requests', path: '/requests' },
    { label: 'Rewards', path: '/rewards' },
    { label: 'Products', path: '/products' },
  ];

  return (
    <div className="sidebar">
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
  );
};

export default Sidebar;