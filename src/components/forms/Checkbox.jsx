import React from 'react';

/**
 * Checkbox – Projenin tasarım sistemiyle uyumlu, dinamik checkbox bileşeni.
 *
 * Props:
 *   id          {string}   – <input> ve <label> için benzersiz kimlik (zorunlu)
 *   checked     {boolean}  – Checkbox'ın işaretli durumu
 *   onChange    {function} – Durum değiştiğinde çağrılan handler
 *   label       {node}     – Checkbox yanındaki metin/içerik (JSX veya string)
 *   error       {string}   – Hata mesajı; varsa kırmızı outline + hata metni gösterir
 *   disabled    {boolean}  – Devre dışı bırakma
 *   className   {string}   – Wrapper div'e ek sınıf
 *   size        {'sm'|'md'|'lg'} – Checkbox boyutu (varsayılan: 'md')
 */
const sizeMap = {
    sm: { box: 'w-[18px] h-[18px]', icon: 'w-2.5 h-2.5', text: 'text-[13px]' },
    md: { box: 'w-[25px] h-[25px]', icon: 'w-3 h-3', text: 'text-[14px]' },
    lg: { box: 'w-[30px] h-[30px]', icon: 'w-3.5 h-3.5', text: 'text-[15px]' },
};

export default function Checkbox({
    id,
    checked = false,
    onChange,
    label,
    error,
    disabled = false,
    className = '',
    size = 'md',
}) {
    const s = sizeMap[size] ?? sizeMap.md;

    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <label
                htmlFor={id}
                className={`flex items-center gap-3 cursor-pointer select-none group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {/* Hidden native input */}
                <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className="sr-only"
                    aria-describedby={error ? `${id}-error` : undefined}
                />

                {/* Custom box */}
                <span
                    className={`
                        flex-shrink-0 ${s.box} rounded-[6px] border-2
                        flex items-center justify-center
                        transition-all duration-200
                        ${checked
                            ? 'bg-zinc-900 border-zinc-900'
                            : error
                                ? 'bg-red-50 border-red-400'
                                : 'bg-neutral-100 border-transparent group-hover:border-zinc-300'
                        }
                        ${!disabled ? 'group-hover:shadow-sm' : ''}
                    `}
                    aria-hidden="true"
                >
                    {checked && (
                        <svg
                            className={`${s.icon} text-white`}
                            viewBox="0 0 12 12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="1.5,6 4.5,9 10.5,3" />
                        </svg>
                    )}
                </span>

                {/* Label text */}
                {label && (
                    <span className={`${s.text} text-zinc-700 leading-relaxed font-medium`}>
                        {label}
                    </span>
                )}
            </label>

            {/* Error message */}
            {error && (
                <p id={`${id}-error`} className="text-xs text-red-500 ml-1 font-medium">
                    {error}
                </p>
            )}
        </div>
    );
}
