import React from "react";
import { useNavigate } from "react-router-dom";
//import "./NotFound.css"; // optional styling

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <h1>404 - Page Not Found</h1>
      <p>The page you’re looking for doesn’t exist.</p>
      <button onClick={() => navigate("/adminLogin")}>Go to Login</button>
    </div>
  );
};

export default NotFound;
