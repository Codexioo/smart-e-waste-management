import React from "react";
import { useNavigate } from "react-router-dom";
import { MdErrorOutline, MdHome } from 'react-icons/md';
import "../styles/NotFound.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-wrapper">
      <div className="not-found-content">
        <div className="not-found-icon">
          {React.createElement(MdErrorOutline as any, { size: 80 })}
        </div>
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page Not Found</h2>
        <p className="not-found-text">
          Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <button className="not-found-btn" onClick={() => navigate("/dashboard")}>
          {React.createElement(MdHome as any, { size: 20, style: { marginRight: 8 } })}
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;
