import { useEffect } from 'react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts?.length) return null;
  return (
    <div className="toast-container">
      {toasts.map((t, i) => (
        <ToastItem key={t.id || i} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    if (toast.duration !== 0) {
      const t = setTimeout(() => onDismiss(toast.id), toast.duration || 3000);
      return () => clearTimeout(t);
    }
  }, [toast, onDismiss]);

  return (
    <div className={`toast toast--${toast.type || 'info'} ${toast.dismissing ? 'toast--out' : ''}`}
      onClick={() => onDismiss(toast.id)}>
      <span className="toast__icon">
        {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
      </span>
      <span className="toast__msg">{toast.message}</span>
    </div>
  );
}
