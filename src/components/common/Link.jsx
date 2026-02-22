import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const Link = ({
    to,
    children,
    variant = 'primary',
    className = '',
    ...props
}) => {
    const baseStyles = 'transition-colors';

    const variants = {
        primary: 'text-zinc-600 hover:text-zinc-900',
        secondary: 'text-zinc-900 hover:text-black hover:underline font-semibold',
    };

    return (
        <RouterLink
            to={to}
            className={`${baseStyles} ${variants[variant] || ''} ${className}`}
            {...props}
        >
            {children}
        </RouterLink>
    );
};

export default Link;
