import React, { useState } from 'react';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom'; // Import Link

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('username', res.data.user.username);
      
      // Navigate straight to dashboard
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.message || "Invalid credentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-slate-700">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-400 tracking-tight">Fin-Intel Login</h2>
        
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email Address" 
            required
            className="w-full p-3 rounded bg-slate-700 border border-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <input 
            type="password" 
            placeholder="Password" 
            required
            className="w-full p-3 rounded bg-slate-700 border border-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <button 
            disabled={loading}
            className={`w-full p-3 rounded font-bold transition flex items-center justify-center ${
              loading ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Authenticating...' : 'Enter Terminal'}
          </button>
        </div>

        {/* The Signup Link */}
        <div className="mt-6 text-center text-slate-400">
          New to the platform?{' '}
          <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-4">
            Create an Account
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;