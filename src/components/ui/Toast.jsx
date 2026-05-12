import { useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

export function Toast({ message, type = 'info', onClose, autoClose = true }) {
  useEffect(() => {
    if (!autoClose) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [autoClose, onClose]);

  const baseClasses =
    'fixed bottom-4 right-4 max-w-sm rounded-lg shadow-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4 z-50';

  const typeClasses = {
    success: 'bg-green-50 border border-green-200',
    error: 'bg-red-50 border border-red-200',
    info: 'bg-blue-50 border border-blue-200',
    warning: 'bg-yellow-50 border border-yellow-200',
  };

  const textClasses = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
    warning: 'text-yellow-800',
  };

  const iconClasses = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
    warning: 'text-yellow-600',
  };

  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <Icon size={20} className={`${iconClasses[type]} flex-shrink-0 mt-0.5`} />
      <p className={`text-sm ${textClasses[type]} flex-1`}>{message}</p>
      <button
        onClick={onClose}
        className={`flex-shrink-0 ${textClasses[type]} hover:opacity-70`}
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default Toast;
