import React from 'react';
import { Compass, Ticket } from 'lucide-react';
import Button from '../common/Button';

export default function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 h-full my-auto animate-in fade-in zoom-in-95 duration-300">
            {/* Abstract Graphic Base */}
            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-50/50 rounded-full blur-2xl" />
                <div className="relative z-10 w-24 h-24 bg-white border border-zinc-100 rounded-[28px] rotate-3 shadow-xl flex items-center justify-center text-zinc-300">
                    <Ticket size={48} strokeWidth={1.5} className="text-zinc-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg -rotate-12 z-20">
                    <span className="font-bold text-lg">M</span>
                </div>
                {/* Decorative Dots */}
                <div className="absolute top-1/2 -left-4 w-2 h-2 rounded-full bg-blue-400" />
                <div className="absolute bottom-0 right-4 w-3 h-3 rounded-full bg-emerald-400" />
            </div>

            <h3 className="text-2xl font-bold text-zinc-900 mb-3 tracking-tight">Eğlenceye Hazırlan!</h3>
            <p className="text-zinc-500 mb-8 max-w-[320px] text-[15px] leading-relaxed">
                Henüz masa için biletin yok, hemen bir bilet al ve eğlenmeye başla!
            </p>

            <Button size="lg" className="h-14 px-8 text-[15px] !rounded-[16px] gap-2.5 shadow-md shadow-zinc-900/5 hover:shadow-lg transition-all">
                <Compass size={20} />
                MASALARI KEŞFET
            </Button>
        </div>
    );
}
