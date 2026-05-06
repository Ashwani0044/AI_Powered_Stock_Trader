import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import { Search, TrendingUp, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TradeModal from '../components/TradeModal';

const Market = ({ setNotification }) => {
  const [searchParams] = useSearchParams();
  const [ticker, setTicker] = useState(searchParams.get('ticker') || 'AAPL');
  const [searchInput, setSearchInput] = useState('');
  const [stockInfo, setStockInfo] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, ticker: '', type: 'BUY' });
  const [chartData, setChartData] = useState([]);

  const fetchStockData = async (sym) => {
    if (!sym || sym.length === 0) return;
    
    try {
      setLoading(true);
      
      // Fetch stock info and chart data
      const infoRes = await api.get(`/market/info/${sym}`);
      setStockInfo(infoRes.data);

      // Fetch analysis
      const analysisRes = await api.get(`/market/analyze/${sym}`);
      setAnalysis(analysisRes.data);

      // Transform chart data
      const chartArray = infoRes.data.chart.map(item => ({
        time: item.time,
        price: item.price,
      }));
      setChartData(chartArray);

      setNotification(`Loaded ${sym} data`, 'success');
    } catch (err) {
      setNotification(err.response?.data?.error || 'Failed to fetch stock data', 'error');
      setStockInfo(null);
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData(ticker);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setTicker(searchInput.toUpperCase());
      setSearchInput('');
      fetchStockData(searchInput.toUpperCase());
    }
  };

  const suggestedTickers = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Market Explorer</h1>
        <p className="text-slate-400">Search stocks, view charts, and AI-powered analysis</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3.5 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search ticker (AAPL, GOOGL, MSFT...)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            Search
          </button>
        </div>
      </form>

      {/* Quick Links */}
      <div className="space-y-2">
        <p className="text-slate-400 text-sm font-medium">Popular Tickers:</p>
        <div className="flex flex-wrap gap-2">
          {suggestedTickers.map((sym) => (
            <button
              key={sym}
              onClick={() => {
                setTicker(sym);
                fetchStockData(sym);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                ticker === sym
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading {ticker} data...</p>
          </div>
        </div>
      ) : stockInfo ? (
        <>
          {/* Stock Header */}
          <div className="bg-linear-to-r from-blue-900/20 to-slate-800 rounded-xl border border-slate-700 p-8 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-5xl font-bold text-white mb-2">{stockInfo.symbol}</h2>
                <p className="text-slate-300 text-lg">{stockInfo.name}</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-blue-400 mb-2">${stockInfo.currentPrice.toFixed(2)}</div>
                <button
                  onClick={() => setModal({ isOpen: true, ticker: stockInfo.symbol, type: 'BUY' })}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-2 ml-auto transition"
                >
                  <TrendingUp size={20} />
                  Buy {stockInfo.symbol}
                </button>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6">7-Day Performance</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                  <XAxis dataKey="time" stroke="rgba(148,163,184,0.5)" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="rgba(148,163,184,0.5)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgb(71,85,105)' }}
                    formatter={(value) => `$${value.toFixed(2)}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#3b82f6"
                    dot={{ fill: '#3b82f6', r: 4 }}
                    strokeWidth={3}
                    isAnimationActive
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500">
                No chart data available
              </div>
            )}
          </div>

          {/* AI Analysis */}
          {analysis && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="text-yellow-400" size={24} />
                <h3 className="text-lg font-bold text-white">AI Analysis</h3>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{analysis.analysis}</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-slate-500 text-lg">Enter a ticker to get started</p>
          </div>
        </div>
      )}

      {/* Trade Modal */}
      <TradeModal
        isOpen={modal.isOpen}
        ticker={modal.ticker}
        type={modal.type}
        onClose={() => setModal({ isOpen: false, ticker: '', type: 'BUY' })}
        onSuccess={() => fetchStockData(ticker)}
        setNotification={setNotification}
      />
    </div>
  );
};

export default Market;