
import React, { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    error,
    className = '',
    containerClassName = '',
    ...props
}, ref) => {
    return (
        <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
            {label && (
                <label className="text-sm font-semibold text-neutral-700 ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                <input
                    ref={ref}
                    className={`
            w-full bg-neutral-100 text-neutral-900 placeholder-neutral-400
            px-4 py-3 rounded-xl border-2 border-transparent
            focus:bg-white focus:border-black focus:outline-none
            disabled:bg-neutral-50 disabled:text-neutral-400
            transition-all duration-200 ${error ? '!border-red-500 bg-red-50' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <span className="text-xs text-red-500 ml-1 font-medium">{error}</span>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
