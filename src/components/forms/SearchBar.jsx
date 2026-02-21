
import React from 'react';

const SearchBar = ({
    placeholder = 'Search...',
    value,
    onChange,
    className = '',
    ...props
}) => {
    return (
        <div className={`relative flex items-center w-full max-w-md ${className}`}>
            <div className="absolute left-4 text-neutral-400 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </div>
            <input
                type="text"
                className="w-full bg-neutral-100 text-neutral-900 placeholder-neutral-400 pl-11 pr-4 py-3 rounded-full border-2 border-transparent focus:bg-white focus:border-black focus:outline-none transition-all duration-200"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                {...props}
            />
        </div>
    );
};

export default SearchBar;
