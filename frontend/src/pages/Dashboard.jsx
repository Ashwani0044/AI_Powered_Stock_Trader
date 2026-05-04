import React, { useState, useEffect } from 'react';
import api from '../api';
import { Wallet, Briefcase, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState({ balance: 0, portfolio_value: 0, holdings: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // You'll need a route like @trading_bp.route('/portfolio') in Flask
        const res = await api.get('/trading/portfolio'); 
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch portfolio", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="text-blue-400 font-mono animate-pulse">Initializing System...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Market Overview</h2>
        <p className="text-slate-400">Real-time status of your financial assets.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Buying Power" 
          value={`$${data.balance.toLocaleString()}`} 
          icon={<Wallet className="text-green-400" />} 
          color="border-green-500/20"
        />
        <StatCard 
          title="Portfolio Value" 
          value={`$${data.portfolio_value.toLocaleString()}`} 
          icon={<Briefcase className="text-blue-400" />} 
          color="border-blue-500/20"
        />
        <StatCard 
          title="Total Return" 
          value="+0.00%" 
          icon={<TrendingUp className="text-slate-400" />} 
          color="border-slate-500/20"
        />
      </div>

      {/* Holdings Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h3 className="font-bold text-lg">Your Holdings</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-900/50 text-slate-400 text-sm">
            <tr>
              <th className="p-4">Asset</th>
              <th className="p-4">Shares</th>
              <th className="p-4">Avg Cost</th>
              <th className="p-4">Current Price</th>
              <th className="p-4">Profit/Loss</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {data.holdings.length > 0 ? data.holdings.map((stock) => (
              <tr key={stock.ticker} className="hover:bg-slate-700/30 transition">
                <td className="p-4 font-bold text-blue-400">{stock.ticker}</td>
                <td className="p-4">{stock.shares}</td>
                <td className="p-4">${stock.avg_cost}</td>
                <td className="p-4">${stock.current_price}</td>
                <td className={`p-4 flex items-center ${stock.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stock.pl >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {stock.pl}%
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="p-10 text-center text-slate-500">No assets found. Start trading to see data.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Sub-component for Stats
const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-slate-800 p-6 rounded-xl border ${color} shadow-sm`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold mt-2 text-white">{value}</h3>
      </div>
      <div className="p-3 bg-slate-900 rounded-lg">{icon}</div>
    </div>
  </div>
);

export default Dashboard;