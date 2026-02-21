
import React from 'react';

const Slider = ({
    label,
    min = 0,
    max = 100,
    step = 1,
    value,
    onChange,
    className = '',
    ...props
}) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className={`flex flex-col gap-2 w-full ${className}`}>
            {label && (
                <div className="flex justify-between items-center px-1">
                    <label className="text-sm font-semibold text-neutral-700">{label}</label>
                    <span className="text-xs font-medium text-neutral-500">{value}</span>
                </div>
            )}
            <div className="relative w-full h-6 flex items-center">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={onChange}
                    className="w-full absolute z-20 opacity-0 cursor-pointer h-full"
                    {...props}
                />
                <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden absolute z-10">
                    <div
                        className="h-full bg-black rounded-full"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <div
                    className="w-5 h-5 bg-white border-2 border-black rounded-full shadow-sm absolute z-10 pointer-events-none transition-transform duration-75 ease-out"
                    style={{ left: `calc(${percentage}% - 10px)` }}
                />
            </div>
        </div>
    );
};

export default Slider;
