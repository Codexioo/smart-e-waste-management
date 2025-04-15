import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation
} from 'react-router-dom';
import Sidebar from './components/sidebar';
import Dashboard from './pages/dashboard';
import Requests from './pages/requests';
import AdminLogin from './(auth)/AdminLogin';
import AdminProfile from './pages/adminProfile';
import Users from './pages/users';
import NotFound from './pages/NotFound';
import './App.css';
import Header from './components/Header';
import ProtectedRoute from "./components/ProtectedRoute";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const hideSidebar = location.pathname === '/adminLogin' || location.pathname === '/NotFound';

  return (
    <div className="app-layout">
      {!hideSidebar && <Sidebar />}
      <div className="main-section">
        {!hideSidebar && <Header />}
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/adminLogin" replace />} />
          <Route path="/adminLogin" element={<AdminLogin />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/profile" element={<AdminProfile />} />
            <Route path="/users" element={<Users />} />
          </Route>

          {/* 404 Not Found - Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
