import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../api';

const TradeModal = ({ isOpen, onClose, ticker, type, onTradeSuccess, onSuccess, setNotification }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleTrade = async () => {
    if (quantity <= 0) {
      if (setNotification) setNotification('Quantity must be greater than 0', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/trading/${type.toLowerCase()}`, {
        ticker: ticker.toUpperCase(),
        quantity: parseInt(quantity)
      });
      
      if (setNotification) {
        setNotification(res.data.message || `${type} order placed successfully!`, 'success');
      }
      
      // Support both old and new callback patterns
      if (onSuccess) onSuccess();
      if (onTradeSuccess) onTradeSuccess();
      
      onClose();
      setQuantity(1);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Trade failed";
      if (setNotification) {
        setNotification(errorMsg, 'error');
      } else {
        alert(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-gradient-to-r from-slate-800/50 to-slate-700/50">
          <h3 className="text-xl font-bold">
            {type === 'BUY' ? '🟢' : '🔴'} {type} <span className="text-blue-400">{ticker}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <label className="text-xs text-slate-400 uppercase font-black tracking-widest">Quantity</label>
            <input 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              className="w-full mt-2 p-4 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 text-2xl font-mono text-white"
            />
          </div>

          <button 
            onClick={handleTrade}
            disabled={loading}
            className={`w-full p-4 rounded-xl font-black transition-all flex items-center justify-center gap-2 ${
              type === 'BUY' 
                ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-900/30 disabled:opacity-50' 
                : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/30 disabled:opacity-50'
            } text-white`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processing...
              </>
            ) : (
              `CONFIRM ${type}`
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full p-3 border border-slate-600 hover:bg-slate-700 rounded-xl font-semibold text-slate-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeModal;