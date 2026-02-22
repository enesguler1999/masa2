import React from 'react';

export default function Tabs({ activeTab, setActiveTab }) {
    const tabs = [
        { id: 'biletlerim', label: 'Biletlerim' },
        { id: 'olusturduklarim', label: 'Oluşturduklarım' },
        { id: 'katildiklarim', label: 'Katıldıklarım' },
        { id: 'favorilerim', label: 'Favorilerim' },
        { id: 'taslaklar', label: 'Taslaklar' },
    ];

    return (
        <div className="border-b border-zinc-100 flex overflow-x-auto no-scrollbar scroll-smooth">
            <div className="flex px-4 pt-1">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                relative py-4 px-5 text-[14px] font-semibold whitespace-nowrap transition-colors
                                ${isActive ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}
                            `}
                        >
                            {tab.label}
                            {/* Active indicator */}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-950 rounded-t-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
