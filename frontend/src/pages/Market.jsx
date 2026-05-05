import React, { useState } from 'react';
import api from '../api';
import { Search, TrendingUp, DollarSign, BrainCircuit, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Market = () => {
  const [query, setQuery] = useState('');
  const [stock, setStock] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [trading, setTrading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAnalysis('');
    try {
      const res = await api.get(`/market/info/${query}`);
      setStock(res.data);
    } catch (err) {
      alert("Stock not found! Try AAPL or TSLA.");
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
      setAnalysis("AI Analysis failed to load.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTrade = async (type) => {
    if (quantity <= 0) return alert("Please enter a valid quantity.");
    setTrading(true);
    try {
      const res = await api.post(`/trading/${type}`, {
        ticker: stock.symbol,
        quantity: quantity
      });
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Trade failed. Check your balance.");
    } finally {
      setTrading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Market Explorer</h2>
      
      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Search Ticker (e.g. NVDA, MSFT)..." 
            className="w-full pl-10 p-3 bg-slate-800 border border-slate-700 rounded-lg outline-none focus:border-blue-500 transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
          />
        </div>
        <button className="bg-blue-600 px-8 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2">
          {loading && <Loader2 className="animate-spin" size={18} />}
          {loading ? 'Fetching...' : 'Analyze'}
        </button>
      </form>

      {stock && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">{stock.name}</h3>
                  <p className="text-4xl font-mono text-blue-400 mt-2 font-black tracking-tighter">
                    ${stock.currentPrice.toLocaleString()}
                  </p>
                </div>
                <button 
                  onClick={getAIAnalysis}
                  disabled={analyzing}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                  <BrainCircuit size={18} className={analyzing ? 'animate-pulse text-white' : 'text-indigo-200'} />
                  {analyzing ? 'Consulting Gemini...' : 'AI Sentiment Analysis'}
                </button>
              </div>
              
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stock.chart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#60a5fa' }}
                    />
                    <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} dot={false} animationDuration={1500} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {analysis && (
              <div className="bg-slate-800 border-l-4 border-indigo-500 p-6 rounded-r-xl shadow-xl animate-in slide-in-from-left-4">
                <div className="flex items-center gap-2 text-indigo-400 mb-2 uppercase text-xs font-black tracking-widest">
                  <BrainCircuit size={16} /> AI Summary
                </div>
                <div className="text-slate-300 leading-relaxed font-medium">
                  {analysis}
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-fit sticky top-6">
            <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
              <DollarSign size={20} className="text-green-400" /> Terminal Order
            </h4>
            <div className="space-y-5">
               <div>
                 <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Shares to Purchase</label>
                 <input 
                  type="number" 
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full mt-1 p-4 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-xl" 
                 />
               </div>
               
               <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Estimated Total</span>
                    <span>${(quantity * stock.currentPrice).toLocaleString()}</span>
                  </div>
               </div>

               <button 
                onClick={() => handleTrade('buy')}
                disabled={trading}
                className="w-full bg-green-600 p-4 rounded-xl font-black text-white hover:bg-green-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 active:scale-95"
               >
                 {trading ? <Loader2 className="animate-spin" /> : 'CONFIRM BUY'}
               </button>

               <button 
                onClick={() => handleTrade('sell')}
                disabled={trading}
                className="w-full border border-slate-600 p-4 rounded-xl font-bold text-slate-300 hover:bg-slate-700 transition-all active:scale-95"
               >
                 SELL POSITION
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Market;