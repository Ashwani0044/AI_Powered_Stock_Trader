import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Market from './pages/Market';

// // Temporary Dashboard Component
// const Dashboard = () => (
//   <div>
//     <h2 className="text-3xl font-bold mb-2">Market Overview</h2>
//     <p className="text-slate-400">Welcome back to your financial intelligence hub.</p>
    
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
//       <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
//         <p className="text-slate-400 text-sm">Buying Power</p>
//         <h3 className="text-2xl font-bold text-green-400 mt-1">$10,000.00</h3>
//       </div>
//       <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
//         <p className="text-slate-400 text-sm">Portfolio Value</p>
//         <h3 className="text-2xl font-bold text-blue-400 mt-1">$0.00</h3>
//       </div>
//       <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
//         <p className="text-slate-400 text-sm">Day Change</p>
//         <h3 className="text-2xl font-bold text-slate-500 mt-1">0.00%</h3>
//       </div>
//     </div>
//   </div>
// );

function App() {
 return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes Wrapped in Layout */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      
        <Route path="/market" element={<Layout><Market /></Layout>} />
        
        <Route path="/watchlist" element={<Layout><div>Watchlist coming soon...</div></Layout>} />
        <Route path="/ai-chat" element={<Layout><div>AI Assistant coming soon...</div></Layout>} />
        
        {/* Catch-all: ONLY redirect if the URL is truly invalid */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;