import React, { useState } from "react";
import axios from "../api/axiosInstance";
import { useNavigate, Navigate } from "react-router-dom";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdEco } from 'react-icons/md';
import "../styles/AdminLogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  if (localStorage.getItem("adminToken")) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async () => {
    let isValid = true;

    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!isValid) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("/admin/login", { email, password });
      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("adminUser", JSON.stringify(response.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="login-container">
        <div className="login-visual">
          <div className="visual-content">
            <div className="visual-logo">
              {React.createElement(MdEco as any, { size: 48, color: "white" })}
            </div>
            <h1 className="visual-title">EcoSmart</h1>
            <p className="visual-text">
              Empowering sustainable e-waste management for a greener future.
            </p>
            <div className="visual-stats">
              <div className="stat-item">
                <span className="stat-value">50k+</span>
                <span className="stat-label">Items Collected</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">12k+</span>
                <span className="stat-label">Active Users</span>
              </div>
            </div>
          </div>
          <div className="visual-overlay"></div>
        </div>

        <div className="login-form-section">
          <div className="login-card">
            <div className="mobile-logo">
              {React.createElement(MdEco as any, { size: 32, color: "var(--primary)" })}
            </div>
            <h2 className="admin-login-title">Admin Portal</h2>
            <p className="admin-login-subtitle">Please enter your credentials to continue</p>

            <div className="admin-input-group">
              <label className="admin-label">Email Address</label>
              <div className="admin-input-container">
                {React.createElement(MdEmail as any, { className: "input-icon", size: 20 })}
                <input
                  className="admin-input"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  placeholder="admin@ecosmart.com"
                  disabled={isLoading}
                />
              </div>
              {emailError && <p className="field-error">{emailError}</p>}
            </div>

            <div className="admin-input-group">
              <label className="admin-label">Password</label>
              <div className="admin-input-container">
                {React.createElement(MdLock as any, { className: "input-icon", size: 20 })}
                <input
                  className="admin-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button 
                  className="toggle-password" 
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                  disabled={isLoading}
                >
                  {showPassword ? React.createElement(MdVisibilityOff as any, { size: 20 }) : React.createElement(MdVisibility as any, { size: 20 })}
                </button>
              </div>
              {passwordError && <p className="field-error">{passwordError}</p>}
            </div>

            <button 
              className={`admin-login-btn ${isLoading ? 'loading' : ''}`} 
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
            
            {error && <p className="admin-error">{error}</p>}
          </div>
          <p className="login-footer">© 2026 EcoSmart Management System</p>
        </div>
      </div>
    </div>
  );
}
