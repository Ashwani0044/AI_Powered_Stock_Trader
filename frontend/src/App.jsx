import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Market from './pages/Market';
import Watchlist from './pages/Watchlist';
import AIChat from './pages/AIChat';
import Portfolio from './pages/Portfolio';
import { Notification } from './components/Notification';

function App() {
  const [notification, setNotification] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-900">
        {notification && <Notification notification={notification} />}
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login setNotification={showNotification} setAuth={setIsAuthenticated} />} 
          />
          <Route 
            path="/signup" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup setNotification={showNotification} />} 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Layout><Dashboard setNotification={showNotification} /></Layout> : <Navigate to="/login" />} 
          />
          <Route 
            path="/market" 
            element={isAuthenticated ? <Layout><Market setNotification={showNotification} /></Layout> : <Navigate to="/login" />} 
          />
          <Route 
            path="/watchlist" 
            element={isAuthenticated ? <Layout><Watchlist setNotification={showNotification} /></Layout> : <Navigate to="/login" />} 
          />
          <Route 
            path="/portfolio" 
            element={isAuthenticated ? <Layout><Portfolio setNotification={showNotification} /></Layout> : <Navigate to="/login" />} 
          />
          <Route 
            path="/ai-chat" 
            element={isAuthenticated ? <Layout><AIChat setNotification={showNotification} /></Layout> : <Navigate to="/login" />} 
          />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;