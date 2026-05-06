import React, { useState, useEffect } from 'react';
import api from '../api';
import { Calendar, Filter, Download } from 'lucide-react';

const Portfolio = ({ setNotification }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/trading/history?page=${page}&per_page=20`);
      setTransactions(res.data.transactions);
    } catch (err) {
      setNotification('Failed to load transaction history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  const getTotalSpent = () => {
    return transactions
      .filter(t => t.type === 'BUY')
      .reduce((sum, t) => sum + (t.price * t.quantity), 0);
  };

  const getTotalEarned = () => {
    return transactions
      .filter(t => t.type === 'SELL')
      .reduce((sum, t) => sum + (t.price * t.quantity), 0);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Portfolio History</h1>
        <p className="text-slate-400">Complete transaction history and portfolio analytics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <p className="text-slate-400 text-sm">Total Transactions</p>
          <h3 className="text-3xl font-bold text-white mt-2">{transactions.length}</h3>
        </div>
        <div className="bg-slate-800 rounded-xl border border-red-700/30 p-6">
          <p className="text-slate-400 text-sm">Total Spent (Buy Orders)</p>
          <h3 className="text-3xl font-bold text-red-400 mt-2">${getTotalSpent().toFixed(2)}</h3>
        </div>
        <div className="bg-slate-800 rounded-xl border border-green-700/30 p-6">
          <p className="text-slate-400 text-sm">Total Earned (Sell Orders)</p>
          <h3 className="text-3xl font-bold text-green-400 mt-2">${getTotalEarned().toFixed(2)}</h3>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-lg text-white">Transaction History</h3>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition">
            <Download size={20} className="text-slate-400" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Calendar size={48} className="text-slate-600 mx-auto mb-4" />
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/50 text-slate-300 text-xs uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-4 text-left">Ticker</th>
                  <th className="p-4 text-left">Type</th>
                  <th className="p-4 text-left">Quantity</th>
                  <th className="p-4 text-left">Price</th>
                  <th className="p-4 text-left">Total</th>
                  <th className="p-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {transactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-700/20 transition">
                    <td className="p-4 font-bold text-blue-400">{tx.ticker}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${tx.type === 'BUY' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{tx.quantity}</td>
                    <td className="p-4 text-slate-300 font-mono">${tx.price.toFixed(2)}</td>
                    <td className="p-4 text-slate-300 font-mono">${(tx.price * tx.quantity).toFixed(2)}</td>
                    <td className="p-4 text-slate-400 text-xs">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
