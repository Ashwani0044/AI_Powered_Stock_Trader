import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Bookmark, 
  MessageSquare, 
  LogOut,
  User,
  BarChart3
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem('username') || 'Trader';

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Market', icon: <TrendingUp size={20} />, path: '/market' },
    { name: 'Portfolio', icon: <BarChart3 size={20} />, path: '/portfolio' },
    { name: 'Watchlist', icon: <Bookmark size={20} />, path: '/watchlist' },
    { name: 'AI Assistant', icon: <MessageSquare size={20} />, path: '/ai-chat' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="h-screen w-64 bg-linear-to-b from-slate-800 to-slate-900 border-r border-slate-700 flex flex-col fixed left-0 top-0 shadow-2xl">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent tracking-tighter">FIN-INTEL</h1>
        <p className="text-xs text-slate-500 font-mono mt-1">AI Stock Trading Hub</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
              location.pathname === item.path 
                ? 'bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-900/40' 
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700 space-y-3">
        <div className="flex items-center space-x-3 px-2 py-2">
          <div className="bg-linear-to-br from-blue-500 to-cyan-500 p-2 rounded-full text-white">
            <User size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400">Logged in as</p>
            <p className="text-sm font-semibold text-slate-200 truncate">{username}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 p-3 text-red-400 hover:bg-red-900/20 rounded-lg transition"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;