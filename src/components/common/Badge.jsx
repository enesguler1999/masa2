
import React from 'react';

const Badge = ({ children, variant = 'neutral', className = '' }) => {
    const variants = {
        neutral: 'bg-neutral-100 text-neutral-800',
        primary: 'bg-black text-white',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
