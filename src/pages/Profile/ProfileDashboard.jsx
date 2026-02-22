import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { ChevronRight } from 'lucide-react';
import Sidebar from '../../components/profile/Sidebar';
import EarningsCard from '../../components/profile/EarningsCard';
import Tabs from '../../components/profile/Tabs';
import EmptyState from '../../components/profile/EmptyState';
import MyInfo from '../../components/profile/MyInfo';
import PaymentInfo from '../../components/profile/PaymentInfo';
import UpdatePassword from '../../components/profile/UpdatePassword';
import DeleteAccount from '../../components/profile/DeleteAccount';
import { authService } from '../../services/authService';

export default function ProfileDashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [activeSection, setActiveSection] = useState('tickets');
    const [activeTab, setActiveTab] = useState('biletlerim');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await authService.getCurrentUser();
                setUser(userData);
            } catch (error) {
                console.error("Failed to fetch user:", error);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center py-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
                </div>
            </Layout>
        );
    }

    const renderContent = () => {
        if (activeSection === 'tickets') {
            return (
                <div className="flex-1 w-full flex flex-col gap-6">
                    <EarningsCard />
                    <div className="bg-white rounded-[20px] shadow-sm border border-zinc-100 overflow-hidden flex flex-col min-h-[500px]">
                        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
                        <div className="flex-1 p-6 flex flex-col">
                            <EmptyState />
                        </div>
                    </div>
                </div>
            );
        } else if (activeSection === 'my-info') {
            return <MyInfo user={user} />;
        } else if (activeSection === 'payment') {
            return <PaymentInfo />;
        } else if (activeSection === 'update-password') {
            return <UpdatePassword user={user} />;
        } else if (activeSection === 'delete-account') {
            return <DeleteAccount user={user} />;
        } else if (activeSection === 'help') {
            return <div className="p-6 bg-white rounded-[20px] shadow-sm border border-zinc-100 min-h-[500px] flex items-center justify-center font-medium text-zinc-500">Yardım Merkezi (Yakında)</div>;
        }
    };

    const sectionNames = {
        'tickets': 'Masalarım & Biletlerim',
        'my-info': 'Bilgilerim',
        'payment': 'Ödeme Bilgilerim',
        'update-password': 'Parolayı Güncelle',
        'delete-account': 'Hesabı Sil',
        'help': 'Yardım'
    };

    return (
        <Layout>
            <div className="max-w-[1100px] mx-auto">
                <div className="flex items-center text-[13px] text-zinc-500 mb-8 space-x-2 font-medium">
                    <span className="hover:text-zinc-800 transition-colors cursor-pointer">Profil</span>
                    <ChevronRight size={14} className="text-zinc-300" />
                    <span className="text-zinc-900">{sectionNames[activeSection]}</span>
                    {activeSection === 'tickets' && (
                        <>
                            <ChevronRight size={14} className="text-zinc-300" />
                            <span className="text-zinc-900 capitalize">{activeTab}</span>
                        </>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="w-full lg:w-72 shrink-0 space-y-6">
                        <Sidebar user={user} activeSection={activeSection} setActiveSection={setActiveSection} />
                    </div>

                    <div className="flex-1 w-full flex flex-col gap-6 animate-in slide-in-from-right-4 fade-in duration-300">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
