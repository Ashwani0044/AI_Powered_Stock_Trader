import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('username', res.data.user.username);
      alert('Welcome back, ' + res.data.user.username);
      navigate('/dashboard');
    } catch (err) {
      alert('Login failed: ' + err.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-lg shadow-xl w-96">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Fin-Intel Login</h2>
        <input 
          type="email" placeholder="Email" 
          className="w-full p-3 mb-4 rounded bg-slate-700 border border-slate-600 outline-none focus:border-blue-500"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" placeholder="Password" 
          className="w-full p-3 mb-6 rounded bg-slate-700 border border-slate-600 outline-none focus:border-blue-500"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-bold transition">
          Enter Terminal
        </button>
      </form>
    </div>
  );
};

export default Login;