import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Send, Zap, Brain, AlertCircle } from 'lucide-react';

const AIChat = ({ setNotification }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [portfolioHealth, setPortfolioHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getPortfolioHealth = async () => {
    try {
      setLoadingHealth(true);
      const res = await api.get('/ai/diagnose');
      setPortfolioHealth(res.data.analysis);
      setMessages([{ role: 'model', content: res.data.analysis }]);
      setNotification('Portfolio diagnosis complete', 'success');
    } catch (err) {
      setNotification('Failed to get portfolio diagnosis', 'error');
    } finally {
      setLoadingHealth(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage;
    setInputMessage('');
    setMessages([...messages, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: userMsg });
      setMessages((prev) => [...prev, { role: 'model', content: res.data.response }]);
    } catch (err) {
      setNotification(err.response?.data?.error || 'Failed to get AI response', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 h-screen flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">AI Financial Assistant</h1>
        <p className="text-slate-400">Chat with Fin-Intel AI for personalized trading insights</p>
      </div>

      {/* Diagnostic Button */}
      <button
        onClick={getPortfolioHealth}
        disabled={loadingHealth}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-bold flex items-center justify-center gap-3 transition disabled:opacity-50"
      >
        <Brain size={20} />
        {loadingHealth ? 'Analyzing Portfolio...' : 'Get Portfolio Diagnosis'}
      </button>

      {/* Chat Container */}
      <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col shadow-xl">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <Zap size={64} className="text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg mb-2">Start a conversation</p>
                <p className="text-slate-500 text-sm">Ask me about your portfolio, market trends, or trading strategies</p>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md px-4 py-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-100 border border-slate-700'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-900 text-slate-100 border border-slate-700 px-4 py-3 rounded-lg">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="border-t border-slate-700 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about stocks..."
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-2 transition disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 flex gap-3">
        <AlertCircle className="text-blue-400 shrink-0" size={20} />
        <p className="text-slate-400 text-sm">
          <strong>Tip:</strong> Ask about portfolio optimization, stock analysis, risk management, or trading strategies!
        </p>
      </div>
    </div>
  );
};

export default AIChat;
