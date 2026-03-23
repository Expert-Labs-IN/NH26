import { useEffect } from 'react';
import { CheckCircle, X, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/helpers';

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
  variant?: 'success' | 'info';
}

export default function Toast({ message, onDismiss, variant = 'success' }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  const isRejected = message.toLowerCase().includes('rejected');

  return (
    <div
      className={cn(
        'fixed bottom-5 right-5 z-50',
        'flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl',
        'max-w-sm animate-slide-up',
        isRejected
          ? 'bg-slate-800 dark:bg-slate-700 text-white'
          : 'bg-slate-900 dark:bg-slate-800 text-white'
      )}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      {isRejected ? (
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" aria-hidden="true" />
      ) : (
        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" aria-hidden="true" />
      )}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={onDismiss}
        className="p-0.5 rounded text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white flex-shrink-0"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
