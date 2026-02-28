import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Images, MonitorPlay, Globe, ShieldAlert, ChevronRight, Users } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import CarouselSlideManager from '../../components/admin/CarouselSlideManager';
import SupportedCountryManager from '../../components/admin/SupportedCountryManager';
import UserManager from '../../components/admin/UserManager';
import { carouselSlideService, loginCarouselSlideService } from '../../services/masaSettingsService';
import { useUser } from '../../context/UserContext';

const ADMIN_ROLES = ['admin', 'superAdmin', 'saasAdmin'];

const NAV_SECTIONS = [
    {
        id: 'carousel-slides',
        label: 'Ana Sayfa Slaytları',
        icon: Images,
        description: 'Anasayfada gösterilen carousel slaytları',
    },
    {
        id: 'login-carousel-slides',
        label: 'Giriş Slaytları',
        icon: MonitorPlay,
        description: 'Giriş ekranında gösterilen carousel slaytları',
    },
    {
        id: 'supported-countries',
        label: 'Desteklenen Ülkeler',
        icon: Globe,
        description: 'Telefon kodu desteklenen ülkeler',
    },
    {
        id: 'users',
        label: 'Kullanıcı Yönetimi',
        icon: Users,
        description: 'Kullanıcıları listele, düzenle, sil',
    },
];

export default function AdminDashboard() {
    const { user, userLoading } = useUser();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('carousel-slides');

    // Access guard – redirect if not an admin
    useEffect(() => {
        if (userLoading) return;
        if (!user || !ADMIN_ROLES.includes(user.roleId)) {
            navigate('/', { replace: true });
        }
    }, [user, userLoading, navigate]);

    if (!user || !ADMIN_ROLES.includes(user.roleId)) {
        return null; // Will redirect
    }

    const activeNav = NAV_SECTIONS.find(s => s.id === activeSection);

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

                {/* Page Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center shadow-sm">
                        <LayoutDashboard size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">Yönetim Paneli</h1>
                        <p className="text-sm text-zinc-500">Platform ayarları ve içerik yönetimi</p>
                    </div>
                    <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-full">
                        <ShieldAlert size={13} />
                        {user.roleId}
                    </span>
                </div>

                <div className="flex gap-6">
                    {/* Sidebar */}
                    <aside className="w-64 shrink-0">
                        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                            <div className="px-4 py-3 border-b border-zinc-100">
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">MasaSettings</p>
                            </div>
                            <nav className="p-2">
                                {NAV_SECTIONS.map((section) => {
                                    const Icon = section.icon;
                                    const isActive = activeSection === section.id;
                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => setActiveSection(section.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group ${isActive
                                                ? 'bg-zinc-900 text-white shadow-sm'
                                                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                                                }`}
                                        >
                                            <Icon
                                                size={18}
                                                className={isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-700'}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-semibold leading-tight truncate ${isActive ? 'text-white' : ''}`}>
                                                    {section.label}
                                                </p>
                                                <p className={`text-xs mt-0.5 leading-tight truncate ${isActive ? 'text-zinc-300' : 'text-zinc-400'}`}>
                                                    {section.description}
                                                </p>
                                            </div>
                                            {isActive && <ChevronRight size={14} className="text-zinc-400 shrink-0" />}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* Content Panel */}
                    <main className="flex-1 min-w-0">
                        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
                            {activeSection === 'carousel-slides' && (
                                <CarouselSlideManager
                                    service={carouselSlideService}
                                    title="Ana Sayfa Slaytları"
                                />
                            )}
                            {activeSection === 'login-carousel-slides' && (
                                <CarouselSlideManager
                                    service={loginCarouselSlideService}
                                    title="Giriş Ekranı Slaytları"
                                />
                            )}
                            {activeSection === 'supported-countries' && (
                                <SupportedCountryManager />
                            )}
                            {activeSection === 'users' && (
                                <UserManager />
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </Layout>
    );
}
