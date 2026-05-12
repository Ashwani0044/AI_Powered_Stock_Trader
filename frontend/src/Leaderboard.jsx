import React, { useState, useEffect } from 'react';
import api from './api';
import { Trophy } from 'lucide-react';

const Leaderboard = () => {
  const [traders, setTraders] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/market/leaderboard');
        setTraders(res.data);
      } catch (err) { console.error("Leaderboard fetch failed"); }
    };
    fetchLeaderboard();
    // Refresh every 30 seconds for that "Live" feel
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
        <Trophy className="text-yellow-500" size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Global Rankings</h3>
      </div>
      <div className="space-y-3">
        {traders.map((t, i) => (
          <div key={t.username} className="flex justify-between items-center group">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500 w-4">{i + 1}</span>
              <span className="text-sm text-slate-200 group-hover:text-blue-400 transition">{t.username}</span>
            </div>
            <span className={`text-xs font-bold ${t.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {t.profit >= 0 ? '+' : ''}{t.profit.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;