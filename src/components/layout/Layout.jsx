import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
    return (
        <div id="layout-root" className="min-h-screen text-neutral-900 font-nunito">
            <Header />
            <main className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout;
