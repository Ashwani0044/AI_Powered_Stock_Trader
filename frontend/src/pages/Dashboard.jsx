import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Wallet, Briefcase, TrendingUp, ArrowUpRight, ArrowDownRight, Plus, RotateCw, Eye, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import TradeModal from '../components/TradeModal';

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
        {trend >= 0 ? (
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
      
      // Generate mock chart data for visualization
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
    const invested = data.holdings.reduce((sum, h) => sum + (h.avg_cost * h.shares), 0);
    const current = data.holdings.reduce((sum, h) => sum + (h.current_price * h.shares), 0);
    return ((current - invested) / invested * 100 || 0).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Welcome back, {localStorage.getItem('username')}! Here's your financial overview.</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-400 hover:text-white transition"
        >
          <RotateCw size={20} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard 
          title="Buying Power" 
          value={`$${data.balance.toLocaleString('en-US', {minimumFractionDigits: 2})}`}
          icon={<Wallet className="text-green-400" />}
          color="border-green-500/20"
        />
        <StatCard 
          title="Portfolio Value" 
          value={`$${data.portfolio_value.toLocaleString('en-US', {minimumFractionDigits: 2})}`}
          icon={<Briefcase className="text-blue-400" />}
          color="border-blue-500/20"
          trend={parseFloat(totalGain)}
        />
        <StatCard 
          title="Total Gain/Loss" 
          value={`${totalGain}%`}
          icon={totalGain >= 0 ? <TrendingUp className="text-green-400" /> : <TrendingDown className="text-red-400" />}
          color={totalGain >= 0 ? "border-green-500/20" : "border-red-500/20"}
        />
        <StatCard 
          title="Holdings Count" 
          value={data.holdings.length}
          subtitle={`${data.holdings.length} active positions`}
          icon={<Eye className="text-cyan-400" />}
          color="border-cyan-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Chart */}
        <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl">
          <h3 className="text-lg font-bold text-white mb-6">Portfolio Performance (7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
              <XAxis dataKey="day" stroke="rgba(148,163,184,0.5)" />
              <YAxis stroke="rgba(148,163,184,0.5)" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15,23,42,0.8)', border: '1px solid rgb(71,85,105)' }}
                formatter={(value) => `$${value.toFixed(2)}`}
              />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" dot={false} strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Portfolio Allocation */}
        {data.holdings.length > 0 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6">Allocation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Holdings Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-lg text-white">Your Holdings</h3>
          <span className="text-xs text-slate-500 font-mono bg-slate-900/50 px-3 py-1 rounded">Live • Updated {new Date().toLocaleTimeString()}</span>
        </div>
        
        {data.holdings.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No holdings yet. Start trading!</p>
            <button 
              onClick={() => navigate('/market')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Explore Market
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/50 text-slate-300 text-xs uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-4">Asset</th>
                  <th className="p-4">Shares</th>
                  <th className="p-4">Avg Cost</th>
                  <th className="p-4">Current</th>
                  <th className="p-4">Gain/Loss</th>
                  <th className="p-4">Value</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {data.holdings.map((stock) => {
                  const gain = ((stock.current_price - stock.avg_cost) / stock.avg_cost) * 100;
                  const value = stock.current_price * stock.shares;
                  return (
                    <tr key={stock.ticker} className="hover:bg-slate-700/20 transition-colors">
                      <td className="p-4">
                        <span 
                          className="font-bold text-blue-400 cursor-pointer hover:underline"
                          onClick={() => navigate(`/market?ticker=${stock.ticker}`)}
                        >
                          {stock.ticker}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300 font-mono">{stock.shares}</td>
                      <td className="p-4 text-slate-300 font-mono">${stock.avg_cost.toFixed(2)}</td>
                      <td className="p-4 text-slate-300 font-mono">${stock.current_price.toFixed(2)}</td>
                      <td className={`p-4 font-bold flex items-center gap-1 ${gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {gain >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {gain.toFixed(2)}%
                      </td>
                      <td className="p-4 text-slate-300 font-mono">${value.toFixed(2)}</td>
                      <td className="p-4 text-right space-x-2">
                        <button 
                          onClick={() => openTradeModal(stock.ticker, 'sell')}
                          className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded transition text-xs"
                        >
                          Sell
                        </button>
                        <button 
                          onClick={() => openTradeModal(stock.ticker, 'buy')}
                          className="px-3 py-1 bg-green-600/20 text-green-400 hover:bg-green-600/40 rounded transition text-xs"
                        >
                          Buy
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trade Modal */}
      <TradeModal 
        isOpen={modal.isOpen}
        ticker={modal.ticker}
        type={modal.type}
        onClose={() => setModal({ isOpen: false, ticker: '', type: '' })}
        onSuccess={() => {
          fetchDashboardData();
          setNotification(`${modal.type} order placed successfully!`, 'success');
        }}
        setNotification={setNotification}
      />
    </div>
  );
};

export default Dashboard;