import React, { useState, useEffect } from 'react';
import api from '../api';
import { Bookmark, Trash2, Plus } from 'lucide-react';
import TradeModal from '../components/TradeModal';

const Watchlist = ({ setNotification }) => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticker, setTicker] = useState('');
  const [modal, setModal] = useState({ isOpen: false, ticker: '', type: 'BUY' });

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const res = await api.get('/watchlist/');
      setWatchlist(res.data);
    } catch (err) {
      setNotification('Failed to load watchlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const addToWatchlist = async (e) => {
    e.preventDefault();
    if (!ticker.trim()) {
      setNotification('Please enter a ticker', 'warning');
      return;
    }

    try {
      await api.post('/watchlist/add', { ticker: ticker.toUpperCase() });
      setTicker('');
      fetchWatchlist();
      setNotification(`Added ${ticker.toUpperCase()} to watchlist`, 'success');
    } catch (err) {
      setNotification(err.response?.data?.message || 'Failed to add to watchlist', 'error');
    }
  };

  const removeFromWatchlist = async (ticker) => {
    try {
      await api.delete(`/watchlist/remove/${ticker}`);
      fetchWatchlist();
      setNotification(`Removed ${ticker} from watchlist`, 'success');
    } catch (err) {
      setNotification('Failed to remove from watchlist', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Watchlist</h1>
        <p className="text-slate-400">Track your favorite stocks and market opportunities</p>
      </div>

      {/* Add to Watchlist Form */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <form onSubmit={addToWatchlist} className="flex gap-3">
          <input
            type="text"
            placeholder="Enter ticker (e.g., AAPL)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition"
          >
            <Plus size={20} />
            Add
          </button>
        </form>
      </div>

      {/* Watchlist */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-700">
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <Bookmark size={20} className="text-blue-400" />
            Watched Stocks ({watchlist.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading watchlist...</p>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="p-12 text-center">
            <Bookmark size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">Your watchlist is empty</p>
            <p className="text-slate-500 text-sm">Add stocks to track them here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/50 text-slate-300 text-xs uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-4 text-left">Ticker</th>
                  <th className="p-4 text-left">Current Price</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {watchlist.map((item) => (
                  <tr key={item.ticker} className="hover:bg-slate-700/20 transition">
                    <td className="p-4 font-bold text-blue-400 text-lg">{item.ticker}</td>
                    <td className="p-4 font-mono text-slate-300">
                      ${item.current_price === 'N/A' ? 'N/A' : item.current_price.toFixed(2)}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setModal({ isOpen: true, ticker: item.ticker, type: 'BUY' })}
                        className="px-3 py-1 bg-green-600/20 text-green-400 hover:bg-green-600/40 rounded transition text-xs"
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => removeFromWatchlist(item.ticker)}
                        className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded transition text-xs inline-flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TradeModal
        isOpen={modal.isOpen}
        ticker={modal.ticker}
        type={modal.type}
        onClose={() => setModal({ isOpen: false, ticker: '', type: 'BUY' })}
        onSuccess={fetchWatchlist}
        setNotification={setNotification}
      />
    </div>
  );
};

export default Watchlist;
