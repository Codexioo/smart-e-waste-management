import React, { useEffect, useState } from 'react';
import '../styles/Header.css';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("Admin");

  useEffect(() => {
    const storedUser = localStorage.getItem("adminUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUsername(user.username);
    }
  }, []);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="admin-header">
      <div className="admin-header-right" onClick={handleProfileClick}>
        {/* <img
          src="/avatar.png"
          alt="Admin"
          className="admin-avatar"
        /> */}
        <span className="admin-username">{username}</span>
      </div>
    </div>
  );
};

export default Header;
