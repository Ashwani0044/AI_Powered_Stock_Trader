import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/signup', { username, email, password });
      alert('Account created successfully! You can now log in.');
      navigate('/login'); // Redirect to login
    } catch (err) {
      // Display the error message from the backend
      const errorMessage = err.response?.data?.message || 'Signup failed.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <form onSubmit={handleSignup} className="bg-slate-800 p-8 rounded-lg shadow-xl w-96 border border-slate-700">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Join Fin-Intel</h2>
        
        <input 
          type="text" 
          placeholder="Username" 
          required
          className="w-full p-3 mb-4 rounded bg-slate-700 border border-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition"
          onChange={(e) => setUsername(e.target.value)}
        />
        
        <input 
          type="email" 
          placeholder="Email Address" 
          required
          className="w-full p-3 mb-4 rounded bg-slate-700 border border-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition"
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <input 
          type="password" 
          placeholder="Password" 
          required
          minLength={6}
          className="w-full p-3 mb-4 rounded bg-slate-700 border border-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition"
          onChange={(e) => setPassword(e.target.value)}
        />

        <input 
          type="password" 
          placeholder="Confirm Password" 
          required
          className="w-full p-3 mb-6 rounded bg-slate-700 border border-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        
        <button 
          className={`w-full p-3 rounded font-bold transition flex items-center justify-center ${
            loading ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            'Create Account'
          )}
        </button>

        <div className="text-center mt-6 text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Log In
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Signup;