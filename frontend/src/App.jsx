import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

// A simple placeholder for now so the app doesn't crash
const Dashboard = () => (
  <div className="min-h-screen bg-slate-900 text-white p-10">
    <h1 className="text-4xl font-bold">Trading Dashboard</h1>
    <p className="mt-4 text-slate-400">Your AI-powered portfolio is loading...</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Redirect any unknown route to login */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;