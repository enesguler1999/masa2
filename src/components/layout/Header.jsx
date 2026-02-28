import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Plus, User, Bell, MessageCircle, ChevronDown, ChevronUp, CreditCard, KeyRound, LogOut, HelpCircle, Ticket, Pencil, Settings, UserMinus, LayoutDashboard } from 'lucide-react';
import { authService } from '../../services/authService';
import { useUser } from '../../context/UserContext';

export default function Header() {
    const location = useLocation();
    const navigate = useNavigate();
    const isHomePage = location.pathname === '/';

    const { user, clearUser } = useUser();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState('İstanbul');
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);

    const profileDropdownRef = useRef(null);
    const cityDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
                setCityDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const MOCK_CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa'];

    const handleLogout = async () => {
        try {
            await authService.logout();
            clearUser();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    // Dinamik renk sınıfları
    const headerBgClass = isHomePage
        ? 'bg-[#f3f3f3]/90 border-neutral-100 text-neutral-900'
        : 'bg-zinc-950/80 border-zinc-900 text-white';

    const logoSrc = isHomePage
        ? '/images/logo/logo-masa.svg'
        : '/images/logo/logo-masa-white.svg';

    const brandHref = isHomePage ? '#' : '/';
    const createTableBtnClass = isHomePage
        ? 'hover:bg-neutral-100 text-neutral-800'
        : 'hover:bg-zinc-800 text-white';

    // For dark theme we explicitly want a white background and black/dark plus icon
    // For white theme we want dark background and white plus icon
    const circleIconBgClass = isHomePage
        ? 'bg-zinc-900 text-white'
        : 'bg-white text-zinc-900';

    // Auth vars button styling
    const loginBtnClass = isHomePage
        ? 'bg-neutral-900 text-white hover:bg-neutral-800'
        : 'bg-white text-zinc-900 hover:bg-zinc-100';


    return (
        <header className={`fixed top-0 left-0 right-0 h-20 backdrop-blur-md border-b shadow-lg z-50 transition-colors duration-200 ${headerBgClass}`}>
            <div className="max-w-7xl mx-auto w-full h-full px-6 flex items-center justify-between">

                {/* Left side: Brand */}
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center">
                        <img src={logoSrc} alt="Masa Logo" className="h-10" />
                    </Link>

                    {/* Navigation - City Selector */}
                    <div className="hidden md:block relative" ref={cityDropdownRef}>
                        <button
                            onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                            className={`flex items-center gap-6 px-4 py-2 rounded-lg font-semibold transition-colors text-[14px] ${isHomePage ? 'bg-black/5 hover:bg-black/10 text-zinc-900' : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                        >
                            {selectedCity}
                            <ChevronDown size={16} strokeWidth={2.5} className={`opacity-60 transition-transform duration-200 ${cityDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* City Dropdown */}
                        {cityDropdownOpen && (
                            <div className="absolute top-full left-0 mt-4 w-48 bg-white rounded-xl shadow-lg border border-zinc-100 z-50 overflow-hidden text-zinc-900 py-2 animate-in slide-in-from-top-2 fade-in duration-200">
                                {MOCK_CITIES.map(city => (
                                    <button
                                        key={city}
                                        onClick={() => {
                                            setSelectedCity(city);
                                            setCityDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-zinc-50 transition-colors ${selectedCity === city ? 'bg-zinc-50 text-indigo-600' : 'text-zinc-700'}`}
                                    >
                                        {city}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right side: Actions & Profile */}
                <div className="flex items-center gap-4">

                    {/* Masa Oluştur - always visible */}
                    <button className={`flex items-center gap-2.5 transition-colors font-extrabold text-[16px] hover:opacity-80 ${isHomePage ? 'text-zinc-900' : 'text-white'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${circleIconBgClass}`}>
                            <Plus size={18} strokeWidth={3} />
                        </div>
                        Masa Oluştur
                    </button>

                    {!user ? (
                        /* Logged Out State */
                        <button
                            onClick={() => navigate('/login')}
                            className={`flex items-center gap-2 pl-1.5 pr-5 py-1.5 rounded-full font-bold text-[14px] transition-colors ${loginBtnClass}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isHomePage ? 'bg-black/10' : 'bg-white/20'}`}>
                                <User size={18} strokeWidth={2.5} className={isHomePage ? 'text-white' : 'text-neutral-900'} />
                            </div>
                            Giriş Yap
                        </button>
                    ) : (
                        /* Logged In State */
                        <div className="flex items-center gap-4">
                            <button className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isHomePage ? 'bg-black/5 hover:bg-black/10 text-zinc-900' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                                <Bell size={18} strokeWidth={2.5} />
                                <span className={`absolute top-1.5 right-2 w-2 h-2 bg-orange-500 rounded-full border-[1.5px] ${isHomePage ? 'border-[#f3f3f3]' : 'border-zinc-900'}`}></span>
                            </button>

                            <button className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors font-extrabold text-[16px] ${isHomePage ? 'bg-black/5 hover:bg-black/10 text-zinc-900' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                                <MessageCircle size={18} strokeWidth={2.5} className={isHomePage ? 'fill-zinc-900 text-zinc-900' : 'fill-white text-white'} />
                                <span className="hidden sm:inline">Mesajlar</span>
                            </button>

                            {/* Profile Dropdown */}
                            <div className="relative ml-2" ref={profileDropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${isHomePage ? 'bg-black/5 text-zinc-900' : 'bg-white/10 text-white'}`}>
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt={user.fullname} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} strokeWidth={2.5} />
                                        )}
                                    </div>
                                    <ChevronDown size={16} strokeWidth={3} className={isHomePage ? 'text-zinc-900' : 'text-white'} />
                                </button>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-72 bg-[#f4f4f4] rounded-[24px] shadow-xl border border-zinc-100 z-50 overflow-hidden text-zinc-900 animate-in slide-in-from-top-2 fade-in duration-200">

                                        {/* User Info Header */}
                                        <div className="px-5 py-5 bg-[#e9e9e9] flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full bg-zinc-300 text-zinc-600 flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 border-2 border-white shadow-sm">
                                                {user?.avatar ? (
                                                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    user?.fullname?.charAt(0).toUpperCase() || 'E'
                                                )}
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="font-bold text-[15px] text-zinc-900 truncate">{user?.fullname || 'Enes Güler'}</span>
                                            </div>
                                        </div>

                                        <div className="px-3 py-4 space-y-1.5 border-t border-white/50">

                                            {/* Admin Panel – only for admin roles */}
                                            {user?.roleId && ['admin', 'superAdmin', 'saasAdmin'].includes(user.roleId) && (
                                                <Link
                                                    to="/admin" onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-4 px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white transition-colors mb-2"
                                                >
                                                    <LayoutDashboard size={20} strokeWidth={2.5} />
                                                    <span className="font-bold text-[14px]">Yönetim Paneli</span>
                                                </Link>
                                            )}

                                            {/* Biletlerim & Masalarım */}
                                            <Link
                                                to="/profile" state={{ section: 'tickets' }} onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-black/5 transition-colors"
                                            >
                                                <Ticket size={20} strokeWidth={2.5} className="text-zinc-800" />
                                                <span className="font-bold text-[14px] text-zinc-800">Biletlerim & Masalarım</span>
                                            </Link>

                                            {/* Profili Düzenle Toggle */}
                                            <button
                                                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-black/5 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Pencil size={20} strokeWidth={2.5} className="text-zinc-800" />
                                                    <span className="font-bold text-[14px] text-zinc-800">Profili Düzenle</span>
                                                </div>
                                                {profileMenuOpen ? <ChevronUp size={18} strokeWidth={3} className="text-zinc-800" /> : <ChevronDown size={18} strokeWidth={3} className="text-zinc-800" />}
                                            </button>

                                            {profileMenuOpen && (
                                                <div className="pl-6 space-y-0.5">
                                                    <Link
                                                        to="/profile" state={{ section: 'my-info' }} onClick={() => setDropdownOpen(false)}
                                                        className="flex items-center gap-4 px-3 py-2 rounded-xl hover:bg-black/5 transition-colors"
                                                    >
                                                        <div className="w-5 flex justify-center"><User size={18} strokeWidth={2.5} className="text-zinc-800" /></div>
                                                        <span className="font-bold text-[14px] text-zinc-800">Bilgilerim</span>
                                                    </Link>
                                                </div>
                                            )}

                                            {/* Ödeme Bilgileri */}
                                            <Link
                                                to="/profile" state={{ section: 'payment' }} onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-black/5 transition-colors"
                                            >
                                                <CreditCard size={20} strokeWidth={2.5} className="text-zinc-800" />
                                                <span className="font-bold text-[14px] text-zinc-800">Ödeme Bilgilerim</span>
                                            </Link>

                                            {/* Ayarlar Toggle */}
                                            <button
                                                onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
                                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-black/5 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Settings size={20} strokeWidth={2.5} className="text-zinc-800" />
                                                    <span className="font-bold text-[14px] text-zinc-800">Ayarlar</span>
                                                </div>
                                                {settingsMenuOpen ? <ChevronUp size={18} strokeWidth={3} className="text-zinc-800" /> : <ChevronDown size={18} strokeWidth={3} className="text-zinc-800" />}
                                            </button>

                                            {settingsMenuOpen && (
                                                <div className="pl-6 space-y-0.5">
                                                    <Link
                                                        to="/profile" state={{ section: 'update-password' }} onClick={() => setDropdownOpen(false)}
                                                        className="flex items-center gap-4 px-3 py-2 rounded-xl hover:bg-black/5 transition-colors"
                                                    >
                                                        <div className="w-5 flex justify-center"><KeyRound size={18} strokeWidth={2.5} className="text-zinc-800" /></div>
                                                        <span className="font-bold text-[14px] text-zinc-800">Şifre Güncelle</span>
                                                    </Link>
                                                    <Link
                                                        to="/profile" state={{ section: 'delete-account' }} onClick={() => setDropdownOpen(false)}
                                                        className="flex items-center gap-4 px-3 py-2 rounded-xl hover:bg-black/5 transition-colors"
                                                    >
                                                        <div className="w-5 flex justify-center"><UserMinus size={18} strokeWidth={2.5} className="text-zinc-800" /></div>
                                                        <span className="font-bold text-[14px] text-zinc-800">Hesabı Arşivle</span>
                                                    </Link>
                                                    <Link
                                                        to="/profile" state={{ section: 'help' }} onClick={() => setDropdownOpen(false)}
                                                        className="flex items-center gap-4 px-3 py-2 rounded-xl hover:bg-black/5 transition-colors"
                                                    >
                                                        <div className="w-5 flex justify-center"><HelpCircle size={18} strokeWidth={2.5} className="text-zinc-800" /></div>
                                                        <span className="font-bold text-[14px] text-zinc-800">Yardım</span>
                                                    </Link>
                                                </div>
                                            )}

                                            <div className="pt-1 mt-1">
                                                <button
                                                    onClick={() => {
                                                        setDropdownOpen(false);
                                                        handleLogout();
                                                    }}
                                                    className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-black/5 transition-colors"
                                                >
                                                    <LogOut size={20} strokeWidth={2.5} className="text-zinc-800" />
                                                    <span className="font-bold text-[14px] text-zinc-800">Çıkış Yap</span>
                                                </button>
                                            </div>

                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
