import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/sidebar';
import Dashboard from './pages/dashboard';
import Requests from './pages/requests';
import AdminLogin from './(auth)/AdminLogin';
import './App.css';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const hideSidebar = location.pathname === '/adminLogin';

  return (
    <div className="app-layout">
      {!hideSidebar && <Sidebar />}
      <main className="main-content">{children}</main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/adminLogin" replace />} />
          <Route path="/adminLogin" element={<AdminLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/requests" element={<Requests />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
