import React from 'react';
import MasaSpinner from './MasaSpinner';

/**
 * Full-screen page loader — sadece MasaSpinner'ı bg-zinc-50 üzerinde ortalar.
 */
export default function PageLoader() {
    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-50"
            aria-label="Yükleniyor"
            role="status"
        >
            <MasaSpinner size={112} />
        </div>
    );
}
