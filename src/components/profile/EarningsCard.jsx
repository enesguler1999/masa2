import React from 'react';
import { ArrowRight, TrendingUp } from 'lucide-react';
import Button from '../common/Button';

export default function EarningsCard() {
    return (
        <div className="bg-zinc-950 text-white rounded-[20px] p-6 relative overflow-hidden shadow-lg">
            {/* Background minimal graphic */}
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-zinc-800/40 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-zinc-400 font-medium text-[13px] uppercase tracking-wider">Güncel Kazancın</h3>
                        <div className="flex items-center justify-center p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                            <TrendingUp size={14} />
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl md:text-5xl font-extrabold tracking-tight">₺0,00</span>
                    </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-3 text-left md:text-right">
                    <p className="text-[14px] text-zinc-300 max-w-[240px] leading-relaxed">
                        Hemen masa oluştur, <span className="text-white font-semibold">hem kazan hem de eğlen!</span>
                    </p>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button
                            variant="secondary"
                            className="bg-white text-black border-none hover:bg-zinc-200 h-10 px-5 !rounded-xl text-[14px] flex-1 md:flex-none"
                        >
                            Detaylı İncele
                        </Button>
                        <button className="h-10 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center text-white">
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
