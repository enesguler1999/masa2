
import React from 'react';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-neutral-100 z-50 flex items-center justify-between px-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">M</span>
                    </div>
                    <span className="font-extrabold text-xl tracking-tight">masaupp</span>
                </div>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
                    <a href="#" className="hover:text-black transition-colors">Dashboard</a>
                    <a href="#" className="hover:text-black transition-colors">Explore</a>
                    <a href="#" className="hover:text-black transition-colors">Activity</a>
                </nav>
                <div className="flex items-center gap-4">
                    <button className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                    </button>
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                        E
                    </div>
                </div>
            </header>
            <main className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout;
