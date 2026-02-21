
import React from 'react';

const Card = ({ children, className = '', noPadding = false, ...props }) => {
    return (
        <div
            className={`bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden ${noPadding ? '' : 'p-6'} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '' }) => (
    <div className={`px-6 py-4 border-b border-neutral-100 font-bold text-lg ${className}`}>
        {children}
    </div>
);

export const CardFooter = ({ children, className = '' }) => (
    <div className={`px-6 py-4 border-t border-neutral-100 bg-neutral-50 ${className}`}>
        {children}
    </div>
);

export default Card;
