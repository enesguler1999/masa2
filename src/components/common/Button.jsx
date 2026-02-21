
import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-black text-white hover:bg-neutral-800 active:transform active:scale-95',
        secondary: 'bg-white text-black border border-neutral-200 hover:bg-neutral-50 active:transform active:scale-95 shadow-sm',
        ghost: 'bg-transparent text-black hover:bg-neutral-100',
        danger: 'bg-red-500 text-white hover:bg-red-600',
    };

    const sizes = {
        sm: 'text-sm px-3 py-1.5 rounded-full',
        md: 'text-base px-5 py-2.5 rounded-full',
        lg: 'text-lg px-8 py-3.5 rounded-full',
        icon: 'p-2 rounded-full',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
