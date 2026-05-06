import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export const Notification = ({ notification }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-900/90 border-green-500/50 text-green-100';
      case 'error':
        return 'bg-red-900/90 border-red-500/50 text-red-100';
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-500/50 text-yellow-100';
      default:
        return 'bg-blue-900/90 border-blue-500/50 text-blue-100';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border backdrop-blur-sm flex items-center gap-3 ${getStyles()} animate-slide-in-right`}>
      {getIcon()}
      <span className="font-medium">{notification.message}</span>
    </div>
  );
};
