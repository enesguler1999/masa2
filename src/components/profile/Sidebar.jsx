import React, { useState } from 'react';
import {
    Ticket,
    User,
    CreditCard,
    Settings,
    LogOut,
    ChevronDown,
    ChevronUp,
    ShieldAlert
} from 'lucide-react';
import { authService } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ user, activeSection, setActiveSection }) {
    const navigate = useNavigate();

    // Determine initial open menus based on activeSection
    const [openMenus, setOpenMenus] = useState({
        profile: activeSection === 'my-info',
        settings: ['update-password', 'delete-account', 'help'].includes(activeSection)
    });

    const toggleMenu = (menu) => {
        setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to logout:", error);
        }
    };

    if (!user) {
        return (
            <div className="bg-white rounded-[20px] shadow-sm border border-zinc-100 p-6 flex justify-center items-center flex-col gap-4 text-center">
                <p className="text-zinc-500 text-sm">Kullanıcı bilgileri yüklenemedi.</p>
                <button onClick={() => navigate('/login')} className="text-sm font-medium text-zinc-900 border px-4 py-2 rounded-xl">Tekrar Giriş Yap</button>
            </div>
        )
    }

    const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname || 'User')}&background=0D8ABC&color=fff&size=200`;

    // Helper to change view
    const navigateSection = (sectionId) => {
        setActiveSection(sectionId);
    };

    return (
        <div className="bg-white rounded-[20px] shadow-sm border border-zinc-100 overflow-hidden">
            {/* Profile Card Section */}
            <div className="p-6 border-b border-zinc-100">
                <div className="flex items-center gap-4 mb-5">
                    <img
                        src={avatarUrl}
                        alt={user.fullname}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-zinc-50"
                    />
                    <div>
                        <h2 className="font-bold text-zinc-900 leading-tight">{user.fullname}</h2>
                        <span className="text-zinc-500 text-[13px]">{user.email}</span>
                    </div>
                </div>

                <div className="flex items-center gap-6 mb-5">
                    <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900 leading-none mb-1">{user.followers || 0}</span>
                        <span className="text-[12px] text-zinc-500 font-medium">Takipçi</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900 leading-none mb-1">{user.following || 0}</span>
                        <span className="text-[12px] text-zinc-500 font-medium">Takip</span>
                    </div>
                </div>

                {!user.emailVerified && (
                    <button
                        onClick={() => navigate('/verify-email', { state: { email: user.email } })}
                        className="w-full flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[13px] font-semibold py-2.5 rounded-xl transition-colors"
                    >
                        <ShieldAlert size={16} />
                        E-Posta Adresini Doğrula
                    </button>
                )}
            </div>

            {/* Navigation Section */}
            <div className="p-3 space-y-1">
                <button
                    onClick={() => navigateSection('tickets')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-[14px] transition-colors ${activeSection === 'tickets' ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}
                >
                    <div className="flex items-center gap-3">
                        <Ticket size={18} className={activeSection === 'tickets' ? 'text-zinc-900' : 'text-zinc-600'} />
                        Biletlerim & Masalarım
                    </div>
                </button>

                <div>
                    <button
                        onClick={() => toggleMenu('profile')}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-[14px] transition-colors ${['my-info'].includes(activeSection) || openMenus.profile ? 'bg-zinc-50/50 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}
                    >
                        <div className="flex items-center gap-3">
                            <User size={18} className={openMenus.profile ? 'text-zinc-900' : 'text-zinc-600'} />
                            Profili Düzenle
                        </div>
                        {openMenus.profile ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {openMenus.profile && (
                        <div className="pl-11 pr-3 py-1 space-y-1">
                            <button
                                onClick={() => navigateSection('my-info')}
                                className={`block w-full text-left py-2 text-[13.5px] ${activeSection === 'my-info' ? 'text-zinc-900 font-semibold' : 'text-zinc-500 hover:text-zinc-900'}`}
                            >
                                Bilgilerim
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => navigateSection('payment')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-[14px] transition-colors ${activeSection === 'payment' ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}
                >
                    <div className="flex items-center gap-3">
                        <CreditCard size={18} className={activeSection === 'payment' ? 'text-zinc-900' : 'text-zinc-600'} />
                        Ödeme Bilgilerim
                    </div>
                </button>

                <div>
                    <button
                        onClick={() => toggleMenu('settings')}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-[14px] transition-colors ${['update-password', 'delete-account', 'help'].includes(activeSection) || openMenus.settings ? 'bg-zinc-50/50 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Settings size={18} className={openMenus.settings ? 'text-zinc-900' : 'text-zinc-600'} />
                            Ayarlar
                        </div>
                        {openMenus.settings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {openMenus.settings && (
                        <div className="pl-11 pr-3 py-1 space-y-1">
                            <button
                                onClick={() => navigateSection('update-password')}
                                className={`block w-full text-left py-2 text-[13.5px] ${activeSection === 'update-password' ? 'text-zinc-900 font-semibold' : 'text-zinc-500 hover:text-zinc-900'}`}
                            >
                                Şifre Güncelle
                            </button>
                            <button
                                onClick={() => navigateSection('delete-account')}
                                className={`block w-full text-left py-2 text-[13.5px] ${activeSection === 'delete-account' ? 'text-zinc-900 font-semibold' : 'text-zinc-500 hover:text-red-500'}`}
                            >
                                Hesabı Arşivle
                            </button>
                            <button
                                onClick={() => navigateSection('help')}
                                className={`block w-full text-left py-2 text-[13.5px] ${activeSection === 'help' ? 'text-zinc-900 font-semibold' : 'text-zinc-500 hover:text-zinc-900'}`}
                            >
                                Yardım
                            </button>
                        </div>
                    )}
                </div>

                <div className="pt-2 pb-1 mt-2 border-t border-zinc-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-medium text-[14px] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut size={18} />
                            Çıkış Yap
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
