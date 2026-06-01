import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = 'ok', title = '') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type, title }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600);
  }, []);

  const icons = { ok: '✓', err: '✕', inf: 'ℹ' };
  const colors = { ok: '#4ade80', err: '#f87171', inf: '#67e8f9' };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <span style={{ color: colors[t.type] }}>{icons[t.type]}</span>
            <span>{t.title && <strong>{t.title} · </strong>}{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
