import React, { useState } from 'react';
import { CreditCard, Plus, X, Trash2 } from 'lucide-react';
import Button from '../common/Button';

export default function PaymentInfo() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Mock cards
    const [cards, setCards] = useState([
        { id: 1, type: 'Visa', number: '**** **** **** 4242', expiry: '12/26', name: 'EMRE GÜLER' }
    ]);

    return (
        <div className="relative">
            <div className="bg-white rounded-[20px] shadow-sm border border-zinc-100 overflow-hidden min-h-[500px] flex flex-col">
                <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Ödeme Bilgilerim</h2>
                        <p className="text-zinc-500 text-[14px] mt-1">Kayıtlı kartlarınızı yönetin ve yeni kart ekleyin.</p>
                    </div>
                    <Button
                        onClick={() => setIsDrawerOpen(true)}
                        className="h-[44px] px-5 !rounded-xl text-[14px] gap-2 whitespace-nowrap"
                    >
                        <Plus size={18} />
                        Yeni Kart Ekle
                    </Button>
                </div>

                <div className="p-6 flex-1">
                    {cards.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-16 h-full">
                            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4 text-zinc-300">
                                <CreditCard size={32} />
                            </div>
                            <h3 className="font-semibold text-zinc-900 mb-1">Kayıtlı Kartınız Yok</h3>
                            <p className="text-zinc-500 text-[14px] max-w-[250px]">Henüz bir ödeme yöntemi eklemediniz. Bilet almak için hemen bir kart ekleyin.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {cards.map(card => (
                                <div key={card.id} className="border border-zinc-200 rounded-2xl p-5 relative overflow-hidden group hover:border-zinc-300 transition-all">
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-zinc-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-8 bg-zinc-100 rounded flex items-center justify-center text-[12px] font-bold text-zinc-600">
                                            {card.type}
                                        </div>
                                        <span className="font-semibold text-zinc-900 tracking-wider">
                                            {card.number}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[13px] text-zinc-500 uppercase tracking-wider font-medium">
                                        <span>{card.name}</span>
                                        <span>{card.expiry}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Drawer Overlay */}
            {isDrawerOpen && (
                <div
                    className="fixed inset-0 bg-zinc-950/20 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsDrawerOpen(false)}
                />
            )}

            {/* Drawer Content */}
            <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-zinc-900">Yeni Kart Ekle</h2>
                        <button
                            onClick={() => setIsDrawerOpen(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setIsDrawerOpen(false); }}>
                            <div>
                                <label className="block text-[14px] font-medium text-zinc-700 mb-1.5 ml-1">Kart Üzerindeki İsim</label>
                                <input
                                    type="text"
                                    placeholder="AD SOYAD"
                                    className="w-full h-[52px] bg-white border border-zinc-200 text-zinc-900 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-[15px] uppercase"
                                />
                            </div>
                            <div>
                                <label className="block text-[14px] font-medium text-zinc-700 mb-1.5 ml-1">Kart Numarası</label>
                                <input
                                    type="text"
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full h-[52px] bg-white border border-zinc-200 text-zinc-900 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-[15px]"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[14px] font-medium text-zinc-700 mb-1.5 ml-1">Son Kullanma (AA/YY)</label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        className="w-full h-[52px] bg-white border border-zinc-200 text-zinc-900 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-[15px]"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[14px] font-medium text-zinc-700 mb-1.5 ml-1">CVC/CVV</label>
                                    <input
                                        type="text"
                                        placeholder="123"
                                        className="w-full h-[52px] bg-white border border-zinc-200 text-zinc-900 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-[15px]"
                                    />
                                </div>
                            </div>

                            <div className="pt-6">
                                <Button type="submit" className="w-full h-[52px] !rounded-xl">Kartı Kaydet</Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
