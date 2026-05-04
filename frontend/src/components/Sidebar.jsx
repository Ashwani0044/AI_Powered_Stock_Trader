import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Bookmark, 
  MessageSquare, 
  LogOut,
  User
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem('username') || 'Trader';

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Market', icon: <TrendingUp size={20} />, path: '/market' },
    { name: 'Watchlist', icon: <Bookmark size={20} />, path: '/watchlist' },
    { name: 'AI Assistant', icon: <MessageSquare size={20} />, path: '/ai-chat' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="h-screen w-64 bg-slate-800 border-r border-slate-700 flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-400 tracking-tighter">FIN-INTEL</h1>
        <p className="text-xs text-slate-500 font-mono">v1.0.4-stable</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
              location.pathname === item.path 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3 mb-4 px-2">
          <div className="bg-slate-600 p-2 rounded-full text-blue-400">
            <User size={20} />
          </div>
          <span className="text-sm font-semibold text-slate-300 truncate">{username}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 p-3 text-red-400 hover:bg-red-900/20 rounded-lg transition"
        >
          <LogOut size={20} />
          <span className="font-medium">Exit Terminal</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;