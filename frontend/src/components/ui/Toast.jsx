import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-elevated border text-xs font-medium transition-all transform translate-y-0
                ${isSuccess 
                  ? 'bg-white text-zinc-800 border-zinc-200' 
                  : isError 
                    ? 'bg-rose-50 text-rose-800 border-rose-200' 
                    : 'bg-white text-zinc-800 border-zinc-200'
                }`}
            >
              {isSuccess && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
              {isError && <AlertCircle size={16} className="text-rose-500 shrink-0" />}
              {!isSuccess && !isError && <Info size={16} className="text-brand-500 shrink-0" />}
              <span>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
