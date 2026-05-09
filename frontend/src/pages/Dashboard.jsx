import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Wallet, Briefcase, TrendingUp, ArrowUpRight, ArrowDownRight, RotateCw, Eye, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import TradeModal from '../components/TradeModal';
import Leaderboard from'../Leaderboard';

const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
  <div className={`bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-slate-600 ${color}`}>
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-2">{subtitle}</p>}
      </div>
      <div className="p-3 bg-slate-900/50 rounded-lg text-2xl">{icon}</div>
    </div>
    {trend !== undefined && (
      <div className="flex items-center gap-1 text-sm">
        {parseFloat(trend) >= 0 ? (
          <>
            <ArrowUpRight size={16} className="text-green-400" />
            <span className="text-green-400">{trend}%</span>
          </>
        ) : (
          <>
            <ArrowDownRight size={16} className="text-red-400" />
            <span className="text-red-400">{trend}%</span>
          </>
        )}
      </div>
    )}
  </div>
);

const Dashboard = ({ setNotification }) => {
  const navigate = useNavigate();
  const [data, setData] = useState({ balance: 0, portfolio_value: 0, holdings: [], ai_score: 0 });
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, ticker: '', type: '' });
  const [chartData, setChartData] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trading/portfolio');
      setData(res.data);
      
      const mockChart = Array.from({ length: 7 }, (_, i) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        value: res.data.portfolio_value + (Math.random() - 0.5) * 5000,
      }));
      setChartData(mockChart);
    } catch (err) {
      console.error("Failed to fetch portfolio", err);
      setNotification('Failed to load portfolio data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const openTradeModal = (ticker, type) => {
    setModal({ isOpen: true, ticker, type: type.toUpperCase() });
  };

  const calculateTotalGain = () => {
    if (!data.holdings.length) return "0.00";
    const invested = data.holdings.reduce((sum, h) => sum + (h.avg_cost * h.shares), 0);
    const current = data.holdings.reduce((sum, h) => sum + (h.current_price * h.shares), 0);
    return invested === 0 ? "0.00" : ((current - invested) / invested * 100).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-mono">Initializing trading system...</p>
        </div>
      </div>
    );
  }

  const totalGain = calculateTotalGain();
  const pieData = data.holdings.slice(0, 5).map(h => ({
    name: h.ticker,
    value: h.shares * h.current_price,
  }));
  const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Welcome back, <span className="text-blue-400 font-semibold">{localStorage.getItem('username')}</span>!</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-400 hover:text-white transition shadow-lg"
        >
          <RotateCw size={20} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Buying Power" 
          value={`$${data.balance.toLocaleString('en-US', {minimumFractionDigits: 2})}`}
          icon={<Wallet className="text-green-400" />}
          color="border-l-4 border-l-green-500"
        />
        <StatCard 
          title="Portfolio Value" 
          value={`$${data.portfolio_value.toLocaleString('en-US', {minimumFractionDigits: 2})}`}
          icon={<Briefcase className="text-blue-400" />}
          color="border-l-4 border-l-blue-500"
          trend={totalGain}
        />
        <StatCard 
          title="Total Gain/Loss" 
          value={`${totalGain}%`}
          icon={parseFloat(totalGain) >= 0 ? <TrendingUp className="text-green-400" /> : <TrendingDown className="text-red-400" />}
          color={parseFloat(totalGain) >= 0 ? "border-l-4 border-l-emerald-500" : "border-l-4 border-l-red-500"}
        />
        <StatCard 
          title="Holdings" 
          value={data.holdings.length}
          subtitle="Active Positions"
          icon={<Eye className="text-cyan-400" />}
          color="border-l-4 border-l-cyan-500"
        />
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-400" />
            Performance History
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" vertical={false} />
              <XAxis dataKey="day" stroke="rgba(148,163,184,0.5)" axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(148,163,184,0.5)" axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Value']}
              />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" dot={false} strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6">Asset Allocation</h3>
          {data.holdings.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-75 flex items-center justify-center text-slate-500 text-sm italic">
              No data to display
            </div>
          )}
        </div>

        {/* Leaderboard Column */}
        <div className="lg:col-span-1">
          <Leaderboard />
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <h3 className="font-bold text-lg text-white">Your Portfolio</h3>
          <span className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            Real-Time Tracking
          </span>
        </div>
        
        {data.holdings.length === 0 ? (
          <div className="p-16 text-center">
            <Briefcase size={48} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 mb-6">Your portfolio is empty. Let's find some winners.</p>
            <button 
              onClick={() => navigate('/market')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition transform hover:scale-105"
            >
              Go to Market
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-widest border-b border-slate-700">
                <tr>
                  <th className="p-4">Asset</th>
                  <th className="p-4 text-right">Shares</th>
                  <th className="p-4 text-right">Avg Cost</th>
                  <th className="p-4 text-right">Market Price</th>
                  <th className="p-4 text-right">Return</th>
                  <th className="p-4 text-right">Total Value</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {data.holdings.map((stock) => {
                  const gain = ((stock.current_price - stock.avg_cost) / stock.avg_cost) * 100;
                  const value = stock.current_price * stock.shares;
                  return (
                    <tr key={stock.ticker} className="hover:bg-slate-700/30 transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{stock.ticker}</span>
                          <span className="text-[10px] text-slate-500">Equity</span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono text-slate-300">{stock.shares}</td>
                      <td className="p-4 text-right font-mono text-slate-300">${stock.avg_cost.toFixed(2)}</td>
                      <td className="p-4 text-right font-mono text-slate-300">${stock.current_price.toFixed(2)}</td>
                      <td className={`p-4 text-right font-bold ${gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {gain >= 0 ? '+' : ''}{gain.toFixed(2)}%
                      </td>
                      <td className="p-4 text-right font-mono text-white">${value.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => openTradeModal(stock.ticker, 'buy')}
                            className="p-1.5 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded transition"
                          >
                            <Plus size={14} />
                          </button>
                          <button 
                            onClick={() => openTradeModal(stock.ticker, 'sell')}
                            className="p-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition"
                          >
                            <TrendingDown size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TradeModal 
        isOpen={modal.isOpen}
        ticker={modal.ticker}
        type={modal.type}
        onClose={() => setModal({ isOpen: false, ticker: '', type: '' })}
        onSuccess={() => {
          fetchDashboardData();
          setNotification(`${modal.type} order executed!`, 'success');
        }}
        setNotification={setNotification}
      />
    </div>
  );
};

export default Dashboard;