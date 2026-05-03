import { AlertCircle, RefreshCw } from 'lucide-react';

export function AppError({ message, onRetry }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-red-800 font-medium">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 mt-2 px-3 py-1.5 text-sm font-medium text-red-700 hover:text-red-900 hover:bg-red-100 rounded transition"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export default AppError;
