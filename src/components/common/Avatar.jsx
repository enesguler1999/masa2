
import React from 'react';

const Avatar = ({ src, alt, size = 'md', className = '', ...props }) => {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-base',
        xl: 'w-20 h-20 text-xl',
    };

    return (
        <div
            className={`relative inline-flex items-center justify-center overflow-hidden bg-neutral-200 rounded-full ${sizes[size]} ${className}`}
            {...props}
        >
            {src ? (
                <img src={src} alt={alt || 'Avatar'} className="w-full h-full object-cover" />
            ) : (
                <span className="font-medium text-neutral-600">
                    {(alt || '?').charAt(0).toUpperCase()}
                </span>
            )}
        </div>
    );
};

export default Avatar;
