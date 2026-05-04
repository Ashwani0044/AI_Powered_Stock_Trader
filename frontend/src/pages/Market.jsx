import React, { useState } from 'react';
import api from '../api';
import { Search, TrendingUp, DollarSign, BrainCircuit } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Market = () => {
  const [query, setQuery] = useState('');
  const [stock, setStock] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAnalysis(''); // Clear old analysis
    try {
      const res = await api.get(`/market/info/${query}`); 
      setStock(res.data);
    } catch (err) {
      alert("Stock not found!");
    } finally {
      setLoading(false);
    }
  };

  const getAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await api.get(`/market/analyze/${stock.symbol}`);
      setAnalysis(res.data.analysis);
    } catch (err) {
      setAnalysis("AI Analysis currently unavailable.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Market Explorer</h2>
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Enter Ticker..." 
            className="w-full pl-10 p-3 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:border-blue-500 transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
          />
        </div>
        <button className="bg-blue-600 px-8 rounded-lg font-bold hover:bg-blue-700 transition active:scale-95">
          {loading ? 'Consulting Market...' : 'Analyze'}
        </button>
      </form>

      {stock && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart & AI Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">{stock.name}</h3>
                  <p className="text-3xl font-mono text-blue-400 mt-2">${stock.currentPrice}</p>
                </div>
                <button 
                  onClick={getAIAnalysis}
                  disabled={analyzing}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-full text-sm font-bold transition"
                >
                  <BrainCircuit size={18} className={analyzing ? 'animate-pulse' : ''} />
                  {analyzing ? 'Thinking...' : 'AI Sentiment'}
                </button>
              </div>
              
              {/* Chart Placeholder */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stock.chart}>
                    <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} dot={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Result Box */}
            {analysis && (
              <div className="bg-indigo-900/20 border border-indigo-500/30 p-6 rounded-xl animate-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2 text-indigo-400 mb-3 uppercase text-xs font-black tracking-widest">
                  <BrainCircuit size={16} /> Gemini Insights
                </div>
                <div className="text-slate-200 leading-relaxed font-serif italic text-lg">
                  "{analysis}"
                </div>
              </div>
            )}
          </div>

          {/* Trade Actions (Right Sidebar) */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-fit">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-green-400" /> Execute Trade
            </h4>
            <div className="space-y-4">
              <input type="number" placeholder="Quantity" className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg outline-none" />
              <button className="w-full bg-green-600 p-4 rounded-lg font-bold hover:bg-green-700 transition">Buy {stock.symbol}</button>
              <button className="w-full border border-slate-600 p-4 rounded-lg font-bold hover:bg-slate-700 transition">Sell {stock.symbol}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Market;