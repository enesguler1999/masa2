import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext(null);

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Toast göstermek için hook.
 * Kullanım:
 *   const { showToast } = useToast();
 *   showToast({ message: 'İşlem başarılı!', variant: 'success', duration: 4000 });
 *
 * variant: 'success' | 'error' | 'warning' | 'info'
 * duration: ms cinsinden gösterim süresi (default: 4000)
 */
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const counterRef = useRef(0);

    const showToast = useCallback(({
        message,
        variant = 'info',
        duration = 4000,
    }) => {
        const id = ++counterRef.current;
        setToasts((prev) => [...prev, { id, message, variant, duration, exiting: false }]);

        // Auto-dismiss
        setTimeout(() => {
            dismissToast(id);
        }, duration);
    }, []);

    const dismissToast = useCallback((id) => {
        // Mark as exiting first (for exit animation)
        setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
        );
        // Remove after animation
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 350);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </ToastContext.Provider>
    );
}

// ─── Toast Container ──────────────────────────────────────────────────────────

function ToastContainer({ toasts, onDismiss }) {
    if (!toasts.length) return null;
    return createPortal(
        <div
            aria-live="polite"
            className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none"
        >
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>,
        document.body
    );
}

// ─── Toast Item ───────────────────────────────────────────────────────────────

const VARIANTS = {
    success: {
        bar: 'bg-green-500',
        icon: (
            <svg className="w-5 h-5 shrink-0 text-green-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        ),
    },
    error: {
        bar: 'bg-red-500',
        icon: (
            <svg className="w-5 h-5 shrink-0 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
    },
    warning: {
        bar: 'bg-yellow-400',
        icon: (
            <svg className="w-5 h-5 shrink-0 text-yellow-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
        ),
    },
    info: {
        bar: 'bg-blue-500',
        icon: (
            <svg className="w-5 h-5 shrink-0 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z" />
            </svg>
        ),
    },
};

function ToastItem({ toast, onDismiss }) {
    const v = VARIANTS[toast.variant] || VARIANTS.info;

    return (
        <div
            className={`
                pointer-events-auto relative flex items-start gap-3
                bg-white rounded-2xl shadow-xl border border-zinc-100
                px-4 py-3.5 min-w-0 overflow-hidden
                transition-all duration-350
                ${toast.exiting
                    ? 'opacity-0 translate-x-8 scale-95'
                    : 'opacity-100 translate-x-0 scale-100 animate-in slide-in-from-right-4 fade-in duration-300'
                }
            `}
            role="alert"
        >
            {/* Renkli sol çubuk */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${v.bar}`} />

            {/* İkon */}
            <div className="mt-0.5 ml-2">{v.icon}</div>

            {/* Mesaj */}
            <p className="flex-1 text-[14px] font-semibold text-zinc-800 leading-snug pr-2">
                {toast.message}
            </p>

            {/* Kapat butonu */}
            <button
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 text-zinc-400 hover:text-zinc-700 transition-colors focus:outline-none"
                aria-label="Kapat"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}
